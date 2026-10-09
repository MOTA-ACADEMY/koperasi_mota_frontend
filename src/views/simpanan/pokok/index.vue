<template>
  <div class="min-h-full p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Simpanan Pokok</h1>
        <p class="text-muted-foreground mt-1">
          Kelola tagihan dan pembayaran simpanan pokok anggota
        </p>
      </div>
      <Button 
        variant="green"
        class="gap-2" 
        @click="handleCreateBilling"
      >
        <Plus class="h-4 w-4" />
        Buat Tagihan
      </Button>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-border rounded-t-lg">
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

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- View Tagihan Tab -->
      <div v-if="activeTab === 'view'" class="space-y-6">
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
                  :class="statusFilter === 'lunas' ? 'bg-green-500 text-white' : ''"
                  @click="handleStatusFilter('lunas')"
                >
                  Lunas
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  :class="statusFilter === 'belum_lunas' ? 'bg-red-500 text-white' : ''"
                  @click="handleStatusFilter('belum_lunas')"
                >
                  Belum Lunas
                </Button>
              </div>

              <!-- Period Filter -->
              <div class="flex gap-2">
                <select 
                  v-model="selectedYear" 
                  class="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm w-32"
                >
                  <option value="">Pilih Tahun</option>
                  <option v-for="year in years" :key="year" :value="year.toString()">
                    {{ year }}
                  </option>
                </select>

                <select 
                  v-model="selectedMonth" 
                  class="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm w-40"
                >
                  <option value="">Semua Bulan</option>
                  <option v-for="(month, index) in months" :key="index" :value="(index + 1).toString()">
                    {{ month }}
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Data Table -->
        <Card>
          <CardContent class="p-4">
            <div class="pt-4">
              <DataTable
                :columns="viewColumns"
                :actions="viewActions"
                :data="filteredBillings"
                :loading="isLoading"
                searchable
                @search="handleSearch"
              >
                <!-- Custom cell for Period -->
                <template #cell-period="{ item }">
                  <div class="font-medium">
                    {{ formatPeriod(item.period) }}
                  </div>
                </template>

                <!-- Custom cell for Amount -->
                <template #cell-amount="{ item }">
                  <div class="font-medium">
                    {{ formatCurrency(item.amount) }}
                  </div>
                </template>

                <!-- Custom cell for Status -->
                <template #cell-status="{ item }">
                  <Badge 
                    :variant="item.status === 'lunas' ? 'green' : 'red'"
                  >
                    {{ item.status === 'lunas' ? 'Lunas' : 'Belum Lunas' }}
                  </Badge>
                </template>

                <!-- Custom cell for Due Date -->
                <template #cell-due_date="{ item }">
                  <div class="text-sm">
                    {{ formatDate(item.due_date) }}
                  </div>
                </template>
              </DataTable>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Input Tagihan Tab -->
      <div v-if="activeTab === 'create'" class="space-y-6">
        <Card>
          <div class="py-4 px-4">
            <CardTitle>Buat Tagihan Simpanan Pokok</CardTitle>
            <CardDescription>
            Pilih periode dan anggota yang akan ditagih
            </CardDescription>
          </div>
          <hr>
          <CardContent class="space-y-6">
            <!-- Periode Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="space-y-2">
                <Label for="billing-year">Tahun Tagihan</Label>
                <select 
                  v-model="billingForm.year" 
                  class="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm w-full"
                >
                  <option value="">Pilih Tahun</option>
                  <option v-for="year in years" :key="year" :value="year.toString()">
                    {{ year }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="billing-month">Bulan Tagihan</Label>
                <select 
                  v-model="billingForm.month" 
                  class="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm w-full"
                >
                  <option value="">Pilih Bulan</option>
                  <option v-for="(month, index) in months" :key="index" :value="(index + 1).toString()">
                    {{ month }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Members Table -->
            <div class="space-y-4 pt-4">
              <div class="flex items-center justify-between">
                <Label class="text-base font-medium">Pilih Anggota</Label>
                <div class="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    @click="selectAllMembers"
                  >
                    Pilih Semua
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    @click="deselectAllMembers"
                  >
                    Batalkan Semua
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent class="p-4">
                  <div class="pt-4">
                    <DataTable
                      :columns="memberColumns"
                      :data="members"
                      :loading="isLoadingMembers"
                      searchable
                      @search="handleMemberSearch"
                    >
                      <!-- Custom cell for checkbox -->
                      <template #cell-select="{ item }">
                        <Checkbox
                          :checked="selectedMembers.includes(item.id)"
                          @update:checked="(checked) => toggleMemberSelection(item.id, checked)"
                        />
                      </template>

                      <!-- Custom cell for amount input -->
                      <template #cell-amount="{ item }">
                        <div class="flex items-center gap-2">
                          <span class="text-sm">Rp</span>
                          <Input
                            type="number"
                            :model-value="getMemberAmount(item.id)"
                            @update:model-value="(value: string | number) => updateMemberAmount(item.id, Number(value))"
                            class="w-32"
                            placeholder="50000"
                          />
                        </div>
                      </template>
                    </DataTable>
                  </div>
                </CardContent>
              </Card>
            </div>

            <!-- Submit Actions -->
            <div class="flex justify-end gap-4">
              <Button variant="outline" @click="resetForm">
                Batal
              </Button>
              <Button 
                @click="submitBilling"
                :disabled="!billingForm.year || !billingForm.month || selectedMembers.length === 0"
                class="bg-green-600 hover:bg-green-700"
              >
                <Save class="h-4 w-4 mr-2" />
                Simpan Tagihan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Save, Eye, Edit, Trash2, FileText, PlusCircle } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import { useToast } from '@/composables/useToast'
import { useSimpananStore } from '@/stores'

const { toast, error } = useToast()
const simpananStore = useSimpananStore()

// Tab configuration
const tabs = [
  { id: 'view', name: 'Lihat Tagihan', icon: FileText },
  { id: 'create', name: 'Input Tagihan', icon: PlusCircle }
]

// Tab state
const activeTab = ref<string>('view')

// Filter state
const statusFilter = ref<'all' | 'lunas' | 'belum_lunas'>('all')
const selectedYear = ref<string>(new Date().getFullYear().toString())
const selectedMonth = ref<string>('')

// Form state
const billingForm = ref({
  year: new Date().getFullYear().toString(),
  month: (new Date().getMonth() + 1).toString(),
  amount: 50000 // Default amount for simpanan pokok
})

// Data state
const isLoading = ref(false)
const isLoadingMembers = ref(false)
const billings = ref<any[]>([])
const members = ref<any[]>([])
const selectedMembers = ref<string[]>([])
const memberAmounts = ref<Record<string, number>>({})

// Constants
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

// Table columns for viewing bills
const viewColumns = computed(() => [
  {
    key: 'period',
    label: 'Periode',
    sortable: true
  },
  {
    key: 'member_name',
    label: 'Nama Anggota',
    sortable: true
  },
  {
    key: 'member_id',
    label: 'ID Anggota',
    sortable: true
  },
  {
    key: 'amount',
    label: 'Jumlah',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true
  },
  {
    key: 'due_date',
    label: 'Jatuh Tempo',
    sortable: true
  }
])

// Table actions for viewing bills
const viewActions = computed(() => [
  {
    key: 'view',
    icon: Eye,
    variant: 'outline' as const,
    size: 'sm' as const,
    handler: (item: any) => viewDetail(item.id)
  },
  {
    key: 'edit',
    icon: Edit,
    variant: 'outline' as const,
    size: 'sm' as const,
    handler: (item: any) => editBilling(item.id)
  },
  {
    key: 'delete',
    icon: Trash2,
    variant: 'destructive' as const,
    size: 'sm' as const,
    handler: (item: any) => deleteBilling(item.id)
  }
])

// Table columns for member selection
const memberColumns = computed(() => [
  {
    key: 'select',
    label: 'Pilih'
  },
  {
    key: 'kode',
    label: 'Kode Anggota',
    sortable: true
  },
  {
    key: 'nama',
    label: 'Nama Anggota',
    sortable: true
  },
  {
    key: 'amount',
    label: 'Jumlah Tagihan'
  }
])

// Computed
const filteredBillings = computed(() => {
  let filtered = billings.value

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(bill => bill.status === statusFilter.value)
  }

  if (selectedYear.value) {
    filtered = filtered.filter(bill => bill.period.startsWith(selectedYear.value))
  }

  if (selectedMonth.value) {
    const monthPadded = selectedMonth.value.padStart(2, '0')
    filtered = filtered.filter(bill => bill.period.endsWith(`-${monthPadded}`))
  }

  return filtered
})

