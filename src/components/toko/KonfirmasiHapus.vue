<template>
  <PanelSheet :open="open" :title="judul" :subtitle="nama" @close="$emit('close')">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <Trash2 class="h-5 w-5" />
        </span>
        <p class="text-sm text-foreground">
          <slot>Data <b>{{ nama }}</b> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</slot>
        </p>
      </div>

      <div
        v-if="galat"
        class="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        role="alert"
      >
        <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ galat }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <button type="button" class="tombol-garis" :disabled="memproses" @click="$emit('close')">Batal</button>
        <button
          v-if="galat && bisaNonaktifkan"
          type="button"
          class="tombol-garis"
          :disabled="memproses"
          @click="$emit('nonaktifkan')"
        >
          <EyeOff class="h-4 w-4" /> Nonaktifkan saja
        </button>
        <button type="button" class="tombol-hapus" :disabled="memproses || !!galat" @click="$emit('hapus')">
          <Loader2 v-if="memproses" class="h-4 w-4 animate-spin" />
          Hapus
        </button>
      </div>
    </template>
  </PanelSheet>
</template>

<script setup lang="ts">
import { EyeOff, Loader2, Trash2, TriangleAlert } from 'lucide-vue-next'
import PanelSheet from '@/components/common/PanelSheet.vue'

defineProps<{
  open: boolean
  judul: string
  nama?: string
  /** Pesan galat dari server (mis. 422 "masih dipakai"). */
  galat?: string | null
  memproses?: boolean
  /** Tampilkan tombol "Nonaktifkan saja" saat penghapusan ditolak. */
  bisaNonaktifkan?: boolean
}>()

defineEmits<{
  close: []
  hapus: []
  nonaktifkan: []
}>()
</script>

<style scoped>
@reference "../../assets/main.css";

.tombol-garis {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50;
}

.tombol-hapus {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50;
}
</style>
