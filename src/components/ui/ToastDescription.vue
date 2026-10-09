<template>
  <div
    :class="cn(
      'text-sm opacity-90',
      $attrs.class as string
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface ToastDescriptionProps {
  class?: string
}

defineProps<ToastDescriptionProps>()
</script>
