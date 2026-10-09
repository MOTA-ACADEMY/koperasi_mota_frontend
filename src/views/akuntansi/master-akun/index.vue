<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Master Akun</h1>
        <p class="text-muted-foreground mt-1">Bagan akun (COA) — dikelola per buku periode</p>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="selectedPeriodeIdStr" @change="loadTree" class="w-40">
          <option v-for="p in periodes" :key="p.id" :value="String(p.id)">{{ p.tahun_periode }}</option>
        </Select>
        <Button variant="green" class="gap-2" :disabled="!selectedPeriodeId" @click="openCreate(null)">
          <Plus class="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="p-4">
        <div v-if="loading" class="py-16 text-center text-sm text-muted-foreground">Memuat...</div>
        <div v-else-if="tree.length === 0" class="py-16 text-center text-sm text-muted-foreground">
          {{ selectedPeriodeId ? 'Belum ada master akun untuk periode ini.' : 'Pilih buku periode terlebih dahulu.' }}
        </div>
        <div v-else class="space-y-0.5">
          <TreeNode
            v-for="node in tree"
            :key="node.id"
            :node="node"
            :depth="0"
            @add-child="(n) => openCreate(n)"
            @edit="openEdit"
            @delete="openDelete"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Form Dialog -->
    <Dialog v-model:open="formOpen">
      <DialogContent class="sm:max-w-lg" @close="formOpen = false">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Akun' : 'Tambah Akun' }}</DialogTitle>
          <DialogDescription>
            {{ parentNode ? `Induk: ${parentNode.full_kode} — ${parentNode.nama_akun}` : 'Akun tanpa induk (root).' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="kode_akun">Kode Akun</Label>
              <Input id="kode_akun" v-model="form.kode_akun" placeholder="mis. 001" />
              <p v-if="errors.kode_akun" class="text-xs text-destructive">{{ errors.kode_akun }}</p>
            </div>
            <div class="space-y-2">
              <Label for="full_kode">Full Kode</Label>
              <Input id="full_kode" v-model="form.full_kode" placeholder="mis. 1.1.01.001" />
              <p v-if="errors.full_kode" class="text-xs text-destructive">{{ errors.full_kode }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="nama_akun">Nama Akun</Label>
            <Input id="nama_akun" v-model="form.nama_akun" placeholder="mis. Kas Besar" />
            <p v-if="errors.nama_akun" class="text-xs text-destructive">{{ errors.nama_akun }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Tipe Akun</Label>
              <SearchableSelect
                :model-value="form.tipe_akun_id"
                :options="tipeOptions"
                placeholder="Pilih tipe..."
                @update:model-value="(v) => (form.tipe_akun_id = v as number)"
              />
              <p v-if="errors.tipe_akun_id" class="text-xs text-destructive">{{ errors.tipe_akun_id }}</p>
            </div>
            <div class="space-y-2">
              <Label>Kategori Akun</Label>
              <SearchableSelect
                :model-value="form.kategori_akun_id"
                :options="kategoriOptions"
                placeholder="Pilih kategori..."
                @update:model-value="onKategoriChange"
              />
              <p v-if="errors.kategori_akun_id" class="text-xs text-destructive">{{ errors.kategori_akun_id }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Karakter Akun (Saldo Normal)</Label>
            <Select v-model="form.karakter_akun">
              <option value="D">D (Debet)</option>
              <option value="K">K (Kredit)</option>
            </Select>
            <p v-if="errors.karakter_akun" class="text-xs text-destructive">{{ errors.karakter_akun }}</p>
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
          <DialogTitle>Hapus Akun</DialogTitle>
          <DialogDescription>
            Hapus "{{ toDelete?.nama_akun }}"? Akun yang masih punya anak tidak dapat dihapus.
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { masterAkunService, type MasterAkunNode } from '@/services/akuntansi/masterAkunService'
import { bukuPeriodeService, type BukuPeriode } from '@/services/akuntansi/bukuPeriodeService'
import { tipeAkunService, type TipeAkun } from '@/services/akuntansi/tipeAkunService'
import { kategoriAkunService, type KategoriAkun } from '@/services/akuntansi/kategoriAkunService'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import TreeNode from './TreeNode.vue'

const { success, error } = useToast()

const periodes = ref<BukuPeriode[]>([])
const selectedPeriodeId = ref<number | null>(null)
// Select.vue's modelValue is typed as string — bridge it here instead of v-model.number
// (which passes a number straight into that string prop and trips Vue's prop-type warning).
const selectedPeriodeIdStr = computed({
  get: () => (selectedPeriodeId.value != null ? String(selectedPeriodeId.value) : ''),
  set: (v: string) => {
    selectedPeriodeId.value = v ? Number(v) : null
  }
})
const tree = ref<MasterAkunNode[]>([])
const loading = ref(false)

const tipeAkuns = ref<TipeAkun[]>([])
const kategoriAkuns = ref<KategoriAkun[]>([])
const tipeOptions = ref<{ label: string; value: number }[]>([])
const kategoriOptions = ref<{ label: string; value: number }[]>([])

const formOpen = ref(false)
const deleteOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const parentNode = ref<MasterAkunNode | null>(null)
const toDelete = ref<MasterAkunNode | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const errors = reactive<Record<string, string>>({})

const form = reactive({
  parent_id: null as number | null,
  kode_akun: '',
  full_kode: '',
  nama_akun: '',
  tipe_akun_id: null as number | null,
  kategori_akun_id: null as number | null,
  karakter_akun: 'D' as 'D' | 'K',
  is_aktif: true
})

const loadPeriodes = async () => {
  periodes.value = await bukuPeriodeService.list()
  const aktif = periodes.value.find((p) => p.is_aktif)
  selectedPeriodeId.value = aktif?.id ?? periodes.value[0]?.id ?? null
}

const loadReferensi = async () => {
  tipeAkuns.value = await tipeAkunService.list({ is_aktif: true })
  kategoriAkuns.value = await kategoriAkunService.list({ is_aktif: true })
  tipeOptions.value = tipeAkuns.value.map((t) => ({ label: t.nama_tipe, value: t.id }))
  kategoriOptions.value = kategoriAkuns.value.map((k) => ({ label: `${k.nama_kategori} (${k.dk_kode})`, value: k.id }))
}

const loadTree = async () => {
  if (!selectedPeriodeId.value) {
    tree.value = []
    return
  }
  loading.value = true
  try {
    const res = await masterAkunService.tree(selectedPeriodeId.value)
    tree.value = res.data
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat master akun' })
  } finally {
    loading.value = false
  }
}

const onKategoriChange = (value: string | number | undefined) => {
  form.kategori_akun_id = (value as number) ?? null
  const kategori = kategoriAkuns.value.find((k) => k.id === value)
  if (kategori) {
    form.karakter_akun = kategori.dk_kode
  }
}

const resetForm = () => {
  form.parent_id = null
  form.kode_akun = ''
  form.full_kode = ''
  form.nama_akun = ''
  form.tipe_akun_id = null
  form.kategori_akun_id = null
  form.karakter_akun = 'D'
  form.is_aktif = true
  Object.keys(errors).forEach((k) => delete errors[k])
}

const openCreate = (parent: MasterAkunNode | null) => {
  isEditing.value = false
  editingId.value = null
  parentNode.value = parent
  resetForm()
  form.parent_id = parent?.id ?? null
  formOpen.value = true
}

const openEdit = (node: MasterAkunNode) => {
  isEditing.value = true
  editingId.value = node.id
  parentNode.value = null
  form.parent_id = node.parent_id
  form.kode_akun = node.kode_akun
  form.full_kode = node.full_kode
  form.nama_akun = node.nama_akun
  form.tipe_akun_id = node.tipe_akun_id
  form.kategori_akun_id = node.kategori_akun_id
  form.karakter_akun = node.karakter_akun
  form.is_aktif = node.is_aktif
  Object.keys(errors).forEach((k) => delete errors[k])
  formOpen.value = true
}

const openDelete = (node: MasterAkunNode) => {
  toDelete.value = node
  deleteOpen.value = true
}

const submit = async () => {
  if (!selectedPeriodeId.value) return
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  const payload = {
    buku_periode_id: selectedPeriodeId.value,
    parent_id: form.parent_id,
    kode_akun: form.kode_akun,
    full_kode: form.full_kode,
    nama_akun: form.nama_akun,
    tipe_akun_id: form.tipe_akun_id as number,
    kategori_akun_id: form.kategori_akun_id as number,
    karakter_akun: form.karakter_akun,
    is_aktif: form.is_aktif
  }

  try {
    if (isEditing.value && editingId.value) {
      await masterAkunService.update(editingId.value, payload)
      success('Berhasil', { description: 'Akun berhasil diperbarui' })
    } else {
      await masterAkunService.create(payload)
      success('Berhasil', { description: 'Akun berhasil ditambahkan' })
    }
    formOpen.value = false
    await loadTree()
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
    await masterAkunService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Akun berhasil dihapus' })
    deleteOpen.value = false
    await loadTree()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadPeriodes(), loadReferensi()])
  await loadTree()
})
</script>
