<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Master Kolektor</h1>
        <p class="text-muted-foreground mt-1">Identitas kolektor dan wilayah penagihan yang menjadi tanggung jawabnya</p>
      </div>
      <Button variant="green" class="gap-2" @click="$router.push('/kolektor/tambah')">
        <Plus class="h-4 w-4" />
        Tambah Kolektor
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
            :search-fields="['nama', 'email', 'no_hp']"
          >
            <template #cell-nama="{ item }">
              <div>
                <p class="font-medium">{{ item.nama }}</p>
                <p class="text-xs text-muted-foreground">{{ item.email }}</p>
              </div>
            </template>
            <template #cell-wilayah="{ item }">
              <span class="text-xs text-muted-foreground">{{ item.wilayah.length }} titik</span>
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

    <!-- Delete Dialog -->
    <Dialog v-model:open="deleteOpen">
      <DialogContent class="sm:max-w-sm" @close="deleteOpen = false">
        <DialogHeader>
          <DialogTitle>Hapus Kolektor</DialogTitle>
          <DialogDescription>
            Hapus kolektor "{{ toDelete?.nama }}"? Tindakan ini tidak dapat dibatalkan.
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { kolektorService, type Kolektor } from '@/services/kolektorService'
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

const router = useRouter()
const { success, error } = useToast()

const items = ref<Kolektor[]>([])
const loading = ref(false)

const columns = [
  { key: 'nama', label: 'Kolektor', sortable: true },
  { key: 'no_hp', label: 'No. HP' },
  { key: 'wilayah', label: 'Wilayah' },
  { key: 'is_aktif', label: 'Status' }
]

const deleteOpen = ref(false)
const toDelete = ref<Kolektor | null>(null)
const deleting = ref(false)

const actions = computed(() => [
  { key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const, handler: (item: Kolektor) => router.push(`/kolektor/${item.id}/edit`) },
  { key: 'delete', icon: Trash2, variant: 'destructive' as const, size: 'sm' as const, handler: (item: Kolektor) => openDelete(item) }
])

const loadItems = async () => {
  loading.value = true
  try {
    items.value = await kolektorService.list()
  } catch (err) {
    error('Gagal Memuat', { description: 'Tidak dapat memuat daftar kolektor' })
  } finally {
    loading.value = false
  }
}

const openDelete = (item: Kolektor) => {
  toDelete.value = item
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await kolektorService.delete(toDelete.value.id)
    success('Berhasil', { description: 'Kolektor berhasil dihapus' })
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
