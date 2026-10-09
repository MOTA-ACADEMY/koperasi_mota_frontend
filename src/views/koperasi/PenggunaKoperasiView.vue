<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Pengguna Koperasi</h1>
        <p class="text-muted-foreground mt-1">
          Admin dan staf yang dapat mengakses {{ userStore.koperasi?.nama || 'koperasi ini' }}
        </p>
      </div>
      <Button v-if="userStore.isAdmin" variant="green" class="gap-2" @click="openCreate">
        <Plus class="h-4 w-4" />
        Tambah Pengguna
      </Button>
    </div>

    <Card v-if="!userStore.isAdmin">
      <CardContent class="p-8 text-center text-sm text-muted-foreground">
        Hanya admin koperasi yang dapat mengelola pengguna.
      </CardContent>
    </Card>

    <Card v-else>
      <CardContent class="p-4">
        <div class="pt-4">
          <DataTable
            :columns="columns"
            :actions="actions"
            :data="items"
            :loading="loading"
            searchable
            :search-fields="['name', 'email']"
          >
            <template #cell-name="{ item }">
              <span class="font-medium">{{ item.name }}</span>
              <span v-if="item.id === userStore.user.id" class="ml-2 text-xs text-muted-foreground">(Anda)</span>
            </template>
            <template #cell-role="{ item }">
              <Badge :variant="item.role === 'admin' ? 'green' : 'secondary'">
                {{ item.role === 'admin' ? 'Admin' : 'Staf' }}
              </Badge>
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

    <!-- Tambah Dialog -->
    <Dialog v-model:open="createOpen">
      <DialogContent class="sm:max-w-md" @close="createOpen = false">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna</DialogTitle>
          <DialogDescription>
            Jika email sudah terdaftar (mis. pengguna koperasi lain), cukup isi email dan role —
            akunnya akan dikaitkan ke koperasi ini. Untuk email baru, isi juga nama dan password.
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitCreate">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="createForm.email" type="email" required />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-2">
            <Label for="name">Nama <span class="text-muted-foreground font-normal">(untuk akun baru)</span></Label>
            <Input id="name" v-model="createForm.name" />
            <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
          </div>
          <div class="space-y-2">
            <Label for="password">Password <span class="text-muted-foreground font-normal">(untuk akun baru, min. 8 karakter)</span></Label>
            <Input id="password" v-model="createForm.password" type="password" autocomplete="new-password" />
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </div>
          <div class="space-y-2">
            <Label for="role">Role</Label>
            <Select id="role" v-model="createForm.role">
              <option value="staf">Staf</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="createOpen = false">Batal</Button>
            <Button type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:open="editOpen">
      <DialogContent class="sm:max-w-sm" @close="editOpen = false">
        <DialogHeader>
          <DialogTitle>Ubah Akses</DialogTitle>
          <DialogDescription>{{ editing?.name }} — {{ editing?.email }}</DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitEdit">
          <div class="space-y-2">
            <Label for="edit_role">Role</Label>
            <Select id="edit_role" v-model="editForm.role">
              <option value="staf">Staf</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox :checked="editForm.is_aktif" @update:checked="(v: boolean) => (editForm.is_aktif = v)" />
            <Label class="cursor-pointer" @click="editForm.is_aktif = !editForm.is_aktif">
              Aktif <span class="text-muted-foreground font-normal">(nonaktif = tidak bisa masuk ke koperasi ini)</span>
            </Label>
          </div>
          <p v-if="errors.role" class="text-xs text-destructive">{{ errors.role }}</p>

          <DialogFooter>
            <Button type="button" variant="outline" @click="editOpen = false">Batal</Button>
            <Button type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Keluarkan Dialog -->
    <Dialog v-model:open="removeOpen">
      <DialogContent class="sm:max-w-sm" @close="removeOpen = false">
        <DialogHeader>
          <DialogTitle>Keluarkan Pengguna</DialogTitle>
          <DialogDescription>
            Keluarkan "{{ toRemove?.name }}" dari koperasi ini? Akunnya tetap ada dan masih bisa
            mengakses koperasi lain tempat ia terdaftar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="removeOpen = false">Batal</Button>
          <Button variant="destructive" :disabled="submitting" @click="confirmRemove">
            {{ submitting ? 'Memproses...' : 'Keluarkan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Pencil, UserMinus } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { koperasiService, type KoperasiRole, type PenggunaKoperasi } from '@/services/koperasiService'
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

const userStore = useUserStore()
const { success, error } = useToast()

const items = ref<PenggunaKoperasi[]>([])
const loading = ref(false)
const submitting = ref(false)
const errors = reactive<Record<string, string>>({})

const columns = [
  { key: 'name', label: 'Nama', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'is_aktif', label: 'Status' }
]

const createOpen = ref(false)
const createForm = reactive({ email: '', name: '', password: '', role: 'staf' as KoperasiRole })

const editOpen = ref(false)
const editing = ref<PenggunaKoperasi | null>(null)
const editForm = reactive({ role: 'staf' as KoperasiRole, is_aktif: true })

const removeOpen = ref(false)
const toRemove = ref<PenggunaKoperasi | null>(null)

const actions = computed(() => [
  { key: 'edit', icon: Pencil, variant: 'outline' as const, size: 'sm' as const, handler: (item: PenggunaKoperasi) => openEdit(item) },
  { key: 'remove', icon: UserMinus, variant: 'destructive' as const, size: 'sm' as const, handler: (item: PenggunaKoperasi) => openRemove(item) }
])

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])

