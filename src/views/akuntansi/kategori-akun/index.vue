<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Kategori Akun</h1>
        <p class="text-muted-foreground mt-1">
          Aktiva, Kewajiban, Ekuitas, Pendapatan, Beban — dasar pengelompokan laporan
        </p>
      </div>
      <Button variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Tambah Kategori
      </Button>
    </div>

    <Card>
      <CardContent class="p-4">
        <div class="pt-4">
          <DataTable
            :columns="columns"
            :actions="actions"
            :data="items"
            :loading="loading"
            searchable
            :search-fields="['kode', 'nama_kategori']"
          >
            <template #cell-kode="{ item }">
              <code class="text-xs bg-muted px-1.5 py-0.5 rounded">{{ item.kode }}</code>
            </template>
            <template #cell-dk_kode="{ item }">
              <Badge variant="outline">{{ item.dk_label }}</Badge>
            </template>
            <template #cell-is_aktif="{ item }">
              <Badge :variant="item.is_aktif ? 'green' : 'red'">
                {{ item.is_aktif ? 'Aktif' : 'Nonaktif' }}
              </Badge>
            </template>
          </DataTable>
        </div>
      </CardContent>
    </Card>

    <!-- Form Dialog -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-md" @close="formOpen = false">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Kategori Akun' : 'Tambah Kategori Akun' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Perbarui data kategori akun.' : 'Kode tidak dapat diubah setelah dibuat.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="kode">Kode</Label>
            <Input id="kode" v-model="form.kode" placeholder="mis. pendapatan_lain" :disabled="isEditing" />
            <p v-if="errors.kode" class="text-xs text-destructive">{{ errors.kode }}</p>
          </div>
          <div class="space-y-2">
            <Label for="nama_kategori">Nama Kategori</Label>
            <Input id="nama_kategori" v-model="form.nama_kategori" placeholder="mis. Pendapatan Lain-lain" />
            <p v-if="errors.nama_kategori" class="text-xs text-destructive">{{ errors.nama_kategori }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Saldo Normal</Label>
              <Select v-model="form.dk_kode">
                <option value="D">Debet</option>
                <option value="K">Kredit</option>
              </Select>
              <p v-if="errors.dk_kode" class="text-xs text-destructive">{{ errors.dk_kode }}</p>
            </div>
            <div class="space-y-2">
              <Label for="urutan">Urutan</Label>
              <Input id="urutan" v-model.number="form.urutan" type="number" min="0" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox :checked="form.is_aktif" @update:checked="(v) => (form.is_aktif = v)" />
            <Label class="cursor-pointer" @click="form.is_aktif = !form.is_aktif">Aktif</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="formOpen = false">Batal</Button>
            <Button type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog v-model:open="deleteOpen">
      <DialogContent class="sm:max-w-sm" @close="deleteOpen = false">
        <DialogHeader>
          <DialogTitle>Hapus Kategori Akun</DialogTitle>
          <DialogDescription>
            Hapus "{{ toDelete?.nama_kategori }}"? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteOpen = false">Batal</Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Menghapus...' : 'Hapus' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { kategoriAkunService, type KategoriAkun } from '@/services/akuntansi/kategoriAkunService'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const { success, error } = useToast()

const items = ref<KategoriAkun[]>([])
const loading = ref(false)

const columns = [
  { key: 'kode', label: 'Kode', sortable: true, width: '32' },
  { key: 'nama_kategori', label: 'Nama Kategori', sortable: true },
  { key: 'dk_kode', label: 'Saldo Normal' },
  { key: 'urutan', label: 'Urutan', sortable: true },
  { key: 'is_aktif', label: 'Status' }
]

const formOpen = ref(false)
const deleteOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const toDelete = ref<KategoriAkun | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const errors = reactive<Record<string, string>>({})

const form = reactive({
  kode: '',
  nama_kategori: '',
  dk_kode: 'D' as 'D' | 'K',
  urutan: 0,
  is_aktif: true
})

const actions = computed(() => [
  { key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const, handler: (item: KategoriAkun) => openEdit(item) },
  { key: 'delete', icon: Trash2, variant: 'destructive' as const, size: 'sm' as const, handler: (item: KategoriAkun) => openDelete(item) }
])

const loadItems = async () => {
  loading.value = true
  try {
    items.value = await kategoriAkunService.list()
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat daftar kategori akun' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.kode = ''
  form.nama_kategori = ''
  form.dk_kode = 'D'
  form.urutan = (items.value.length + 1) * 10
  form.is_aktif = true
  Object.keys(errors).forEach((k) => delete errors[k])
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (item: KategoriAkun) => {
  isEditing.value = true
  editingId.value = item.id
  form.kode = item.kode
  form.nama_kategori = item.nama_kategori
  form.dk_kode = item.dk_kode
  form.urutan = item.urutan
  form.is_aktif = item.is_aktif
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (item: KategoriAkun) => {
  toDelete.value = item
  deleteOpen.value = true
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    const payload = {
      nama_kategori: form.nama_kategori,
      dk_kode: form.dk_kode,
      urutan: form.urutan,
      is_aktif: form.is_aktif
    }

    if (isEditing.value && editingId.value) {
      await kategoriAkunService.update(editingId.value, payload)
      success('Berhasil', { description: 'Kategori akun berhasil diperbarui' })
    } else {
      await kategoriAkunService.create({ ...payload, kode: form.kode })
      success('Berhasil', { description: 'Kategori akun berhasil ditambahkan' })
    }
    formOpen.value = false
    await loadItems()
  } catch (err: any) {
    const apiErrors = err?.data?.errors
    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, msgs]) => {
        errors[key] = Array.isArray(msgs) ? (msgs[0] as string) : String(msgs)
      })
    } else {
      error('Gagal Menyimpan', { description: err?.message || 'Terjadi kesalahan' })
    }
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async () => {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await kategoriAkunService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Kategori akun berhasil dihapus' })
    deleteOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    deleting.value = false
  }
}

onMounted(loadItems)
</script>
