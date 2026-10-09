<template>
  <div
    :class="cn(
      'relative overflow-hidden rounded-lg bg-background p-2',
      $attrs.class as string
    )"
  >
    <div class="flex h-[200px] flex-col justify-end rounded-md bg-muted/50 p-6">
      <div class="flex flex-col space-y-2">
        <h3 class="font-semibold">
          <slot name="title" />
        </h3>
        <p class="text-sm text-muted-foreground">
          <slot name="description" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface DemoContainerProps {
  class?: string
}

defineProps<DemoContainerProps>()
</script>