const applyErrors = (err: any, fallbackTitle: string) => {
  const apiErrors = err?.data?.errors
  if (apiErrors) {
    Object.entries(apiErrors).forEach(([key, msgs]) => {
      errors[key] = Array.isArray(msgs) ? (msgs[0] as string) : String(msgs)
    })
  } else {
    error(fallbackTitle, { description: err?.message || 'Terjadi kesalahan' })
  }
}

const loadItems = async () => {
  if (!userStore.isAdmin) return
  loading.value = true
  try {
    items.value = await koperasiService.listPengguna()
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat daftar pengguna' })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  Object.assign(createForm, { email: '', name: '', password: '', role: 'staf' })
  clearErrors()
  createOpen.value = true
}

const openEdit = (item: PenggunaKoperasi) => {
  editing.value = item
  Object.assign(editForm, { role: item.role, is_aktif: item.is_aktif })
  clearErrors()
  editOpen.value = true
}

const openRemove = (item: PenggunaKoperasi) => {
  toRemove.value = item
  removeOpen.value = true
}

const submitCreate = async () => {
  submitting.value = true
  clearErrors()
  try {
    await koperasiService.tambahPengguna({
      email: createForm.email,
      name: createForm.name || undefined,
      password: createForm.password || undefined,
      role: createForm.role
    })
    success('Berhasil', { description: 'Pengguna ditambahkan ke koperasi' })
    createOpen.value = false
    await loadItems()
  } catch (err: any) {
    applyErrors(err, 'Gagal Menambahkan')
  } finally {
    submitting.value = false
  }
}

const submitEdit = async () => {
  if (!editing.value) return
  submitting.value = true
  clearErrors()
  try {
    await koperasiService.ubahPengguna(editing.value.id, { role: editForm.role, is_aktif: editForm.is_aktif })
    success('Berhasil', { description: 'Akses pengguna diperbarui' })
    editOpen.value = false
    await loadItems()
  } catch (err: any) {
    applyErrors(err, 'Gagal Menyimpan')
  } finally {
    submitting.value = false
  }
}

const confirmRemove = async () => {
  if (!toRemove.value) return
  submitting.value = true
  try {
    await koperasiService.keluarkanPengguna(toRemove.value.id)
    success('Berhasil', { description: 'Pengguna dikeluarkan dari koperasi' })
    removeOpen.value = false
    await loadItems()
  } catch (err: any) {
    error('Gagal', { description: err?.data?.errors?.role?.[0] || err?.message || 'Terjadi kesalahan' })
  } finally {
    submitting.value = false
  }
}

onMounted(loadItems)
</script>
