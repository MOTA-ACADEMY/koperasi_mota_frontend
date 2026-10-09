<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Buku Periode</h1>
        <p class="text-muted-foreground mt-1">
          Kelola tahun buku, periode aktif, dan proses tutup buku
        </p>
      </div>
      <Button variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Tambah Periode
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
            :search-fields="['tahun_periode']"
          >
            <template #cell-tahun_periode="{ item }">
              <span class="font-semibold">{{ item.tahun_periode }}</span>
            </template>
            <template #cell-rentang="{ item }">
              <span class="text-sm">
                {{ monthName(item.bulan_awal_periode) }} {{ item.tahun_periode }}
                &ndash;
                {{ monthName(item.bulan_akhir_periode) }} {{ item.tahun_akhir_periode }}
                <span class="text-muted-foreground">({{ item.lama_periode_bulan }} bln)</span>
              </span>
            </template>
            <template #cell-bulan_saldo_awal="{ item }">
              {{ monthName(item.bulan_saldo_awal) }}
            </template>
            <template #cell-status="{ item }">
              <div class="flex gap-1.5">
                <Badge :variant="item.is_aktif ? 'green' : 'secondary'">
                  {{ item.is_aktif ? 'Aktif' : 'Nonaktif' }}
                </Badge>
                <Badge v-if="item.is_closed" variant="red">Tertutup</Badge>
              </div>
            </template>
          </DataTable>
        </div>
      </CardContent>
    </Card>

    <!-- Form Dialog -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-md" @close="formOpen = false">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Buku Periode' : 'Tambah Buku Periode' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Periode yang sudah ditutup tidak dapat diubah.' : 'Buat tahun buku baru.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="tahun_periode">Tahun Periode</Label>
            <Input id="tahun_periode" v-model.number="form.tahun_periode" type="number" placeholder="2027" />
            <p v-if="errors.tahun_periode" class="text-xs text-destructive">{{ errors.tahun_periode }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Bulan Awal Periode</Label>
              <Select v-model.number="form.bulan_awal_periode">
                <option v-for="(nama, idx) in monthNames" :key="idx" :value="idx + 1">{{ nama }}</option>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Bulan Saldo Awal</Label>
              <Select v-model.number="form.bulan_saldo_awal">
                <option v-for="(nama, idx) in monthNames" :key="idx" :value="idx + 1">{{ nama }}</option>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="lama_periode_bulan">Lama Periode (bulan)</Label>
            <Input id="lama_periode_bulan" v-model.number="form.lama_periode_bulan" type="number" min="1" max="24" />
            <p v-if="errors.lama_periode_bulan" class="text-xs text-destructive">{{ errors.lama_periode_bulan }}</p>
          </div>
          <div class="space-y-2">
            <Label for="keterangan">Keterangan</Label>
            <Textarea id="keterangan" v-model="form.keterangan" rows="2" />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox :checked="form.is_aktif" @update:checked="(v) => (form.is_aktif = v)" />
            <Label class="cursor-pointer" @click="form.is_aktif = !form.is_aktif">
              Jadikan periode aktif (periode aktif lain otomatis dinonaktifkan)
            </Label>
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
          <DialogTitle>Hapus Buku Periode</DialogTitle>
          <DialogDescription>
            Hapus periode {{ toDelete?.tahun_periode }}? Tindakan ini tidak dapat dibatalkan.
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

    <!-- Tutup Buku Dialog -->
    <Dialog v-model:open="tutupBukuOpen">
      <DialogContent class="sm:max-w-md" @close="tutupBukuOpen = false">
        <DialogHeader>
          <DialogTitle>Tutup Buku {{ toTutupBuku?.tahun_periode }}</DialogTitle>
          <DialogDescription>
            Periode ini akan dinonaktifkan & dikunci. Periode {{ (toTutupBuku?.tahun_periode ?? 0) + 1 }} akan
            dibuat/diaktifkan; kalau belum ada, seluruh Master Akun & saldo akhir periode ini otomatis disalin
            sebagai saldo awalnya. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="tutupBukuOpen = false">Batal</Button>
          <Button variant="destructive" :disabled="tutupBukuLoading" @click="confirmTutupBuku">
            {{ tutupBukuLoading ? 'Memproses...' : 'Ya, Tutup Buku' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Pencil, Trash2, CheckCircle2, Lock } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { bukuPeriodeService, type BukuPeriode } from '@/services/akuntansi/bukuPeriodeService'
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
import Textarea from '@/components/ui/Textarea.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const { success, error } = useToast()

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const monthName = (n: number) => monthNames[n - 1] || String(n)

const items = ref<BukuPeriode[]>([])
const loading = ref(false)

const columns = [
  { key: 'tahun_periode', label: 'Tahun', sortable: true, width: '20' },
  { key: 'rentang', label: 'Rentang Periode' },
  { key: 'bulan_saldo_awal', label: 'Bulan Saldo Awal' },
  { key: 'status', label: 'Status' }
]

const formOpen = ref(false)
const deleteOpen = ref(false)
const tutupBukuOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const toDelete = ref<BukuPeriode | null>(null)
const toTutupBuku = ref<BukuPeriode | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const tutupBukuLoading = ref(false)
const errors = reactive<Record<string, string>>({})

const currentYear = new Date().getFullYear()
const form = reactive({
  tahun_periode: currentYear,
  bulan_awal_periode: 1,
  bulan_saldo_awal: 1,
  lama_periode_bulan: 12,
  keterangan: '',
  is_aktif: false
})

const actions = computed(() => [
  {
    key: 'aktifkan',
    icon: CheckCircle2,
    variant: 'outline' as const,
    size: 'sm' as const,
    disabled: (item: BukuPeriode) => item.is_aktif || item.is_closed,
    handler: (item: BukuPeriode) => aktifkan(item)
  },
  {
    key: 'tutup-buku',
    icon: Lock,
    variant: 'outline' as const,
    size: 'sm' as const,
    disabled: (item: BukuPeriode) => !item.is_aktif || item.is_closed,
    handler: (item: BukuPeriode) => openTutupBuku(item)
  },
  {
    key: 'edit',
    icon: Pencil,
    variant: 'outline' as const,
    size: 'sm' as const,
    disabled: (item: BukuPeriode) => item.is_closed,
    handler: (item: BukuPeriode) => openEdit(item)
  },
  {
    key: 'delete',
    icon: Trash2,
    variant: 'destructive' as const,
    size: 'sm' as const,
    disabled: (item: BukuPeriode) => item.is_aktif || item.is_closed,
    handler: (item: BukuPeriode) => openDelete(item)
  }
])

const loadItems = async () => {
  loading.value = true
  try {
    items.value = await bukuPeriodeService.list()
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat daftar buku periode' })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.tahun_periode = currentYear
  form.bulan_awal_periode = 1
  form.bulan_saldo_awal = 1
  form.lama_periode_bulan = 12
  form.keterangan = ''
  form.is_aktif = false
  Object.keys(errors).forEach((k) => delete errors[k])
}

const openCreate = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  formOpen.value = true
}

const openEdit = (item: BukuPeriode) => {
  isEditing.value = true
  editingId.value = item.id
  form.tahun_periode = item.tahun_periode
  form.bulan_awal_periode = item.bulan_awal_periode
  form.bulan_saldo_awal = item.bulan_saldo_awal
  form.lama_periode_bulan = item.lama_periode_bulan
  form.keterangan = item.keterangan || ''
  form.is_aktif = item.is_aktif
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (item: BukuPeriode) => {
  toDelete.value = item
  deleteOpen.value = true
}

const openTutupBuku = (item: BukuPeriode) => {
  toTutupBuku.value = item
  tutupBukuOpen.value = true
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  const payload = {
    tahun_periode: form.tahun_periode,
    bulan_awal_periode: form.bulan_awal_periode,
    bulan_saldo_awal: form.bulan_saldo_awal,
    lama_periode_bulan: form.lama_periode_bulan,
    keterangan: form.keterangan || null,
    is_aktif: form.is_aktif
  }

  try {
    if (isEditing.value && editingId.value) {
      await bukuPeriodeService.update(editingId.value, payload)
      success('Berhasil', { description: 'Buku periode berhasil diperbarui' })
    } else {
      await bukuPeriodeService.create(payload)
      success('Berhasil', { description: 'Buku periode berhasil ditambahkan' })
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
    await bukuPeriodeService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Buku periode berhasil dihapus' })
    deleteOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    deleting.value = false
  }
}

const aktifkan = async (item: BukuPeriode) => {
  try {
    await bukuPeriodeService.aktifkan(item.id)
    success('Berhasil', { description: `Periode ${item.tahun_periode} kini aktif` })
    await loadItems()
  } catch (err: any) {
    error('Gagal', { description: err?.message || 'Terjadi kesalahan' })
  }
}

const confirmTutupBuku = async () => {
  if (!toTutupBuku.value) return
  tutupBukuLoading.value = true
  try {
    const result = await bukuPeriodeService.tutupBuku(toTutupBuku.value.id)
    success('Tutup Buku Berhasil', { description: result.message })
    tutupBukuOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal Tutup Buku', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    tutupBukuLoading.value = false
  }
}

onMounted(loadItems)
</script>
