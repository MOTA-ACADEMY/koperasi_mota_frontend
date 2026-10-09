<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Jurnal Umum</h1>
        <p class="text-muted-foreground mt-1">Transaksi jurnal — draft harus diposting agar masuk buku besar</p>
      </div>
      <Button variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Buat Jurnal
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-wrap gap-2 items-center pt-2">
          <Button variant="outline" size="sm" :class="statusFilter === 'all' ? 'bg-primary text-primary-foreground' : ''" @click="setStatusFilter('all')">Semua</Button>
          <Button variant="outline" size="sm" :class="statusFilter === 'draft' ? 'bg-red-500 text-white' : ''" @click="setStatusFilter('draft')">Draft</Button>
          <Button variant="outline" size="sm" :class="statusFilter === 'posted' ? 'bg-green-500 text-white' : ''" @click="setStatusFilter('posted')">Posted</Button>
          <Input v-model="search" placeholder="Cari nomor / uraian..." class="w-56 ml-auto" @keyup.enter="loadItems" />
          <Button variant="outline" size="sm" @click="loadItems">Cari</Button>
        </div>
      </CardContent>
    </Card>

    <!-- List -->
    <Card>
      <CardContent class="p-4">
        <div class="pt-4">
          <DataTable :columns="columns" :actions="rowActions" :data="items" :loading="loading" :searchable="false">
            <template #cell-tanggal_transaksi="{ item }">{{ formatDate(item.tanggal_transaksi) }}</template>
            <template #cell-total="{ item }">{{ formatCurrency(item.total_debit) }}</template>
            <template #cell-status="{ item }">
              <Badge :variant="item.is_posting ? 'green' : 'secondary'">
                {{ item.is_posting ? 'Posted' : 'Draft' }}
              </Badge>
            </template>
          </DataTable>
        </div>
      </CardContent>
    </Card>

    <!-- Form Dialog -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-2xl max-h-[85vh] overflow-y-auto" @close="formOpen = false">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Jurnal Umum' : 'Buat Jurnal Umum' }}</DialogTitle>
          <DialogDescription>Total Debet harus sama dengan Total Kredit.</DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="!isEditing" class="space-y-2">
            <Label>Terapkan dari Jurnal Memorial (opsional)</Label>
            <SearchableSelect
              :model-value="selectedMemorialId ?? undefined"
              :options="memorialOptions"
              placeholder="Pilih template..."
              @update:model-value="applyMemorial"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="tanggal_transaksi">Tanggal Transaksi</Label>
              <Input id="tanggal_transaksi" v-model="form.tanggal_transaksi" type="date" />
              <p v-if="errors.tanggal_transaksi" class="text-xs text-destructive">{{ errors.tanggal_transaksi }}</p>
            </div>
            <div class="space-y-2">
              <Label for="kode_bantu">Kode Bantu (opsional)</Label>
              <Input id="kode_bantu" v-model="form.kode_bantu" placeholder="mis. ref dokumen" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="uraian">Uraian</Label>
            <Textarea id="uraian" v-model="form.uraian" rows="2" />
            <p v-if="errors.uraian" class="text-xs text-destructive">{{ errors.uraian }}</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label>Baris Jurnal</Label>
              <Button type="button" variant="outline" size="sm" @click="addRow">
                <Plus class="h-3.5 w-3.5 mr-1" /> Tambah Baris
              </Button>
            </div>
            <p v-if="errors.details" class="text-xs text-destructive">{{ errors.details }}</p>

            <div v-for="(row, idx) in form.details" :key="idx" class="flex gap-2 items-start p-3 border border-border rounded-lg">
              <div class="flex-1">
                <SearchableSelect
                  :model-value="row.master_akun_id ?? undefined"
                  :options="akunOptions"
                  placeholder="Pilih akun..."
                  @update:model-value="(v) => (row.master_akun_id = (v as number) ?? null)"
                />
              </div>
              <div class="w-24">
                <Select v-model="row.kode_dk">
                  <option value="D">Debet</option>
                  <option value="K">Kredit</option>
                </Select>
              </div>
              <div class="w-36">
                <Input
                  type="number" min="0" placeholder="Nominal"
                  :model-value="row.nominal"
                  @update:model-value="(v) => (row.nominal = Number(v))"
                  class="text-right"
                />
              </div>
              <Button
                v-if="form.details.length > 2"
                type="button" variant="ghost" size="icon" class="text-destructive shrink-0"
                @click="form.details.splice(idx, 1)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>

            <div class="flex justify-end gap-6 text-sm pt-2 border-t border-border">
              <span>Debet: <strong>{{ formatCurrency(totalDebit) }}</strong></span>
              <span>Kredit: <strong>{{ formatCurrency(totalKredit) }}</strong></span>
              <Badge :variant="isBalanced ? 'green' : 'red'">{{ isBalanced ? 'Seimbang' : 'Belum Seimbang' }}</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="formOpen = false">Batal</Button>
            <Button type="submit" variant="primary" :disabled="submitting || !isBalanced">
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
          <DialogTitle>Hapus Jurnal</DialogTitle>
          <DialogDescription>Hapus jurnal "{{ toDelete?.nomor_transaksi }}"? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Send, Undo2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { jurnalUmumService, type JurnalUmum } from '@/services/akuntansi/jurnalUmumService'
