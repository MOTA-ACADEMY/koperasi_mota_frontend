<template>
  <div class="relative">
    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
    <input
      v-bind="$attrs"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="tampil"
      :readonly="readonly"
      class="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30 read-only:bg-muted/60"
      :class="invalid ? 'border-red-500' : 'border-border'"
      :aria-invalid="invalid || undefined"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatAngka } from '@/lib/format'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue: number | null
  invalid?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [nilai: number | null] }>()

const tampil = computed(() => (props.modelValue == null ? '' : formatAngka(props.modelValue)))

/** Ketik angka biasa; pemisah ribuan ditambahkan otomatis tanpa memindah kursor. */
const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const mentah = el.value
  const posisi = el.selectionStart ?? mentah.length
  const digitSebelum = mentah.slice(0, posisi).replace(/\D/g, '').length
  const digit = mentah.replace(/\D/g, '').slice(0, 13)
  const nilai = digit ? Number(digit) : null
  const baru = nilai == null ? '' : formatAngka(nilai)

  el.value = baru
  // Kembalikan kursor ke posisi setelah digit yang sama.
  let pos = 0
  let hitung = Math.max(0, digitSebelum - (digit.length - String(nilai ?? '').length))
  while (pos < baru.length && hitung > 0) {
    if (/\d/.test(baru[pos])) hitung--
    pos++
  }
  if (document.activeElement === el) el.setSelectionRange(pos, pos)

  emit('update:modelValue', nilai)
}
</script>
