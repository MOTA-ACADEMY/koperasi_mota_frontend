<template>
  <tbody
    :class="cn(
      '[&_tr:last-child]:border-0',
      $attrs.class as string
    )"
  >
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TableBodyProps {
  class?: string
}

defineProps<TableBodyProps>()
</script>
