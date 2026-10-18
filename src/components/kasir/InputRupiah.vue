<template>
  <div class="relative">
    <span
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      :class="besar ? 'text-base font-medium' : 'text-sm'"
    >Rp</span>
    <input
      :id="id"
      ref="el"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="tampil"
      :placeholder="placeholder ?? '0'"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      :disabled="disabled"
      class="w-full rounded-lg border bg-background pr-3 tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:cursor-not-allowed disabled:opacity-50"
      :class="[besar ? 'h-12 pl-11 text-xl font-semibold' : 'h-10 pl-10 text-sm', invalid ? 'border-red-500' : 'border-border']"
      @input="onInput"
      @keydown.enter.prevent="$emit('enter')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatAngka } from '@/lib/format'

/** Input rupiah dengan pemisah ribuan ("100.000"); nilai model berupa angka bulat atau null. */
const props = defineProps<{
  modelValue: number | null
  id?: string
  placeholder?: string
  ariaLabel?: string
  besar?: boolean
  invalid?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [nilai: number | null]
  enter: []
}>()

const el = ref<HTMLInputElement | null>(null)
const tampil = computed(() => (props.modelValue === null || props.modelValue === undefined ? '' : formatAngka(props.modelValue)))

const onInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  // Jaga posisi kursor: hitung digit di kanan kursor sebelum diformat ulang.
  const kursor = input.selectionStart ?? input.value.length
  const digitKanan = input.value.slice(kursor).replace(/\D/g, '').length
  const digit = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 13)
  const nilai = digit ? Number(digit) : null
  emit('update:modelValue', nilai)

  const teks = nilai === null ? '' : formatAngka(nilai)
  input.value = teks
  let posisi = teks.length
  if (digitKanan > 0) {
    let hitung = 0
    for (let i = teks.length - 1; i >= 0; i--) {
      if (/\d/.test(teks[i])) hitung++
      if (hitung === digitKanan) {
        posisi = i
        break
      }
    }
  }
  if (document.activeElement === input) input.setSelectionRange(posisi, posisi)
}

defineExpose({
  // Input sering berada di panel yang sedang bergeser masuk — jangan ikut menggulir halaman.
  focus: () => el.value?.focus({ preventScroll: true }),
  select: () => el.value?.select()
})
</script>
