<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isActive 
        ? 'bg-background text-foreground shadow-sm' 
        : 'text-muted-foreground hover:bg-background/50',
      $attrs.class as string
    )"
    role="tab"
    :aria-selected="isActive"
    @click="$emit('select', value)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TabsTriggerProps {
  value: string
  isActive?: boolean
  class?: string
}

defineProps<TabsTriggerProps>()
defineEmits<{
  select: [value: string]
}>()
</script>
