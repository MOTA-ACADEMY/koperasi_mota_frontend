<template>
  <thead
    :class="cn(
      '[&_tr]:border-b',
      $attrs.class as string
    )"
  >
    <slot />
  </thead>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TableHeaderProps {
  class?: string
}

defineProps<TableHeaderProps>()
</script>
