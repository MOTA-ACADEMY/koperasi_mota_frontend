<template>
  <AuthLayout ukuran="lg">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Daftarkan koperasi</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Buat akun koperasi baru. Anda otomatis menjadi admin dan bisa menambahkan staf setelahnya.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="submit">
      <section class="space-y-4">
        <h2 class="border-b border-border pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Data Koperasi</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2 sm:col-span-2">
            <Label for="nama">Nama Koperasi <span class="text-red-500" aria-hidden="true">*</span></Label>
            <Input id="nama" v-model="form.koperasi.nama" placeholder="mis. KDMP Sukamaju" required />
            <p v-if="errors['koperasi.nama']" class="text-xs text-destructive">{{ errors['koperasi.nama'] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="jenis">Jenis Koperasi</Label>
            <Select id="jenis" v-model="form.koperasi.jenis_koperasi">
              <option v-for="j in JENIS_KOPERASI" :key="j.value" :value="j.value">{{ j.label }}</option>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="telepon">Telepon</Label>
            <Input id="telepon" v-model="form.koperasi.telepon" placeholder="08xx" />
          </div>
          <div class="space-y-2">
            <Label for="desa">Desa / Kelurahan</Label>
            <Input id="desa" v-model="form.koperasi.desa_kelurahan" />
          </div>
          <div class="space-y-2">
            <Label for="kecamatan">Kecamatan</Label>
            <Input id="kecamatan" v-model="form.koperasi.kecamatan" />
          </div>
          <div class="space-y-2">
            <Label for="kabupaten">Kabupaten / Kota</Label>
            <Input id="kabupaten" v-model="form.koperasi.kabupaten_kota" />
          </div>
          <div class="space-y-2">
            <Label for="provinsi">Provinsi</Label>
            <Input id="provinsi" v-model="form.koperasi.provinsi" />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="border-b border-border pb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Akun Admin</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="admin_name">Nama Lengkap <span class="text-red-500" aria-hidden="true">*</span></Label>
            <Input id="admin_name" v-model="form.admin.name" required autocomplete="name" />
            <p v-if="errors['admin.name']" class="text-xs text-destructive">{{ errors['admin.name'] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="admin_email">Email <span class="text-red-500" aria-hidden="true">*</span></Label>
            <Input id="admin_email" v-model="form.admin.email" type="email" required autocomplete="username" />
            <p v-if="errors['admin.email']" class="text-xs text-destructive">{{ errors['admin.email'] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="admin_password">Password <span class="text-red-500" aria-hidden="true">*</span></Label>
            <Input id="admin_password" v-model="form.admin.password" type="password" required autocomplete="new-password" />
            <p v-if="errors['admin.password']" class="text-xs text-destructive">{{ errors['admin.password'] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="admin_password_confirmation">Ulangi Password <span class="text-red-500" aria-hidden="true">*</span></Label>
            <Input id="admin_password_confirmation" v-model="form.admin.password_confirmation" type="password" required autocomplete="new-password" />
          </div>
        </div>
      </section>

      <div class="flex items-start gap-2">
        <Checkbox :checked="form.gunakan_coa_standar" @update:checked="(v: boolean) => (form.gunakan_coa_standar = v)" />
        <Label class="cursor-pointer leading-snug" @click="form.gunakan_coa_standar = !form.gunakan_coa_standar">
          Isi otomatis bagan akun (COA) standar koperasi
          <span class="block text-xs text-muted-foreground font-normal">Bisa diubah kapan saja di menu Master Akun.</span>
        </Label>
      </div>

      <button
        type="submit"
        :disabled="userStore.loading"
        class="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 text-sm font-semibold text-white shadow-sm shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-md hover:shadow-green-600/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-600/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        <Loader2 v-if="userStore.loading" class="h-4 w-4 animate-spin" />
        <template v-else>
          Daftarkan koperasi
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </template>
      </button>

      <p class="text-center text-sm text-muted-foreground">
        Sudah punya akun?
        <RouterLink to="/login" class="font-medium text-green-600 hover:underline">Masuk</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { JENIS_KOPERASI } from '@/services/koperasiService'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const userStore = useUserStore()
const { success, error } = useToast()
const errors = reactive<Record<string, string>>({})

const form = reactive({
  koperasi: {
    nama: '',
    jenis_koperasi: 'kdmp',
    telepon: '',
    desa_kelurahan: '',
    kecamatan: '',
    kabupaten_kota: '',
    provinsi: ''
  },
  admin: {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  },
  gunakan_coa_standar: true
})

const submit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    // Field opsional yang dikosongkan dikirim sebagai null, bukan string kosong.
    const opsional = Object.fromEntries(
      Object.entries(form.koperasi).map(([key, value]) => [key, value || null])
    )

    await userStore.registerKoperasi({ ...form, koperasi: { ...opsional, nama: form.koperasi.nama } })
    success('Koperasi terdaftar', { description: `Selamat datang di ${form.koperasi.nama}` })
    window.location.href = '/dashboard'
  } catch (err: any) {
    const apiErrors = err?.data?.errors
    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, msgs]) => {
        errors[key] = Array.isArray(msgs) ? (msgs[0] as string) : String(msgs)
      })
    } else {
      error('Pendaftaran gagal', { description: err?.message || 'Terjadi kesalahan' })
    }
  }
}
</script>
