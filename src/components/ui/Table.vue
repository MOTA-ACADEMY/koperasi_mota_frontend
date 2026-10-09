<template>
  <table
    :class="cn(
      'w-full caption-bottom text-sm',
      $attrs.class as string
    )"
  >
    <slot />
  </table>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TableProps {
  class?: string
}

defineProps<TableProps>()
</script>
