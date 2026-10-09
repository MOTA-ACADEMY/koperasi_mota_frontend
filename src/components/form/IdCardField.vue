<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Label class="text-sm font-medium">Kartu Identitas</Label>
      <Button 
        type="button"
        variant="outline" 
        size="sm"
        @click="addIdCard"
        class="gap-2"
      >
        <Plus class="h-4 w-4" />
        Tambah ID Card
      </Button>
    </div>

    <div class="space-y-3">
      <div 
        v-for="(idCard, index) in idCards" 
        :key="index"
        class="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card"
      >
        <div class="flex gap-3 items-start">
          <!-- ID Card Type Selector -->
          <div class="flex-1">
            <Label :for="`id-type-${index}`" class="text-xs text-muted-foreground">
              Jenis ID Card
            </Label>
            <Select v-model="idCard.jenis_id">
              <option value="ktp">KTP</option>
              <option value="sim">SIM</option>
              <option value="passport">Passport</option>
              <option value="kartu_mahasiswa">Kartu Mahasiswa</option>
              <option value="kartu_pegawai">Kartu Pegawai</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </div>

          <!-- ID Card Number Input -->
          <div class="flex-2">
            <Label :for="`id-number-${index}`" class="text-xs text-muted-foreground">
              {{ getIdLabel(idCard.jenis_id) }}
            </Label>
            <Input
              :id="`id-number-${index}`"
              v-model="idCard.nomor_id"
              type="text"
              :placeholder="getIdPlaceholder(idCard.jenis_id)"
              class="mt-1"
            />
          </div>

          <!-- Remove ID Card Button -->
          <Button
            v-if="idCards.length > 1"
            type="button"
            variant="outline"
            size="sm"
            @click="removeIdCard(index)"
            class="mt-6 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>

        <!-- File Upload Section -->
        <div class="space-y-2">
          <Label :for="`id-file-${index}`" class="text-xs text-muted-foreground">
            File Scan {{ getIdLabel(idCard.jenis_id) }}
          </Label>
          <div class="flex items-center gap-3">
            <!-- File Input -->
            <Input
              :id="`id-file-${index}`"
              :ref="el => fileInputs[index] = el"
              type="file"
              accept="image/*,.pdf"
              @change="(event) => handleFileChange(event, index)"
              class="hidden"
            />
            
            <!-- Upload Button -->
            <!-- <Button
              type="button"
              variant="outline"
              size="sm"
              @click="() => fileInputs[index]?.click()"
              class="gap-2"
            >
              <Upload class="h-4 w-4" />
              {{ idCard.file_scan ? 'Ganti File' : 'Upload File' }}
            </Button> -->
          </div>
          
          <!-- File Info - Moved to bottom -->
          <div class="mt-2">
            <p v-if="idCard.file_scan" class="text-xs text-muted-foreground">
              {{ idCard.file_scan.name }} ({{ formatFileSize(idCard.file_scan.size) }})
            </p>
            <p v-else class="text-xs text-muted-foreground">
              Format: JPG, PNG, PDF. Max 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Trash2, Upload } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'

export interface IdCard {
  jenis_id: 'ktp' | 'sim' | 'passport' | 'kartu_mahasiswa' | 'kartu_pegawai' | 'lainnya'
  nomor_id: string
  file_scan?: File | null
}

interface Props {
  modelValue?: IdCard[]
}

interface Emits {
  (e: 'update:modelValue', value: IdCard[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [{ jenis_id: 'ktp', nomor_id: '', file_scan: null }]
})

const emit = defineEmits<Emits>()

const idCards = ref<IdCard[]>([...props.modelValue])
const fileInputs = ref<(HTMLInputElement | null)[]>([])

// Watch for changes and emit to parent
watch(idCards, (newIdCards) => {
  emit('update:modelValue', newIdCards)
}, { deep: true })

const addIdCard = () => {
  idCards.value.push({
    jenis_id: 'ktp',
    nomor_id: '',
    file_scan: null
  })
}

const removeIdCard = (index: number) => {
  if (idCards.value.length > 1) {
    idCards.value.splice(index, 1)
  }
}

const handleFileChange = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('File harus berupa JPG, PNG, atau PDF')
      return
    }
    
    idCards.value[index].file_scan = file
  }
}

const getIdLabel = (type: string) => {
  const labels = {
    ktp: 'Nomor KTP',
    sim: 'Nomor SIM',
    passport: 'Nomor Passport',
    kartu_mahasiswa: 'NIM/Nomor Mahasiswa',
    kartu_pegawai: 'Nomor Pegawai',
    lainnya: 'Nomor ID'
  }
  return labels[type as keyof typeof labels] || 'Nomor ID'
}

const getIdPlaceholder = (type: string) => {
  const placeholders = {
    ktp: '3201234567890123',
    sim: 'A-1234-5678-901234',
    passport: 'A1234567',
    kartu_mahasiswa: '2021110001',
    kartu_pegawai: 'PEG-2023-001',
    lainnya: 'Masukkan nomor ID'
  }
  return placeholders[type as keyof typeof placeholders] || ''
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>