<template>
  <div
    :class="cn(
      'fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      $attrs.class as string
    )"
    style="z-index: 9998;"
    @click="$emit('close')"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface DialogOverlayProps {
  class?: string
}

defineProps<DialogOverlayProps>()
defineEmits<{
  close: []
}>()
</script>
