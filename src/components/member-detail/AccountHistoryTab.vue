<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <Card v-for="i in 3" :key="i">
        <CardContent class="p-6">
          <Skeleton class="h-4 w-1/4 mb-4" />
          <div class="space-y-3">
            <Skeleton class="h-20 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Account Data -->
    <div v-else-if="memberData" class="space-y-6">
      <!-- Account Summary -->
      <Card>
        <CardContent class="p-6">
          <div class="border-b border-border pb-4 mb-6">
            <h3 class="text-lg font-semibold text-foreground">Ringkasan Akun</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Saldo dan informasi akun koperasi
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Simpanan Pokok -->
            <div class="p-6 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-500 rounded-full">
                  <Wallet class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="text-sm text-blue-700 dark:text-blue-300">Simpanan Pokok</p>
                  <p class="text-2xl font-bold text-blue-800 dark:text-blue-100">
                    Rp {{ formatCurrency(memberData.simpanan_pokok) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Simpanan Wajib -->
            <div class="p-6 border border-border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-green-500 rounded-full">
                  <PiggyBank class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="text-sm text-green-700 dark:text-green-300">Simpanan Wajib</p>
                  <p class="text-2xl font-bold text-green-800 dark:text-green-100">
                    Rp {{ formatCurrency(memberData.simpanan_wajib) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Simpanan Sukarela -->
            <div class="p-6 border border-border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-purple-500 rounded-full">
                  <TrendingUp class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="text-sm text-purple-700 dark:text-purple-300">Simpanan Sukarela</p>
                  <p class="text-2xl font-bold text-purple-800 dark:text-purple-100">
                    Rp {{ formatCurrency(memberData.simpanan_sukarela) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Simpanan -->
          <div class="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-amber-500 rounded-full">
                  <DollarSign class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="text-sm text-amber-700 dark:text-amber-300">Total Simpanan</p>
                  <p class="text-3xl font-bold text-amber-800 dark:text-amber-100">
                    Rp {{ formatCurrency(totalSimpanan) }}
                  </p>
                </div>
              </div>
              <Badge :variant="memberData.status === 'aktif' ? 'green' : 'red'" class="text-sm">
                {{ memberData.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Transaction History -->
      <Card>
        <CardContent class="p-6">
          <div class="border-b border-border pb-4 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-foreground">Riwayat Transaksi</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Histori simpanan dan penarikan
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" class="gap-2">
                  <Filter class="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" class="gap-2">
                  <Download class="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <!-- Transaction List -->
          <div class="space-y-4">
            <div
              v-for="transaction in memberData.riwayat_transaksi"
              :key="transaction.id"
              class="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-2 rounded-full" :class="getTransactionIconStyle(transaction.jenis)">
                    <component 
                      :is="getTransactionIcon(transaction.jenis)" 
                      class="h-5 w-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium">{{ getTransactionTitle(transaction.jenis) }}</p>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar class="h-4 w-4" />
                      <span>{{ formatDate(transaction.tanggal) }}</span>
                      <span>•</span>
                      <span>{{ transaction.keterangan }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p 
                    class="text-lg font-semibold"
                    :class="getAmountColor(transaction.jenis)"
                  >
                    {{ transaction.jenis === 'penarikan' ? '-' : '+' }}Rp {{ formatCurrency(transaction.jumlah) }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Saldo: Rp {{ formatCurrency(transaction.saldo_akhir) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMoreTransactions" class="text-center pt-4">
              <Button variant="outline" class="gap-2">
                <MoreHorizontal class="h-4 w-4" />
                Muat Lebih Banyak
              </Button>
            </div>

            <!-- No Transactions -->
            <div v-else-if="!memberData.riwayat_transaksi?.length" class="text-center py-8">
              <div class="p-4 border-2 border-dashed border-border rounded-lg">
                <Receipt class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p class="text-muted-foreground">Belum ada riwayat transaksi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8">
      <p class="text-muted-foreground">Data akun tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal, 
  Receipt 
} from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  memberData?: any
  loading?: boolean
  hasMoreTransactions?: boolean
}

const props = defineProps<Props>()

const totalSimpanan = computed(() => {
  if (!props.memberData) return 0
  return (
    (props.memberData.simpanan_pokok || 0) +
    (props.memberData.simpanan_wajib || 0) +
    (props.memberData.simpanan_sukarela || 0)
  )
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const getTransactionIcon = (type: string) => {
  return type === 'setoran' ? ArrowUpRight : ArrowDownLeft
}

const getTransactionIconStyle = (type: string) => {
  return type === 'setoran' 
    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
}

const getTransactionTitle = (type: string) => {
  const titles = {
    setoran: 'Setoran Simpanan',
    penarikan: 'Penarikan Simpanan'
  }
  return titles[type as keyof typeof titles] || 'Transaksi'
}

const getAmountColor = (type: string) => {
  return type === 'setoran' 
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
}
</script>