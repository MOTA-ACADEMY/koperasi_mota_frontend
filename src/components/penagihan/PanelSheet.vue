<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[60] bg-black/40" aria-hidden="true" @click="$emit('close')" />
    </Transition>

    <!-- Bottom sheet di ponsel, panel kanan di layar lebar -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      :enter-from-class="'translate-y-full sm:translate-y-0 sm:translate-x-full'"
      leave-active-class="transition-transform duration-150 ease-in"
      :leave-to-class="'translate-y-full sm:translate-y-0 sm:translate-x-full'"
    >
      <section
        v-if="open"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="fixed inset-x-0 bottom-0 z-[61] flex max-h-[92vh] flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <div class="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />
        <header class="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
          <button
            v-if="back"
            type="button"
            class="-ml-1 mt-0.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Kembali"
            @click="$emit('back')"
          >
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-semibold text-foreground">{{ title }}</h2>
            <p v-if="subtitle" class="mt-0.5 truncate text-sm text-muted-foreground">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Tutup"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="shrink-0 border-t border-border bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <slot name="footer" />
        </footer>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { ArrowLeft, X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  back?: boolean
}>()

const emit = defineEmits<{
  close: []
  back: []
}>()

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
