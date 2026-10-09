<template>
  <div
    :class="cn(
      'group-[.toast]:text-xs group-[.toast]:font-medium',
      $attrs.class as string
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface ToastTitleProps {
  class?: string
}

defineProps<ToastTitleProps>()
</script>
