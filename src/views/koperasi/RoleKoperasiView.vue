<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Role & Hak Akses</h1>
        <p class="text-muted-foreground mt-1">Atur menu apa saja yang boleh dibuka setiap role di koperasi ini</p>
      </div>
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
        @click="pilihBaru"
      >
        <Plus class="h-4 w-4" />
        Tambah Role
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Memuat...
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <!-- Daftar role -->
      <div class="space-y-2">
        <button
          v-for="role in roles"
          :key="role.id"
          type="button"
          class="w-full rounded-xl border bg-card p-4 text-left transition-all hover:border-green-600"
          :class="dipilihId === role.id ? 'border-green-600 ring-4 ring-green-600/10' : 'border-border'"
          @click="pilih(role)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck v-if="role.akses_penuh" class="h-4 w-4 text-green-600" />
              {{ role.nama }}
            </span>
            <span class="text-xs text-muted-foreground">{{ role.jumlah_pengguna }} pengguna</span>
          </div>
          <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {{ role.deskripsi || (role.akses_penuh ? 'Akses penuh' : 'Tanpa deskripsi') }}
          </p>
          <p class="mt-2 text-xs font-medium" :class="role.akses_penuh ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'">
            {{ role.akses_penuh ? 'Semua menu' : `${role.menu_ids.length} dari ${totalMenu} menu` }}
          </p>
        </button>
        <button
          v-if="dipilihId === 'baru'"
          type="button"
          class="w-full rounded-xl border border-dashed border-green-600 bg-green-50/50 p-4 text-left text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400"
        >
          Role baru (belum disimpan)
        </button>
      </div>

      <!-- Editor -->
      <div class="rounded-xl border border-border bg-card">
        <div v-if="dipilihId === null" class="p-10 text-center text-sm text-muted-foreground">
          Pilih role di sebelah kiri, atau tambah role baru.
        </div>

        <form v-else class="divide-y divide-border" @submit.prevent="simpan">
          <div class="grid gap-4 p-5 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label for="nama" class="text-sm font-medium">Nama role</label>
              <input
                id="nama"
                v-model="form.nama"
                required
                maxlength="100"
                placeholder="mis. Bendahara"
                class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
              />
              <p v-if="errors.nama" class="text-xs text-destructive">{{ errors.nama }}</p>
            </div>
            <div class="space-y-1.5">
              <label for="deskripsi" class="text-sm font-medium">Deskripsi</label>
              <input
                id="deskripsi"
                v-model="form.deskripsi"
                maxlength="255"
                placeholder="Tugas singkat role ini"
                class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
              />
            </div>
          </div>

          <div class="p-5">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold">Hak akses menu</h2>
              <span v-if="!roleDipilih?.akses_penuh" class="text-xs text-muted-foreground">
                {{ form.menu_ids.length }} dipilih
              </span>
            </div>

            <div
              v-if="roleDipilih?.akses_penuh"
              class="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300"
            >
              <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Role ini memiliki <strong>akses penuh</strong> ke semua menu, termasuk menu yang ditambahkan
                di kemudian hari. Hak aksesnya tidak bisa dikurangi.
              </span>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2">
              <div v-for="grup in katalog" :key="grup.id" class="rounded-lg border border-border">
                <label class="flex cursor-pointer items-center gap-2.5 border-b border-border bg-muted/40 px-3 py-2.5">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-green-600"
                    :checked="statusGrup(grup) === 'semua'"
                    :indeterminate.prop="statusGrup(grup) === 'sebagian'"
                    @change="toggleGrup(grup)"
                  />
                  <span class="text-sm font-semibold">{{ grup.nama }}</span>
                </label>
                <div class="space-y-0.5 p-2">
                  <label
                    v-for="menu in grup.children"
                    :key="menu.id"
                    class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
                  >
                    <input v-model="form.menu_ids" type="checkbox" :value="menu.id" class="h-4 w-4 accent-green-600" />
                    <component :is="menuIcon(menu.icon)" class="h-4 w-4 text-muted-foreground" />
                    {{ menu.nama }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 p-5">
            <button
              v-if="roleDipilih && !roleDipilih.is_sistem"
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              @click="hapusOpen = true"
            >
              <Trash2 class="h-4 w-4" /> Hapus role
            </button>
            <span v-else class="text-xs text-muted-foreground">{{ roleDipilih?.is_sistem ? 'Role bawaan sistem tidak dapat dihapus.' : '' }}</span>

            <button
              type="submit"
              :disabled="menyimpan"
              class="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              <Loader2 v-if="menyimpan" class="h-4 w-4 animate-spin" />
              {{ dipilihId === 'baru' ? 'Buat role' : 'Simpan perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Konfirmasi hapus -->
    <Dialog v-model:open="hapusOpen">
      <DialogContent class="sm:max-w-sm" @close="hapusOpen = false">
        <DialogHeader>
          <DialogTitle>Hapus Role</DialogTitle>
          <DialogDescription>
            Hapus role "{{ roleDipilih?.nama }}"? Role yang masih dipakai pengguna tidak dapat dihapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="hapusOpen = false">Batal</Button>
          <Button variant="destructive" :disabled="menyimpan" @click="hapus">
            {{ menyimpan ? 'Menghapus...' : 'Hapus' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores'
import { menuIcon } from '@/lib/menuIcons'
import type { MenuNode } from '@/services/authService'
import { rbacService, type RbacRole } from '@/services/rbacService'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'

const { success, error } = useToast()
const userStore = useUserStore()

const loading = ref(false)
const menyimpan = ref(false)
const hapusOpen = ref(false)
const roles = ref<RbacRole[]>([])
const katalog = ref<MenuNode[]>([])
const dipilihId = ref<number | 'baru' | null>(null)
const errors = reactive<Record<string, string>>({})
const form = reactive({ nama: '', deskripsi: '', menu_ids: [] as number[] })

const totalMenu = computed(() => katalog.value.reduce((n, g) => n + (g.children?.length ?? 0), 0))
const roleDipilih = computed(() => roles.value.find((r) => r.id === dipilihId.value) ?? null)

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])

const statusGrup = (grup: MenuNode): 'semua' | 'sebagian' | 'kosong' => {
  const ids = (grup.children ?? []).map((m) => m.id)
  const terpilih = ids.filter((id) => form.menu_ids.includes(id)).length
  return terpilih === 0 ? 'kosong' : terpilih === ids.length ? 'semua' : 'sebagian'
}

const toggleGrup = (grup: MenuNode) => {
  const ids = (grup.children ?? []).map((m) => m.id)
  form.menu_ids = statusGrup(grup) === 'semua'
    ? form.menu_ids.filter((id) => !ids.includes(id))
    : [...new Set([...form.menu_ids, ...ids])]
}

const pilih = (role: RbacRole) => {
  dipilihId.value = role.id
  Object.assign(form, { nama: role.nama, deskripsi: role.deskripsi ?? '', menu_ids: [...role.menu_ids] })
  clearErrors()
}

const pilihBaru = () => {
  dipilihId.value = 'baru'
  Object.assign(form, { nama: '', deskripsi: '', menu_ids: [] })
  clearErrors()
}

const load = async (pilihId?: number) => {
  loading.value = roles.value.length === 0
  try {
    ;[roles.value, katalog.value] = await Promise.all([rbacService.roles(), rbacService.menu()])
    const target = roles.value.find((r) => r.id === pilihId) ?? roles.value[0]
    if (target) pilih(target)
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat role' })
  } finally {
    loading.value = false
  }
}

const simpan = async () => {
  menyimpan.value = true
  clearErrors()
  const payload = { nama: form.nama, deskripsi: form.deskripsi || null, menu_ids: form.menu_ids }
  try {
    const role = dipilihId.value === 'baru'
      ? await rbacService.createRole(payload)
      : await rbacService.updateRole(dipilihId.value as number, payload)
    success('Berhasil', { description: `Role "${role.nama}" disimpan` })
    await load(role.id)
    // Hak akses diri sendiri bisa ikut berubah → perbarui menu sidebar.
    await userStore.refreshSession()
  } catch (err: any) {
    const apiErrors = err?.data?.errors
    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, msgs]) => {
        errors[key.replace(/\.\d+$/, '')] = Array.isArray(msgs) ? (msgs[0] as string) : String(msgs)
      })
      if (errors.menu_ids) error('Gagal Menyimpan', { description: errors.menu_ids })
    } else {
      error('Gagal Menyimpan', { description: err?.message || 'Terjadi kesalahan' })
    }
  } finally {
    menyimpan.value = false
  }
}

const hapus = async () => {
  if (!roleDipilih.value) return
  menyimpan.value = true
  try {
    await rbacService.deleteRole(roleDipilih.value.id)
    success('Berhasil', { description: 'Role dihapus' })
    hapusOpen.value = false
    dipilihId.value = null
    await load()
  } catch (err: any) {
    error('Gagal Menghapus', { description: err?.data?.errors?.id?.[0] || err?.message || 'Terjadi kesalahan' })
  } finally {
    menyimpan.value = false
  }
}

onMounted(() => load())
</script>
