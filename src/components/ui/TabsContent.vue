<template>
  <div
    v-if="isActive"
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      $attrs.class as string
    )"
    role="tabpanel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface TabsContentProps {
  value: string
  isActive?: boolean
  class?: string
}

defineProps<TabsContentProps>()
</script>
