<template>
  <div
    :class="cn(
      'p-4 pt-0',
      $attrs.class as string
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardContentProps {
  class?: string
}

defineProps<CardContentProps>()
</script>
