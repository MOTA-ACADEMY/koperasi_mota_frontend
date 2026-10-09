<template>
  <div class="min-h-full p-6 space-y-6">
    <!-- Debug Component -->
    <!-- <DebugDarkMode class="mb-6" /> -->
    
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Data Anggota Koperasi</h1>
        <p class="text-muted-foreground mt-1">
          Kelola data anggota koperasi dengan mudah
        </p>
      </div>
      <Button 
        variant="green"
        class="gap-2" 
        @click="handleAddMember"
      >
        <Plus class="h-4 w-4" />
        Tambah Anggota
      </Button>
    </div>

      <!-- Filters -->
      <Card>
        <CardContent class="p-6">
          <div class="flex flex-col sm:flex-row gap-4 pt-4">            
            <!-- Status Filter -->
            <div class="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                :class="statusFilter === 'all' ? 'bg-primary text-primary-foreground' : ''"
                @click="handleStatusFilter('all')"
              >
                Semua
              </Button>
              <Button 
                variant="outline"
                size="sm"
                :class="statusFilter === 'aktif' ? 'bg-primary text-primary-foreground' : ''"
                @click="handleStatusFilter('aktif')"
              >
                Aktif
              </Button>
              <Button 
                variant="outline"
                size="sm"
                :class="statusFilter === 'nonaktif' ? 'bg-primary text-primary-foreground' : ''"
                @click="handleStatusFilter('nonaktif')"
              >
                Non-Aktif
              </Button>
            </div>

            <!-- Refresh Button -->
            <Button variant="outline" @click="handleRefresh" :disabled="membersStore.loading">
              <RotateCcw :class="[
                'h-4 w-4',
                { 'animate-spin': membersStore.loading }
              ]" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Data Table -->
      <Card>
        <CardContent class="p-4">
          <div class="pt-4">
            <DataTable
                :columns="columns"
                :actions="actions"
                :data="membersStore.members"
                :lazy="true"
                :total-records="membersStore.totalRecords"
                :lazy-loading="membersStore.loading"
                :page-size="membersStore.pagination.limit"
                :page-size-options="[5, 10, 20, 50]"
                searchable
                @lazy-load="handleLazyLoad"
                @search="handleSearch"
                @sort="handleSort"
            >
                <!-- Custom cell for Nama with Avatar -->
                <template #cell-nama="{ item }">
                <div class="flex items-center gap-3">
                    <Avatar class="h-10 w-10">
                    <AvatarImage 
                        v-if="item.foto" 
                        :src="item.foto" 
                        :alt="item.nama" 
                    />
                    <AvatarFallback class="bg-primary/10 text-primary">
                        <User class="h-5 w-5" />
                    </AvatarFallback>
                    </Avatar>
                    <div>
                    <div class="font-medium text-foreground">{{ item.nama }}</div>
                    <div class="text-sm text-muted-foreground">{{ item.email || '-' }}</div>
                    </div>
                </div>
                </template>

                <!-- Custom cell for Kontak (merged alamat + telepon) -->
                <template #cell-kontak="{ item }">
                <div class="space-y-1 min-w-[200px]">
                    <div class="flex items-center gap-2 text-sm">
                    <MapPin class="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span class="text-foreground">{{ item.alamat }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                    <Phone class="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span class="text-foreground">{{ item.telepon }}</span>
                    </div>
                </div>
                </template>

                <!-- Custom cell for Status with colored badges -->
                <template #cell-status="{ item }">
                <Badge 
                    :variant="item.status === 'aktif' ? 'green' : 'red'"
                >
                    {{ item.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
                </Badge>
                </template>
            </DataTable>
          </div>
        </CardContent>
      </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, RotateCcw, Eye, UserX, User, Phone, MapPin } from 'lucide-vue-next'
import { useMembersStore, type Member } from '@/stores/members'
import { useToast } from '@/composables/useToast'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'
import DebugDarkMode from '@/components/DebugDarkMode.vue'

// Store and composables
const membersStore = useMembersStore()
const { toast, error } = useToast()
const route = useRoute()
const router = useRouter()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref<'all' | 'aktif' | 'nonaktif'>('all')

// Lazy loading handler
const handleLazyLoad = (event: any) => {
  membersStore.loadLazy({
    page: event.page,
    rows: event.rows,
    sortField: event.sortField,
    sortOrder: event.sortOrder,
    globalFilter: event.globalFilter,
    filters: event.filters
  })
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  // The search will be triggered through lazy loading
}

const handleSort = (_key: string, _direction: 'asc' | 'desc') => {
  // Sorting will be handled through lazy loading
}

const handleStatusFilter = (status: 'all' | 'aktif' | 'nonaktif') => {
  statusFilter.value = status
  membersStore.setStatusFilter(status)
  // Trigger lazy reload with new filter
  handleLazyLoad({
    page: 1,
    rows: membersStore.pagination.limit,
    sortField: '',
    sortOrder: 'asc',
    globalFilter: searchQuery.value,
    filters: { status: status === 'all' ? null : status }
  })
}

const handleRefresh = () => {
  handleLazyLoad({
    page: membersStore.pagination.page,
    rows: membersStore.pagination.limit,
    sortField: '',
    sortOrder: 'asc',
    globalFilter: searchQuery.value,
    filters: { status: statusFilter.value === 'all' ? null : statusFilter.value }
  })
}

// Member actions
const handleAddMember = () => {
  // toast('Tambah Anggota', {
  //   description: 'Fitur tambah anggota akan segera tersedia',
  // })
  router.push('/members/add')
  // TODO: Navigate to add member page or open modal
}

const handleDetail = (member: Member) => {
  router.push(`/members/${member.id}`)
}

const handleToggleStatus = async (member: Member) => {
  const newStatus = member.status === 'aktif' ? 'nonaktif' : 'aktif'
  const action = newStatus === 'aktif' ? 'mengaktifkan' : 'menonaktifkan'
  
  const success = await membersStore.updateMemberStatus(member.id, newStatus)
  
  if (success) {
    toast('Status Updated', {
      description: `Berhasil ${action} anggota ${member.nama}`,
    })
  } else {
    error('Error', {
      description: `Gagal ${action} anggota ${member.nama}`,
    })
  }
}

// DataTable columns configuration - with custom rendering
const columns = computed(() => [
  {
    key: 'kode',
    label: 'Kode',
    sortable: true
  },
  {
    key: 'nama',
    label: 'Nama Anggota',
    sortable: true
  },
  {
    key: 'kontak',
    label: 'Kontak',
    sortable: false
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  }
])

// DataTable actions configuration
const actions = computed(() => [
  {
    key: 'view',
    icon: Eye,
    variant: 'outline' as const,
    size: 'sm' as const,
    handler: (member: Member) => handleDetail(member)
  },
  {
    key: 'toggle',
    icon: UserX, // We'll handle the dynamic icon elsewhere
    variant: 'outline' as const,
    size: 'sm' as const,
    handler: (member: Member) => handleToggleStatus(member)
  }
])

// Lifecycle
onMounted(() => {
  // DataTable with lazy=true will automatically trigger the first load
})
</script>