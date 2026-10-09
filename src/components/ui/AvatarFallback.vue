<template>
  <span
    :class="cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      ($attrs.class as string)
    )"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface AvatarFallbackProps {
  class?: string
}

defineProps<AvatarFallbackProps>()
</script>
