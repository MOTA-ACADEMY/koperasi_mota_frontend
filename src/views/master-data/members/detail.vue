<template>
  <div class="min-h-full p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button 
          variant="danger" 
          size="sm" 
          @click="$router.push('/members')"
          class="gap-2"
        >
          <ArrowLeft class="h-4 w-4" />
          Kembali
        </Button>
        <div class="h-6 w-px bg-border"></div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Detail Anggota</h1>
          <p class="text-muted-foreground" v-if="memberData">
            {{ memberData.nama }} - {{ memberData.kode }}
          </p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2">
        <Button variant="green" size="sm" class="gap-2" @click="toggleEditMode">
          <Edit class="h-4 w-4" />
          {{ isEditing ? 'Batal Edit' : 'Edit' }}
        </Button>
        <Button variant="primary" size="sm" class="gap-2" v-if="!isEditing">
          <Printer class="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div v-if="!isEditing" class="border-b border-border rounded-t-lg">
      <nav class="flex space-x-1 bg-white dark:bg-black" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 relative',
            activeTab === tab.id
              ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-400'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          ]"
        >
          <component :is="tab.icon" class="h-4 w-4 inline mr-2" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content or Edit Form -->
    <div class="flex-1">
      <!-- Edit Form -->
      <div v-if="isEditing">
        <AddMemberForm 
          :initial-data="memberData"
          :is-editing="true"
          @submit="handleSaveEdit"
          @cancel="toggleEditMode"
        />
      </div>
      
      <!-- Tab Content (View Mode) -->
      <div v-else>
        <IdentityTab 
          v-if="activeTab === 'identity'" 
          :member-data="memberData"
          :loading="loading"
        />
        <AccountHistoryTab 
          v-if="activeTab === 'account'" 
          :member-data="memberData"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Edit, Printer, User, CreditCard } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { memberService } from '@/services/memberService'
import Button from '@/components/ui/Button.vue'
import IdentityTab from '@/components/member-detail/IdentityTab.vue'
import AccountHistoryTab from '@/components/member-detail/AccountHistoryTab.vue'
import AddMemberForm from '@/components/form/AddMemberForm.vue'

const route = useRoute()
const { error, success } = useToast()

// Tab configuration
const tabs = [
  { id: 'identity', name: 'Data Diri', icon: User },
  { id: 'account', name: 'Riwayat Akun', icon: CreditCard }
]

// State
const activeTab = ref('identity')
const loading = ref(true)
const memberData = ref<any>(null)
const isEditing = ref(false)

// Edit mode functions
const toggleEditMode = () => {
  isEditing.value = !isEditing.value
}

const handleSaveEdit = async (formData: any) => {
  try {
    const id = route.params.id as string
    memberData.value = await memberService.update(id, {
      nama: formData.nama,
      alamat: formData.alamat,
      latitude: formData.latitude,
      longitude: formData.longitude,
      foto: formData.foto,
      kontak: formData.kontak,
      kartu_identitas: formData.kartu_identitas
    })

    success('Berhasil', {
      description: 'Data anggota berhasil diperbarui'
    })

    // Exit edit mode
    isEditing.value = false
  } catch (err) {
    error('Error', {
      description: 'Gagal memperbarui data anggota'
    })
  }
}

const fetchMemberData = async () => {
  loading.value = true
  try {
    memberData.value = await memberService.get(route.params.id as string)
  } catch (err) {
    error('Error', {
      description: 'Gagal memuat data anggota'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMemberData()
})
</script>