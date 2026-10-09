<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Jurnal Memorial</h1>
        <p class="text-muted-foreground mt-1">Template pasangan akun D/K siap pakai untuk Jurnal Umum</p>
      </div>
      <Button variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Tambah Template
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
            :search-fields="['kode', 'nama_transaksi']"
          >
            <template #cell-kode="{ item }">
              <code class="text-xs bg-muted px-1.5 py-0.5 rounded">{{ item.kode }}</code>
            </template>
            <template #cell-jumlah_baris="{ item }">
              {{ item.details.length }} baris
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
      <DialogContent class="sm:max-w-xl max-h-[85vh] overflow-y-auto" @close="formOpen = false">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Template' : 'Tambah Template' }}</DialogTitle>
          <DialogDescription>Minimal satu baris Debet dan satu baris Kredit.</DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="kode">Kode</Label>
              <Input id="kode" v-model="form.kode" placeholder="mis. JM-001" />
              <p v-if="errors.kode" class="text-xs text-destructive">{{ errors.kode }}</p>
            </div>
            <div class="space-y-2">
              <Label for="nama_transaksi">Nama Transaksi</Label>
              <Input id="nama_transaksi" v-model="form.nama_transaksi" placeholder="mis. Setoran Simpanan Pokok" />
              <p v-if="errors.nama_transaksi" class="text-xs text-destructive">{{ errors.nama_transaksi }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="keterangan">Keterangan</Label>
            <Textarea id="keterangan" v-model="form.keterangan" rows="2" />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label>Baris Akun</Label>
              <Button type="button" variant="outline" size="sm" @click="addRow">
                <Plus class="h-3.5 w-3.5 mr-1" /> Tambah Baris
              </Button>
            </div>
            <p v-if="errors.details" class="text-xs text-destructive">{{ errors.details }}</p>

            <div v-for="(row, idx) in form.details" :key="idx" class="flex gap-2 items-start p-3 border border-border rounded-lg">
              <div class="flex-1">
                <SearchableSelect
                  :model-value="row.masterakun_kode"
                  :options="akunOptions"
                  placeholder="Pilih akun..."
                  @update:model-value="(v) => (row.masterakun_kode = String(v ?? ''))"
                />
              </div>
              <div class="w-28">
                <Select v-model="row.karakter_akun">
                  <option value="D">Debet</option>
                  <option value="K">Kredit</option>
                </Select>
              </div>
              <Button
                v-if="form.details.length > 2"
                type="button" variant="ghost" size="icon" class="text-destructive shrink-0"
                @click="form.details.splice(idx, 1)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
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
          <DialogTitle>Hapus Template</DialogTitle>
          <DialogDescription>
            Hapus "{{ toDelete?.nama_transaksi }}"? Tindakan ini tidak dapat dibatalkan.
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
import { jurnalMemorialService, type JurnalMemorial } from '@/services/akuntansi/jurnalMemorialService'
import { masterAkunService, type MasterAkunNode } from '@/services/akuntansi/masterAkunService'
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
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const { success, error } = useToast()

const items = ref<JurnalMemorial[]>([])
const loading = ref(false)
const akunOptions = ref<{ label: string; value: string }[]>([])

const columns = [
  { key: 'kode', label: 'Kode', sortable: true, width: '28' },
  { key: 'nama_transaksi', label: 'Nama Transaksi', sortable: true },
  { key: 'jumlah_baris', label: 'Baris' },
  { key: 'is_aktif', label: 'Status' }
]

const formOpen = ref(false)
const deleteOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const toDelete = ref<JurnalMemorial | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const errors = reactive<Record<string, string>>({})

const form = reactive({
  kode: '',
  nama_transaksi: '',
  keterangan: '',
  is_aktif: true,
  details: [
    { masterakun_kode: '', karakter_akun: 'D' as 'D' | 'K' },
    { masterakun_kode: '', karakter_akun: 'K' as 'D' | 'K' }
  ]
})

const actions = computed(() => [
  { key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const, handler: (item: JurnalMemorial) => openEdit(item) },
  { key: 'delete', icon: Trash2, variant: 'destructive' as const, size: 'sm' as const, handler: (item: JurnalMemorial) => openDelete(item) }
])

function flattenFinal(nodes: MasterAkunNode[]): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = []
  for (const node of nodes) {
    if (node.tipe_akun?.kode === 'final') {
      result.push({ label: `${node.full_kode} — ${node.nama_akun}`, value: node.kode_akun })
    }
    if (node.children?.length) result.push(...flattenFinal(node.children))
  }
  return result
}

const loadAkunOptions = async () => {
  const res = await masterAkunService.tree()
  akunOptions.value = flattenFinal(res.data)
}

const loadItems = async () => {
  loading.value = true
  try {
    const res = await jurnalMemorialService.list({ rows: 100 })
    items.value = res.data
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat daftar jurnal memorial' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.kode = ''
  form.nama_transaksi = ''
  form.keterangan = ''
  form.is_aktif = true
  form.details = [
    { masterakun_kode: '', karakter_akun: 'D' },
    { masterakun_kode: '', karakter_akun: 'K' }
  ]
  Object.keys(errors).forEach((k) => delete errors[k])
}

const addRow = () => {
  form.details.push({ masterakun_kode: '', karakter_akun: 'D' })
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (item: JurnalMemorial) => {
  isEditing.value = true
  editingId.value = item.id
  form.kode = item.kode
  form.nama_transaksi = item.nama_transaksi
  form.keterangan = item.keterangan || ''
  form.is_aktif = item.is_aktif
  form.details = item.details.map((d) => ({ masterakun_kode: d.masterakun_kode, karakter_akun: d.karakter_akun }))
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (item: JurnalMemorial) => {
  toDelete.value = item
  deleteOpen.value = true
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  const payload = {
    kode: form.kode,
    nama_transaksi: form.nama_transaksi,
    keterangan: form.keterangan || null,
    is_aktif: form.is_aktif,
    details: form.details.filter((d) => d.masterakun_kode)
  }

  try {
    if (isEditing.value && editingId.value) {
      await jurnalMemorialService.update(editingId.value, payload)
      success('Berhasil', { description: 'Template berhasil diperbarui' })
    } else {
      await jurnalMemorialService.create(payload)
      success('Berhasil', { description: 'Template berhasil ditambahkan' })
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
    await jurnalMemorialService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Template berhasil dihapus' })
    deleteOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadItems(), loadAkunOptions()])
})
</script>
