<template>
  <div
    :class="cn(
      'animate-pulse rounded-md bg-muted',
      $attrs.class as string
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface SkeletonProps {
  class?: string
}

defineProps<SkeletonProps>()
</script>
