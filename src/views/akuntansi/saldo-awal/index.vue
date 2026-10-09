<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Saldo Awal</h1>
        <p class="text-muted-foreground mt-1">Saldo awal per akun, bulan pertama diisi manual — bulan berikutnya di-generate</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-border">
      <nav class="flex space-x-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2.5 px-4 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Input Tab -->
    <div v-if="activeTab === 'input'" class="space-y-4">
      <Card>
        <CardContent class="p-4 flex flex-wrap items-center justify-between gap-3">
          <div class="text-sm">
            <span class="text-muted-foreground">Bulan/Tahun: </span>
            <span class="font-semibold">{{ monthName(indexData?.bulan_periode) }} {{ indexData?.tahun_periode }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge :variant="indexData?.is_verified ? 'green' : 'secondary'">
              {{ indexData?.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi' }}
            </Badge>
            <Button
              v-if="!indexData?.is_verified"
              variant="outline" size="sm" :disabled="saving"
              @click="simpan"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </Button>
            <Button
              v-if="!indexData?.is_verified"
              variant="primary" size="sm" :disabled="verifying"
              @click="verifikasi"
            >
              {{ verifying ? 'Memverifikasi...' : 'Verifikasi' }}
            </Button>
            <Button
              v-else
              variant="destructive" size="sm" :disabled="verifying"
              @click="bukaVerifikasi"
            >
              Buka Verifikasi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div v-if="loading" class="py-16 text-center text-sm text-muted-foreground">Memuat...</div>
          <div v-else-if="flatInput.length === 0" class="py-16 text-center text-sm text-muted-foreground">
            Belum ada master akun.
          </div>
          <div v-else class="space-y-0.5">
            <div
              v-for="row in flatInput"
              :key="row.node.id"
              class="flex items-center justify-between gap-3 border-b border-border/50 px-2 py-2"
              :style="{ paddingLeft: `${row.depth * 20 + 8}px` }"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="text-xs text-muted-foreground font-mono shrink-0 min-w-[80px]">{{ row.node.full_kode }}</span>
                <span class="text-sm truncate" :class="{ 'font-semibold': !row.node.is_final }">{{ row.node.nama_akun }}</span>
                <Badge variant="outline" class="text-[10px] w-7 justify-center shrink-0">{{ row.node.karakter_akun }}</Badge>
              </div>
              <div class="w-40 shrink-0">
                <Input
                  v-if="row.node.is_final"
                  type="number"
                  min="0"
                  :disabled="indexData?.is_verified"
                  :model-value="edits[row.node.id]"
                  @update:model-value="(v) => (edits[row.node.id] = Number(v))"
                  class="text-right"
                />
                <div v-else class="text-right text-sm font-semibold pr-3">
                  {{ formatCurrency(row.node.nominal) }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Matrix Tab -->
    <div v-if="activeTab === 'matrix'" class="space-y-4">
      <Card>
        <CardContent class="p-0 overflow-x-auto">
          <table v-if="!matrixLoading && matrixData" class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="text-left p-3 font-medium min-w-[240px]">Akun</th>
                <th v-for="m in matrixData.months" :key="m.key" class="text-right p-3 font-medium min-w-[130px]">
                  <div class="flex flex-col items-end gap-1">
                    <span>{{ m.label }}</span>
                    <Button
                      v-if="m.key !== matrixData.months[0].key"
                      variant="outline" size="sm" class="h-6 text-[10px] px-2"
                      @click="generate(m.bulan, m.tahun)"
                    >
                      Generate
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in flatMatrix" :key="row.node.id" class="border-b border-border/50">
                <td class="p-3" :style="{ paddingLeft: `${row.depth * 20 + 12}px` }">
                  <span :class="{ 'font-semibold': !row.node.is_final }">{{ row.node.nama_akun }}</span>
                </td>
                <td v-for="m in matrixData.months" :key="m.key" class="text-right p-3 tabular-nums">
                  {{ row.node.nominals[m.key] !== null ? formatCurrency(row.node.nominals[m.key]) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="py-16 text-center text-sm text-muted-foreground">Memuat...</div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  saldoAwalService,
  type SaldoAwalIndexResponse,
  type SaldoAwalNode,
  type SaldoAwalMatrixResponse,
  type MatrixNode
} from '@/services/akuntansi/saldoAwalService'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'

const { success, error } = useToast()

const tabs = [
  { id: 'input', name: 'Input Saldo Awal' },
  { id: 'matrix', name: 'Matrix Bulanan' }
]
const activeTab = ref<'input' | 'matrix'>('input')

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const monthName = (n?: number) => (n ? monthNames[n - 1] : '-')

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const loading = ref(false)
const saving = ref(false)
const verifying = ref(false)
const indexData = ref<SaldoAwalIndexResponse | null>(null)
const edits = reactive<Record<number, number>>({})

function flattenInput(nodes: SaldoAwalNode[], depth = 0): { node: SaldoAwalNode; depth: number }[] {
  const result: { node: SaldoAwalNode; depth: number }[] = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.children?.length) result.push(...flattenInput(node.children, depth + 1))
  }
  return result
}
const flatInput = computed(() => (indexData.value ? flattenInput(indexData.value.tree) : []))

const loadIndex = async () => {
  loading.value = true
  try {
    indexData.value = await saldoAwalService.index()
    Object.keys(edits).forEach((k) => delete edits[Number(k)])
    flatInput.value.forEach((row) => {
      if (row.node.is_final) edits[row.node.id] = row.node.nominal
    })
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat saldo awal' })
  } finally {
    loading.value = false
  }
}

const simpan = async () => {
  saving.value = true
  try {
    const saldos = Object.entries(edits).map(([master_akun_id, nominal]) => ({
      master_akun_id: Number(master_akun_id),
      nominal: Number(nominal) || 0
    }))
    await saldoAwalService.simpan(saldos)
    success('Berhasil', { description: 'Saldo awal berhasil disimpan' })
    await loadIndex()
  } catch (err: any) {
    error('Gagal Menyimpan', { description: err?.data?.errors?.saldos?.[0] || err?.message || 'Terjadi kesalahan' })
  } finally {
    saving.value = false
  }
}

const verifikasi = async () => {
  verifying.value = true
  try {
    await saldoAwalService.verifikasi()
    success('Berhasil', { description: 'Saldo awal berhasil diverifikasi' })
    await loadIndex()
  } catch (err: any) {
    error('Gagal Verifikasi', { description: err?.data?.errors?.saldo?.[0] || err?.message || 'Terjadi kesalahan' })
  } finally {
    verifying.value = false
  }
}

const bukaVerifikasi = async () => {
  verifying.value = true
  try {
    await saldoAwalService.bukaVerifikasi()
    success('Berhasil', { description: 'Verifikasi berhasil dibuka' })
    await loadIndex()
  } catch (err: any) {
    error('Gagal', { description: err?.message || 'Terjadi kesalahan' })
  } finally {
    verifying.value = false
  }
}

// --- Matrix ---
const matrixLoading = ref(false)
const matrixData = ref<SaldoAwalMatrixResponse | null>(null)

function flattenMatrix(nodes: MatrixNode[], depth = 0): { node: MatrixNode; depth: number }[] {
  const result: { node: MatrixNode; depth: number }[] = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.children?.length) result.push(...flattenMatrix(node.children, depth + 1))
  }
  return result
}
const flatMatrix = computed(() => (matrixData.value ? flattenMatrix(matrixData.value.tree) : []))

const loadMatrix = async () => {
  matrixLoading.value = true
  try {
    matrixData.value = await saldoAwalService.matrix()
  } catch (err: any) {
    error('Gagal Memuat', { description: err?.message || 'Tidak dapat memuat matrix saldo awal' })
  } finally {
    matrixLoading.value = false
  }
}

const generate = async (bulan: number, tahun: number) => {
  try {
    const result = await saldoAwalService.generate(bulan, tahun)
    success('Berhasil', { description: result.message })
    await loadMatrix()
  } catch (err: any) {
    error('Gagal Generate', { description: err?.data?.errors?.bulan?.[0] || err?.message || 'Terjadi kesalahan' })
  }
}

watch(activeTab, (tab) => {
  if (tab === 'matrix' && !matrixData.value) {
    loadMatrix()
  }
})

onMounted(loadIndex)
</script>