// Methods
const handleCreateBilling = () => {
  activeTab.value = 'create'
}

const handleStatusFilter = (status: 'all' | 'lunas' | 'belum_lunas') => {
  statusFilter.value = status
}

const handleSearch = (query: string) => {
  // Implement search functionality if needed
  console.log('Search:', query)
}

const handleMemberSearch = (query: string) => {
  // Implement member search functionality if needed
  console.log('Member Search:', query)
}

const toggleMemberSelection = (memberId: string, checked: boolean) => {
  if (checked) {
    if (!selectedMembers.value.includes(memberId)) {
      selectedMembers.value.push(memberId)
    }
  } else {
    selectedMembers.value = selectedMembers.value.filter(id => id !== memberId)
  }
}

const getMemberAmount = (memberId: string): number => {
  return memberAmounts.value[memberId] || billingForm.value.amount
}

const updateMemberAmount = (memberId: string, amount: number) => {
  memberAmounts.value[memberId] = amount
}

const selectAllMembers = () => {
  selectedMembers.value = members.value.map(m => m.id)
}

const deselectAllMembers = () => {
  selectedMembers.value = []
}

const resetForm = () => {
  billingForm.value = {
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    amount: 50000
  }
  selectedMembers.value = []
  memberAmounts.value = {}
  activeTab.value = 'view'
}

