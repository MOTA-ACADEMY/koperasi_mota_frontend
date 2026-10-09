<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <Card v-for="i in 3" :key="i">
        <CardContent class="p-6">
          <Skeleton class="h-4 w-1/4 mb-4" />
          <div class="space-y-3">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Member Identity Data -->
    <div v-else-if="memberData" class="space-y-6">
      <!-- Profile Section -->
      <Card>
        <CardContent class="p-6 space-y-8">
          <div class="border-b border-border pb-4">
            <h3 class="text-lg font-semibold text-foreground">Profil Anggota</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Informasi pribadi anggota koperasi
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Photo Section -->
            <div class="lg:col-span-1">
              <div class="space-y-4">
                <Label class="text-base font-medium">Foto Profil</Label>
                <div class="flex flex-col items-center space-y-4">
                  <div class="h-40 w-40 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img 
                      v-if="memberData.foto" 
                      :src="memberData.foto" 
                      :alt="memberData.nama"
                      class="h-full w-full object-cover"
                    />
                    <User 
                      v-else 
                      class="h-16 w-16 text-muted-foreground" 
                    />
                  </div>
                  <Badge :variant="memberData.status === 'aktif' ? 'green' : 'red'" class="text-sm">
                    {{ memberData.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
                  </Badge>
                </div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="lg:col-span-2 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Kode Anggota -->
                <div class="space-y-2">
                  <Label class="text-sm font-medium text-muted-foreground">Kode Anggota</Label>
                  <div class="p-3 bg-muted rounded-lg">
                    <p class="font-medium">{{ memberData.kode }}</p>
                  </div>
                </div>

                <!-- Status -->
                <div class="space-y-2">
                  <Label class="text-sm font-medium text-muted-foreground">Status</Label>
                  <div class="p-3 bg-muted rounded-lg">
                    <Badge :variant="memberData.status === 'aktif' ? 'green' : 'red'">
                      {{ memberData.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
                    </Badge>
                  </div>
                </div>
              </div>

              <!-- Nama -->
              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                <div class="p-3 bg-muted rounded-lg">
                  <p class="font-medium">{{ memberData.nama }}</p>
                </div>
              </div>

              <!-- Alamat -->
              <div class="space-y-2">
                <Label class="text-sm font-medium text-muted-foreground">Alamat</Label>
                <div class="p-3 bg-muted rounded-lg space-y-2">
                  <p>{{ memberData.alamat }}</p>
                  <a
                    v-if="memberData.latitude != null && memberData.longitude != null"
                    :href="`https://www.openstreetmap.org/?mlat=${memberData.latitude}&mlon=${memberData.longitude}#map=17/${memberData.latitude}/${memberData.longitude}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <MapPin class="h-3 w-3" /> Lihat titik lokasi di peta
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Contact Information -->
      <Card>
        <CardContent class="p-6 space-y-6">
          <div class="border-b border-border pb-4">
            <h3 class="text-lg font-semibold text-foreground">Informasi Kontak</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(contact, index) in memberData.kontak"
              :key="index"
              class="p-4 border border-border rounded-lg bg-card"
            >
              <div class="flex items-center gap-3">
                <component 
                  :is="getContactIcon(contact.jenis_kontak)" 
                  class="h-5 w-5 text-primary"
                />
                <div>
                  <p class="text-xs text-muted-foreground">{{ getContactLabel(contact.jenis_kontak) }}</p>
                  <p class="font-medium">{{ contact.kontak }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ID Card Information -->
      <Card>
        <CardContent class="p-6 space-y-6">
          <div class="border-b border-border pb-4">
            <h3 class="text-lg font-semibold text-foreground">Kartu Identitas</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(idCard, index) in memberData.kartu_identitas"
              :key="index"
              class="p-4 border border-border rounded-lg bg-card"
            >
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <CreditCard class="h-5 w-5 text-primary" />
                  <div>
                    <p class="text-xs text-muted-foreground">{{ getIdCardLabel(idCard.jenis_id) }}</p>
                    <p class="font-medium">{{ idCard.nomor_id }}</p>
                  </div>
                </div>
                
                <div v-if="idCard.file_scan" class="mt-3">
                  <Button variant="outline" size="sm" class="gap-2">
                    <FileText class="h-4 w-4" />
                    Lihat File Scan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8">
      <p class="text-muted-foreground">Data anggota tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mail, Phone, MessageSquare, User, CreditCard, FileText, MapPin } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  memberData?: any
  loading?: boolean
}

defineProps<Props>()

const getContactIcon = (type: string) => {
  const icons = {
    email: Mail,
    no_telp: Phone,
    whatsapp: MessageSquare
  }
  return icons[type as keyof typeof icons] || Mail
}

const getContactLabel = (type: string) => {
  const labels = {
    email: 'Email',
    no_telp: 'No. Telepon',
    whatsapp: 'WhatsApp'
  }
  return labels[type as keyof typeof labels] || 'Kontak'
}

const getIdCardLabel = (type: string) => {
  const labels = {
    ktp: 'KTP',
    sim: 'SIM',
    passport: 'Passport',
    kartu_mahasiswa: 'Kartu Mahasiswa',
    kartu_pegawai: 'Kartu Pegawai',
    lainnya: 'Lainnya'
  }
  return labels[type as keyof typeof labels] || 'ID Card'
}
</script>