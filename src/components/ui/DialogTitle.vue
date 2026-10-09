<template>
  <h1
    :class="cn(
      'text-lg font-semibold leading-none tracking-tight',
      $attrs.class as string
    )"
  >
    <slot />
  </h1>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface DialogTitleProps {
  class?: string
}

defineProps<DialogTitleProps>()
</script>
