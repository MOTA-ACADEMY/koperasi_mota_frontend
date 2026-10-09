<template>
  <h3
    :class="cn(
      'text-2xl font-semibold leading-none tracking-tight pb-2',
      $attrs.class as string
    )"
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardTitleProps {
  class?: string
}

defineProps<CardTitleProps>()
</script>