import { jurnalMemorialService } from '@/services/akuntansi/jurnalMemorialService'
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

const { success, error } = useToast()

const items = ref<JurnalUmum[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref<'all' | 'draft' | 'posted'>('all')
const akunOptions = ref<{ label: string; value: number }[]>([])
const memorialOptions = ref<{ label: string; value: number }[]>([])
const selectedMemorialId = ref<number | null>(null)

const columns = [
  { key: 'nomor_transaksi', label: 'No. Jurnal', sortable: true },
  { key: 'tanggal_transaksi', label: 'Tanggal', sortable: true },
  { key: 'uraian', label: 'Uraian' },
  { key: 'total', label: 'Nominal' },
  { key: 'status', label: 'Status' }
]

const formOpen = ref(false)
const deleteOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const toDelete = ref<JurnalUmum | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const errors = reactive<Record<string, string>>({})

const form = reactive({
  tanggal_transaksi: new Date().toISOString().slice(0, 10),
  uraian: '',
  kode_bantu: '',
  jurnal_memorial_id: null as number | null,
  details: [
    { master_akun_id: null as number | null, kode_dk: 'D' as 'D' | 'K', nominal: 0 },
    { master_akun_id: null as number | null, kode_dk: 'K' as 'D' | 'K', nominal: 0 }
  ]
})

const totalDebit = computed(() => form.details.filter((d) => d.kode_dk === 'D').reduce((s, d) => s + (Number(d.nominal) || 0), 0))
const totalKredit = computed(() => form.details.filter((d) => d.kode_dk === 'K').reduce((s, d) => s + (Number(d.nominal) || 0), 0))
const isBalanced = computed(() => totalDebit.value > 0 && Math.abs(totalDebit.value - totalKredit.value) < 0.01)

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0)
const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID')

const rowActions = computed(() => [
  {
    key: 'posting', icon: Send, variant: 'outline' as const, size: 'sm' as const,
    disabled: (item: JurnalUmum) => item.is_posting,
    handler: (item: JurnalUmum) => posting(item)
  },
  {
    key: 'unposting', icon: Undo2, variant: 'outline' as const, size: 'sm' as const,
    disabled: (item: JurnalUmum) => !item.is_posting,
    handler: (item: JurnalUmum) => unposting(item)
  },
  {
    key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const,
    disabled: (item: JurnalUmum) => item.is_posting,
    handler: (item: JurnalUmum) => openEdit(item)
  },
  {
    key: 'delete', icon: Trash2, variant: 'destructive' as const, size: 'sm' as const,
    disabled: (item: JurnalUmum) => item.is_posting,
    handler: (item: JurnalUmum) => openDelete(item)
  }
])

function flattenFinal(nodes: MasterAkunNode[]): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = []
  for (const node of nodes) {
    if (node.tipe_akun?.kode === 'final') {
      result.push({ label: `${node.full_kode} — ${node.nama_akun} (${node.karakter_akun})`, value: node.id })
    }
    if (node.children?.length) result.push(...flattenFinal(node.children))
  }
  return result
}

const loadAkunOptions = async () => {
  const res = await masterAkunService.tree()
  akunOptions.value = flattenFinal(res.data)
}

