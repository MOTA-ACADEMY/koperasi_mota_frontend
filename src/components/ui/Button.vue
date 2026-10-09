<template>
  <button
    role="button"
    :class="cn(buttonVariants({ variant, size }), ($attrs.class as string))"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { buttonVariants } from './index'
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'default' | 'primary' | 'info' | 'warning' | 'danger' | 'black' | 'white' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'green'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
}

defineProps<ButtonProps>()
</script>
