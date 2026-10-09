<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950 px-4 py-10">
    <!-- class di <Card> tidak diteruskan komponennya, jadi lebar & padding diatur di wrapper -->
    <div class="w-full max-w-2xl">
      <Card>
        <div class="p-8">
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold text-foreground">Daftarkan Koperasi</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Buat akun koperasi baru. Anda otomatis menjadi admin dan bisa menambahkan staf setelahnya.
            </p>
          </div>

          <form class="space-y-6" @submit.prevent="submit">
            <section class="space-y-4">
              <h2 class="text-sm font-semibold text-foreground border-b border-border pb-2">Data Koperasi</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2 sm:col-span-2">
                  <Label for="nama" class="required">Nama Koperasi</Label>
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
              <h2 class="text-sm font-semibold text-foreground border-b border-border pb-2">Akun Admin</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="admin_name" class="required">Nama Lengkap</Label>
                  <Input id="admin_name" v-model="form.admin.name" required autocomplete="name" />
                  <p v-if="errors['admin.name']" class="text-xs text-destructive">{{ errors['admin.name'] }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="admin_email" class="required">Email</Label>
                  <Input id="admin_email" v-model="form.admin.email" type="email" required autocomplete="username" />
                  <p v-if="errors['admin.email']" class="text-xs text-destructive">{{ errors['admin.email'] }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="admin_password" class="required">Password</Label>
                  <Input id="admin_password" v-model="form.admin.password" type="password" required autocomplete="new-password" />
                  <p v-if="errors['admin.password']" class="text-xs text-destructive">{{ errors['admin.password'] }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="admin_password_confirmation" class="required">Ulangi Password</Label>
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

            <Button type="submit" variant="primary" class="w-full gap-2" :disabled="userStore.loading">
              <Loader2 v-if="userStore.loading" class="h-4 w-4 animate-spin" />
              {{ userStore.loading ? 'Mendaftarkan...' : 'Daftarkan Koperasi' }}
            </Button>

            <p class="text-center text-sm text-muted-foreground">
              Sudah punya akun?
              <RouterLink to="/login" class="text-green-600 hover:underline">Masuk</RouterLink>
            </p>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { JENIS_KOPERASI } from '@/services/koperasiService'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
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

<style scoped>
.required::after {
  content: " *";
  color: hsl(var(--destructive));
}
</style>
