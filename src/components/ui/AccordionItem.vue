<template>
  <div
    :class="cn(
      'border-b',
      $attrs.class as string
    )"
  >
    <button
      :class="cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        $attrs.class as string
      )"
      @click="toggle"
      :aria-expanded="isOpen"
    >
      <slot name="trigger" />
      <ChevronDown class="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
    <div
      v-if="isOpen"
      class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    >
      <div class="pb-4 pt-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  class?: string
}

defineProps<AccordionItemProps>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>
