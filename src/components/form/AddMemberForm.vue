<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <Card>      
      <CardContent class="p-6 space-y-8">
        <!-- Section Title -->
        <div class="border-b border-border pb-4">
          <h3 class="text-lg font-semibold text-foreground">Profil Anggota</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Lengkapi informasi anggota koperasi yang akan didaftarkan
          </p>
        </div>

        <!-- Form Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4">
          <!-- Left Column - Photo -->
          <div class="lg:col-span-1">
            <div class="space-y-4">
              <Label for="foto" class="text-base font-medium">Foto Profil</Label>
              <div class="flex flex-col items-center space-y-4">
                <!-- Avatar Preview -->
                <div class="h-40 w-40 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img 
                    v-if="fotoPreview" 
                    :src="fotoPreview" 
                    alt="Preview" 
                    class="h-full w-full object-cover"
                  />
                  <Camera 
                    v-else 
                    class="h-16 w-16 text-muted-foreground" 
                  />
                </div>
                
                <!-- Upload Button -->
                <div class="w-full">
                  <Input
                    id="foto"
                    ref="fotoInput"
                    type="file"
                    accept="image/*"
                    @change="handleFotoChange"
                    class="hidden"
                  />
                  <p class="text-xs text-muted-foreground mt-2 text-center">
                    Format: JPG, PNG Maksimal 2MB
                  </p>
                  <p v-if="errors.foto" class="text-xs text-destructive mt-1 text-center">
                    {{ errors.foto }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Form Fields -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Nama Anggota -->
            <div class="space-y-2">
              <Label for="nama" class="required text-base font-medium">Nama Anggota</Label>
              <Input
                id="nama"
                v-model="formData.nama"
                type="text"
                placeholder="Masukkan nama lengkap anggota"
                required
                class="h-11"
                :class="errors.nama ? 'border-destructive' : ''"
              />
              <p v-if="errors.nama" class="text-xs text-destructive">
                {{ errors.nama }}
              </p>
            </div>

            <!-- Alamat -->
            <div class="space-y-2">
              <Label for="alamat" class="required text-base font-medium">Alamat</Label>
              <Textarea
                id="alamat"
                v-model="formData.alamat"
                placeholder="Masukkan alamat lengkap anggota"
                rows="4"
                required
                class="resize-none"
                :class="errors.alamat ? 'border-destructive' : ''"
              />
              <p v-if="errors.alamat" class="text-xs text-destructive">
                {{ errors.alamat }}
              </p>
            </div>

            <!-- Titik Lokasi -->
            <div class="space-y-2">
              <Label class="text-base font-medium">Titik Lokasi di Peta</Label>
              <LocationPicker
                v-model:latitude="formData.latitude"
                v-model:longitude="formData.longitude"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <!-- <CardFooter class="bg-muted/30 px-6 py-4 flex justify-between border-t border-border">
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
          :disabled="loading"
          class="px-6"
        >
          Batal
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          :disabled="loading || !isFormValid"
          class="gap-2 px-6"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          {{ loading ? 'Menyimpan...' : (isEditing ? 'Update Anggota' : 'Simpan Anggota') }}
        </Button>
      </CardFooter> -->
    </Card>
    <Card>
        <CardContent class="p-6 space-y-8">
            <div class="border-b border-border pb-4">
                <h3 class="text-lg font-semibold pt-4">Informasi Kontak</h3>
            </div>
            <div class="py-4">
              <ContactField
                v-model="formData.kontak"
                :class="errors.kontak ? 'border-destructive' : ''"
              />
              <p v-if="errors.kontak" class="text-xs text-destructive">
                {{ errors.kontak }}
              </p>
            </div>
        </CardContent>
    </Card>

    <Card>
      <CardContent class="p-6 space-y-8">
        <div class="border-b border-border pb-4">
          <h3 class="text-lg font-semibold pt-4">Kartu Identitas</h3>
        </div>
        <div class="py-4">
          <IdCardField
            v-model="formData.kartu_identitas"
            :class="errors.kartu_identitas ? 'border-destructive' : ''"
          />
          <p v-if="errors.kartu_identitas" class="text-xs text-destructive mt-2">
            {{ errors.kartu_identitas }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Floating Action Buttons -->
    <div class="fixed bottom-6 right-6 flex gap-3 z-50">
      <Button
        type="button"
        variant="white"
        size="lg"
        @click="handleCancel"
        :disabled="loading"
        class="shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Batal
      </Button>
      
      <Button
        type="submit"
        variant="primary"
        size="lg"
        :disabled="loading || !isFormValid"
        class="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        {{ loading ? 'Menyimpan...' : (isEditing ? 'Update Anggota' : 'Simpan Anggota') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Camera, 
  Save, 
  Loader2 
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { memberService } from '@/services/memberService'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import ContactField, { type Contact } from './ContactField.vue'
import IdCardField, { type IdCard } from './IdCardField.vue'
import LocationPicker from '@/components/map/LocationPicker.vue'

// Props and emits for edit mode
interface Props {
  initialData?: any
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null,
  isEditing: false
})

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const router = useRouter()
const { toast, error } = useToast()

// Form data
const formData = reactive({
  nama: props.initialData?.nama || '',
  alamat: props.initialData?.alamat || '',
  latitude: (props.initialData?.latitude ?? null) as number | null,
  longitude: (props.initialData?.longitude ?? null) as number | null,
  kontak: props.initialData?.kontak || [{ jenis_kontak: 'email', kontak: '' }] as Contact[],
  kartu_identitas: props.initialData?.kartu_identitas || [{ jenis_id: 'ktp', nomor_id: '', file_scan: null }] as IdCard[],
  foto: null as File | null
})

// Initialize photo preview if editing
onMounted(() => {
  if (props.isEditing && props.initialData?.foto) {
    fotoPreview.value = props.initialData.foto
  }
})

// Form state
const loading = ref(false)
const fotoPreview = ref<string | null>(null)
const fotoInput = ref<HTMLInputElement>()

// Form validation
const errors = reactive({
  nama: '',
  alamat: '',
  kontak: '',
  kartu_identitas: '',
  foto: ''
})

const isFormValid = computed(() => {
  return formData.nama.trim() !== '' && 
         formData.alamat.trim() !== '' &&
         formData.kontak.some(contact => contact.kontak.trim() !== '') &&
         formData.kartu_identitas.some(idCard => idCard.nomor_id.trim() !== '') &&
         !Object.values(errors).some(error => error !== '')
})

// File upload handler
const handleFotoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      errors.foto = 'Ukuran file maksimal 2MB'
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.foto = 'File harus berupa gambar'
      return
    }
    
    errors.foto = ''
    formData.foto = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      fotoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Form validation
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Validate nama
  if (!formData.nama.trim()) {
    errors.nama = 'Nama anggota wajib diisi'
  }
  
  // Validate alamat
  if (!formData.alamat.trim()) {
    errors.alamat = 'Alamat wajib diisi'
  }
  
  // Validate kontak
  const validContacts = formData.kontak.filter(contact => contact.kontak.trim() !== '')
  if (validContacts.length === 0) {
    errors.kontak = 'Minimal satu kontak harus diisi'
  }
  
  // Validate email format
  const emailContacts = formData.kontak.filter(contact => 
    contact.jenis_kontak === 'email' && contact.kontak.trim() !== ''
  )
  
  for (const emailContact of emailContacts) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailContact.kontak)) {
      errors.kontak = 'Format email tidak valid'
      break
    }
  }
  
  // Validate kartu identitas
  const validIdCards = formData.kartu_identitas.filter(idCard => idCard.nomor_id.trim() !== '')
  if (validIdCards.length === 0) {
    errors.kartu_identitas = 'Minimal satu kartu identitas harus diisi'
  }
  
  return !Object.values(errors).some(error => error !== '')
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    if (props.isEditing) {
      // Emit data for parent component to handle
      emit('submit', formData)
    } else {
      await memberService.create({
        nama: formData.nama,
        alamat: formData.alamat,
        latitude: formData.latitude,
        longitude: formData.longitude,
        foto: formData.foto,
        kontak: formData.kontak,
        kartu_identitas: formData.kartu_identitas
      })

      toast('Berhasil', {
        description: `Anggota ${formData.nama} berhasil ditambahkan`,
      })

      // Redirect to members list
      router.push('/members')
    }

  } catch (err: any) {
    error('Gagal Menyimpan', {
      description: err?.message || 'Terjadi kesalahan saat menyimpan data anggota',
    })
  } finally {
    loading.value = false
  }
}

// Cancel handler
const handleCancel = () => {
  if (props.isEditing) {
    emit('cancel')
  } else {
    router.push('/members')
  }
}
</script>

<style scoped>
.required::after {
  content: " *";
  color: hsl(var(--destructive));
}
</style>