const submitBilling = async () => {
  try {
    isLoading.value = true

    const billingData = {
      type: 'pokok' as const,
      period: `${billingForm.value.year}-${billingForm.value.month.padStart(2, '0')}`,
      members: selectedMembers.value.map(memberId => ({
        member_id: memberId,
        amount: getMemberAmount(memberId)
      }))
    }

    await simpananStore.createBilling(billingData)
    
    toast('Sukses', {
      description: 'Tagihan berhasil dibuat'
    })

    resetForm()
    await loadBillings()
  } catch (err) {
    error('Error', {
      description: 'Gagal membuat tagihan'
    })
  } finally {
    isLoading.value = false
  }
}

const loadBillings = async () => {
  try {
    isLoading.value = true
    billings.value = await simpananStore.getBillings('pokok')
  } catch (err) {
    console.error('Failed to load billings:', err)
  } finally {
    isLoading.value = false
  }
}

const loadMembers = async () => {
  try {
    isLoadingMembers.value = true
    members.value = await simpananStore.getActiveMembers()
    // Initialize member amounts
    members.value.forEach(member => {
      memberAmounts.value[member.id] = billingForm.value.amount
    })
  } catch (err) {
    console.error('Failed to load members:', err)
  } finally {
    isLoadingMembers.value = false
  }
}

const viewDetail = (id: string) => {
  // Implementation for viewing detail
  console.log('View detail:', id)
}

const editBilling = (id: string) => {
  // Implementation for editing billing
  console.log('Edit billing:', id)
}

const deleteBilling = async (id: string) => {
  try {
    await simpananStore.deleteBilling(id)
    toast('Sukses', {
      description: 'Tagihan berhasil dihapus'
    })
    await loadBillings()
  } catch (err) {
    error('Error', {
      description: 'Gagal menghapus tagihan'
    })
  }
}

// Utility functions
const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-')
  return `${months[parseInt(month) - 1]} ${year}`
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID')
}

// Lifecycle
onMounted(() => {
  loadBillings()
  loadMembers()
})
</script>