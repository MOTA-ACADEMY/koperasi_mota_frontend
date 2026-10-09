<template>
  <div class="min-h-full p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Profil Koperasi</h1>
      <p class="text-muted-foreground mt-1">
        Identitas koperasi yang sedang aktif.
        <span v-if="!userStore.isAdmin">Hanya admin yang dapat mengubah data ini.</span>
      </p>
    </div>

    <Card>
      <CardContent class="p-6">
        <div v-if="loading" class="py-10 text-center text-sm text-muted-foreground">Memuat...</div>

        <form v-else class="space-y-6" @submit.prevent="submit">
          <fieldset :disabled="!userStore.isAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 md:col-span-2">
              <Label for="nama">Nama Koperasi</Label>
              <Input id="nama" v-model="form.nama" required />
              <p v-if="errors.nama" class="text-xs text-destructive">{{ errors.nama }}</p>
            </div>
            <div class="space-y-2">
              <Label for="jenis">Jenis Koperasi</Label>
              <Select id="jenis" v-model="form.jenis_koperasi">
                <option value="">— Pilih —</option>
                <option v-for="j in JENIS_KOPERASI" :key="j.value" :value="j.value">{{ j.label }}</option>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="nik">Nomor Induk Koperasi (NIK)</Label>
              <Input id="nik" v-model="form.nomor_induk_koperasi" />
            </div>
            <div class="space-y-2">
              <Label for="nbh">Nomor Badan Hukum</Label>
              <Input id="nbh" v-model="form.nomor_badan_hukum" />
            </div>
            <div class="space-y-2">
              <Label for="tbh">Tanggal Badan Hukum</Label>
              <Input id="tbh" v-model="form.tanggal_badan_hukum" type="date" />
              <p v-if="errors.tanggal_badan_hukum" class="text-xs text-destructive">{{ errors.tanggal_badan_hukum }}</p>
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="alamat">Alamat</Label>
              <Textarea id="alamat" v-model="form.alamat" rows="2" />
            </div>
            <div class="space-y-2">
              <Label for="desa">Desa / Kelurahan</Label>
              <Input id="desa" v-model="form.desa_kelurahan" />
            </div>
            <div class="space-y-2">
              <Label for="kecamatan">Kecamatan</Label>
              <Input id="kecamatan" v-model="form.kecamatan" />
            </div>
            <div class="space-y-2">
              <Label for="kabupaten">Kabupaten / Kota</Label>
              <Input id="kabupaten" v-model="form.kabupaten_kota" />
            </div>
            <div class="space-y-2">
              <Label for="provinsi">Provinsi</Label>
              <Input id="provinsi" v-model="form.provinsi" />
            </div>
            <div class="space-y-2">
              <Label for="kode_pos">Kode Pos</Label>
              <Input id="kode_pos" v-model="form.kode_pos" />
            </div>
            <div class="space-y-2">
              <Label for="telepon">Telepon</Label>
              <Input id="telepon" v-model="form.telepon" />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="form.email" type="email" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
          </fieldset>

          <div v-if="userStore.isAdmin" class="flex justify-end">
            <Button type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { koperasiService, JENIS_KOPERASI, type KoperasiProfilPayload } from '@/services/koperasiService'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'

const userStore = useUserStore()
const { success, error } = useToast()

const loading = ref(false)
const submitting = ref(false)
const errors = reactive<Record<string, string>>({})

// Di form semua field berupa string ('' = kosong); dikonversi ke null saat disimpan.
type ProfilForm = { [K in keyof KoperasiProfilPayload]: string }

const form = reactive<ProfilForm>({
  nama: '',
  jenis_koperasi: '',
  nomor_badan_hukum: '',
  tanggal_badan_hukum: '',
  nomor_induk_koperasi: '',
  alamat: '',
  desa_kelurahan: '',
  kecamatan: '',
  kabupaten_kota: '',
  provinsi: '',
  kode_pos: '',
  telepon: '',
  email: ''
})

const load = async () => {
  loading.value = true
  try {
    const profil = await koperasiService.profil()
    ;(Object.keys(form) as (keyof ProfilForm)[]).forEach((key) => {
      form[key] = profil[key] ?? ''
    })
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat profil koperasi' })
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  submitting.value = true
  Object.keys(errors).forEach((k) => delete errors[k])

  try {
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])
    ) as unknown as KoperasiProfilPayload
    const profil = await koperasiService.updateProfil(payload)

    userStore.updateKoperasiAktif({
      nama: profil.nama,
      jenis_koperasi: profil.jenis_koperasi,
      desa_kelurahan: profil.desa_kelurahan,
      kabupaten_kota: profil.kabupaten_kota
    })
    success('Berhasil', { description: 'Profil koperasi berhasil diperbarui' })
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

onMounted(load)
</script>
