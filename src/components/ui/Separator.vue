<template>
  <div :class="cn('shrink-0', ($attrs.class as string))">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  class?: string
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true
})
</script>
