<template>
  <div
    :class="cn(
      'flex h-10 items-center justify-center rounded-md bg-muted px-4 text-sm text-muted-foreground',
      $attrs.class as string
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TableCaptionProps {
  class?: string
}

defineProps<TableCaptionProps>()
</script>
