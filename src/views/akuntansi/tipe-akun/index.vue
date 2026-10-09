<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tipe Akun</h1>
        <p class="text-muted-foreground mt-1">
          Kategori vs Final — menentukan akun mana yang boleh dijurnal langsung
        </p>
      </div>
      <Button variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Tambah Tipe Akun
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
            :search-fields="['kode', 'nama_tipe']"
          >
            <template #cell-kode="{ item }">
              <code class="text-xs bg-muted px-1.5 py-0.5 rounded">{{ item.kode }}</code>
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
          <DialogTitle>{{ isEditing ? 'Edit Tipe Akun' : 'Tambah Tipe Akun' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Perbarui data tipe akun.' : 'Kode tidak dapat diubah setelah dibuat.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="kode">Kode</Label>
            <Input
              id="kode"
              v-model="form.kode"
              placeholder="mis. subtotal"
              :disabled="isEditing"
            />
            <p v-if="errors.kode" class="text-xs text-destructive">{{ errors.kode }}</p>
          </div>
          <div class="space-y-2">
            <Label for="nama_tipe">Nama Tipe</Label>
            <Input id="nama_tipe" v-model="form.nama_tipe" placeholder="mis. Sub Total" />
            <p v-if="errors.nama_tipe" class="text-xs text-destructive">{{ errors.nama_tipe }}</p>
          </div>
          <div class="space-y-2">
            <Label for="keterangan">Keterangan</Label>
            <Textarea id="keterangan" v-model="form.keterangan" rows="3" />
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
          <DialogTitle>Hapus Tipe Akun</DialogTitle>
          <DialogDescription>
            Hapus "{{ toDelete?.nama_tipe }}"? Tindakan ini tidak dapat dibatalkan.
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
import { tipeAkunService, type TipeAkun } from '@/services/akuntansi/tipeAkunService'
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
import Textarea from '@/components/ui/Textarea.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const { success, error } = useToast()

const items = ref<TipeAkun[]>([])
const loading = ref(false)

const columns = [
  { key: 'kode', label: 'Kode', sortable: true, width: '32' },
  { key: 'nama_tipe', label: 'Nama Tipe', sortable: true },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'is_aktif', label: 'Status' }
]

const formOpen = ref(false)
const deleteOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const toDelete = ref<TipeAkun | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const errors = reactive<Record<string, string>>({})

const form = reactive({
  kode: '',
  nama_tipe: '',
  keterangan: '',
  is_aktif: true
})

const actions = computed(() => [
  { key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const, handler: (item: TipeAkun) => openEdit(item) },
  { key: 'delete', icon: Trash2, variant: 'destructive' as const, size: 'sm' as const, handler: (item: TipeAkun) => openDelete(item) }
])

const loadItems = async () => {
  loading.value = true
  try {
    items.value = await tipeAkunService.list()
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat daftar tipe akun' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.kode = ''
  form.nama_tipe = ''
  form.keterangan = ''
  form.is_aktif = true
  Object.keys(errors).forEach((k) => delete errors[k])
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (item: TipeAkun) => {
  isEditing.value = true
  editingId.value = item.id
  form.kode = item.kode
  form.nama_tipe = item.nama_tipe
  form.keterangan = item.keterangan || ''
  form.is_aktif = item.is_aktif
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (item: TipeAkun) => {
  toDelete.value = item
  deleteOpen.value = true
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    if (isEditing.value && editingId.value) {
      await tipeAkunService.update(editingId.value, {
        nama_tipe: form.nama_tipe,
        keterangan: form.keterangan || null,
        is_aktif: form.is_aktif
      })
      success('Berhasil', { description: 'Tipe akun berhasil diperbarui' })
    } else {
      await tipeAkunService.create({
        kode: form.kode,
        nama_tipe: form.nama_tipe,
        keterangan: form.keterangan || null,
        is_aktif: form.is_aktif
      })
      success('Berhasil', { description: 'Tipe akun berhasil ditambahkan' })
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
    await tipeAkunService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Tipe akun berhasil dihapus' })
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