const loadMemorialOptions = async () => {
  const res = await jurnalMemorialService.list({ is_aktif: true, rows: 100 })
  memorialOptions.value = res.data.map((m) => ({ label: `${m.kode} — ${m.nama_transaksi}`, value: m.id }))
}

const loadItems = async () => {
  loading.value = true
  try {
    const res = await jurnalUmumService.list({
      search: search.value || undefined,
      is_posting: statusFilter.value === 'all' ? undefined : statusFilter.value === 'posted',
      rows: 50
    })
    items.value = res.data
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat jurnal umum' })
  } finally {
    loading.value = false
  }
}

const setStatusFilter = (f: 'all' | 'draft' | 'posted') => {
  statusFilter.value = f
  loadItems()
}

const resetForm = () => {
  form.tanggal_transaksi = new Date().toISOString().slice(0, 10)
  form.uraian = ''
  form.kode_bantu = ''
  form.jurnal_memorial_id = null
  form.details = [
    { master_akun_id: null, kode_dk: 'D', nominal: 0 },
    { master_akun_id: null, kode_dk: 'K', nominal: 0 }
  ]
  selectedMemorialId.value = null
  Object.keys(errors).forEach((k) => delete errors[k])
}

const addRow = () => {
  form.details.push({ master_akun_id: null, kode_dk: 'D', nominal: 0 })
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (item: JurnalUmum) => {
  isEditing.value = true
  editingId.value = item.id
  form.tanggal_transaksi = item.tanggal_transaksi
  form.uraian = item.uraian
  form.kode_bantu = item.kode_bantu || ''
  form.jurnal_memorial_id = item.jurnal_memorial_id
  form.details = item.details.map((d) => ({ master_akun_id: d.master_akun_id, kode_dk: d.kode_dk, nominal: d.nominal }))
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (item: JurnalUmum) => {
  toDelete.value = item
  deleteOpen.value = true
}

const applyMemorial = async (value: string | number | undefined) => {
  if (!value) {
    selectedMemorialId.value = null
    return
  }
  selectedMemorialId.value = Number(value)
  try {
    const result = await jurnalUmumService.dariMemorial(Number(value))
    form.jurnal_memorial_id = result.jurnal_memorial_id
    if (!form.uraian) form.uraian = result.uraian_sugesti
    form.details = result.details.map((d) => ({ master_akun_id: d.master_akun_id, kode_dk: d.kode_dk, nominal: 0 }))
  } catch (err: any) {
    error('Gagal Menerapkan Template', {
      description: err?.data?.errors?.jurnal_memorial_id?.[0] || err?.message || 'Terjadi kesalahan'
    })
  }
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  const payload = {
    tanggal_transaksi: form.tanggal_transaksi,
    uraian: form.uraian,
    kode_bantu: form.kode_bantu || null,
    jurnal_memorial_id: form.jurnal_memorial_id,
    details: form.details
      .filter((d) => d.master_akun_id)
      .map((d) => ({ master_akun_id: d.master_akun_id as number, kode_dk: d.kode_dk, nominal: Number(d.nominal) }))
  }

  try {
    if (isEditing.value && editingId.value) {
      await jurnalUmumService.update(editingId.value, payload)
      success('Berhasil', { description: 'Jurnal berhasil diperbarui' })
    } else {
      await jurnalUmumService.create(payload)
      success('Berhasil', { description: 'Jurnal berhasil dibuat' })
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
    await jurnalUmumService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Jurnal berhasil dihapus' })
    deleteOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    deleting.value = false
  }
}

const posting = async (item: JurnalUmum) => {
  try {
    await jurnalUmumService.posting(item.id)
    success('Berhasil', { description: `Jurnal ${item.nomor_transaksi} berhasil diposting` })
    await loadItems()
  } catch (err: any) {
    error('Gagal Posting', { description: err?.message || 'Terjadi kesalahan' })
  }
}

const unposting = async (item: JurnalUmum) => {
  try {
    await jurnalUmumService.unposting(item.id)
    success('Berhasil', { description: `Posting jurnal ${item.nomor_transaksi} dibatalkan` })
    await loadItems()
  } catch (err: any) {
    error('Gagal Unposting', { description: err?.message || 'Terjadi kesalahan' })
  }
}

onMounted(async () => {
  await Promise.all([loadItems(), loadAkunOptions(), loadMemorialOptions()])
})
</script>
