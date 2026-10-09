<template>
  <div class="min-h-full w-full p-6 space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="danger" size="sm" class="gap-2 bg-white text-green-600" @click="router.push('/kolektor')">
        <ArrowLeft class="h-4 w-4" />
        Kembali
      </Button>
      <div class="h-6 w-px bg-border"></div>
      <h1 class="text-2xl font-bold text-foreground">{{ isEditing ? 'Edit Kolektor' : 'Tambah Kolektor' }}</h1>
    </div>

    <form class="space-y-6" @submit.prevent="submit">
      <Card>
        <CardContent class="p-6 space-y-6">
          <div class="border-b border-border pb-4">
            <h3 class="text-lg font-semibold text-foreground">Identitas Kolektor</h3>
            <p class="text-sm text-muted-foreground mt-1">Kolektor terikat pada satu akun pengguna</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label class="required">Pengguna</Label>
              <SearchableSelect
                v-model="form.user_id"
                :options="userOptions"
                placeholder="Pilih akun pengguna..."
                :disabled="loadingUsers"
              />
              <p v-if="errors.user_id" class="text-xs text-destructive">{{ errors.user_id }}</p>
            </div>

            <div class="space-y-2">
              <Label>No. HP</Label>
              <Input v-model="form.no_hp" placeholder="mis. 081234567890" />
              <p v-if="errors.no_hp" class="text-xs text-destructive">{{ errors.no_hp }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Keterangan</Label>
            <Textarea v-model="form.keterangan" rows="2" placeholder="Catatan tambahan (opsional)" />
          </div>

          <div class="flex items-center gap-2">
            <Checkbox :checked="form.is_aktif" @update:checked="(v) => (form.is_aktif = v)" />
            <Label class="cursor-pointer" @click="form.is_aktif = !form.is_aktif">Aktif</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6 space-y-4">
          <div class="border-b border-border pb-4">
            <h3 class="text-lg font-semibold text-foreground">Wilayah Penugasan</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Gambar area tanggung jawab kolektor di peta dalam bentuk poligon
            </p>
          </div>

          <PolygonAreaPicker v-model="form.wilayah" :reference-points="referencePoints" />
        </CardContent>
      </Card>

      <div class="fixed bottom-6 right-6 flex gap-3 z-50">
        <Button type="button" variant="white" size="lg" class="shadow-lg" @click="router.push('/kolektor')">
          Batal
        </Button>
        <Button type="submit" variant="primary" size="lg" class="gap-2 shadow-lg" :disabled="submitting">
          <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ submitting ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Loader2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { kolektorService } from '@/services/kolektorService'
import { memberService } from '@/services/memberService'
import type { SelectOption } from '@/components/ui/SearchableSelect.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import PolygonAreaPicker, { type LatLngPoint, type ReferencePoint } from '@/components/map/PolygonAreaPicker.vue'

const route = useRoute()
const router = useRouter()
const { success, error } = useToast()

const isEditing = ref(!!route.params.id)
const editingId = route.params.id as string | undefined

const submitting = ref(false)
const loadingUsers = ref(false)
const userOptions = ref<SelectOption[]>([])
const referencePoints = ref<ReferencePoint[]>([])

const form = reactive({
  user_id: undefined as number | undefined,
  no_hp: '',
  keterangan: '',
  is_aktif: true,
  wilayah: [] as LatLngPoint[]
})

const errors = reactive<Record<string, string>>({})

const loadUserOptions = async () => {
  loadingUsers.value = true
  try {
    const users = await kolektorService.userOptions(editingId)
    userOptions.value = users.map((u) => ({ label: `${u.name} (${u.email})`, value: u.id }))
  } finally {
    loadingUsers.value = false
  }
}

const loadReferencePoints = async () => {
  try {
    const points = await memberService.mapPoints()
    referencePoints.value = points.map((p) => ({ id: p.id, nama: p.nama, latitude: p.latitude, longitude: p.longitude }))
  } catch {
    referencePoints.value = []
  }
}

const loadKolektor = async () => {
  if (!editingId) return
  const kolektor = await kolektorService.get(editingId)
  form.user_id = kolektor.user_id
  form.no_hp = kolektor.no_hp || ''
  form.keterangan = kolektor.keterangan || ''
  form.is_aktif = kolektor.is_aktif
  form.wilayah = kolektor.wilayah || []
}

const submit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.user_id) {
    errors.user_id = 'Pengguna wajib dipilih'
    return
  }

  submitting.value = true
  try {
    const payload = {
      user_id: form.user_id,
      no_hp: form.no_hp || null,
      keterangan: form.keterangan || null,
      is_aktif: form.is_aktif,
      wilayah: form.wilayah
    }

    if (isEditing.value && editingId) {
      await kolektorService.update(editingId, payload)
      success('Berhasil', { description: 'Data kolektor berhasil diperbarui' })
    } else {
      await kolektorService.create(payload)
      success('Berhasil', { description: 'Kolektor berhasil ditambahkan' })
    }

    router.push('/kolektor')
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

onMounted(async () => {
  await Promise.all([loadUserOptions(), loadReferencePoints(), loadKolektor()])
})
</script>

<style scoped>
.required::after {
  content: " *";
  color: hsl(var(--destructive));
}
</style>
