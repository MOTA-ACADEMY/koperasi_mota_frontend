<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to"
    class="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors"
    :class="to ? 'hover:border-green-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40' : ''"
  >
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-green-700 dark:group-hover:text-green-400">
        <component :is="icon" class="h-4 w-4" />
      </span>
    </div>
    <p class="mt-3 text-[28px] font-semibold leading-none tracking-tight text-foreground">{{ value }}</p>
    <p v-if="$slots.default" class="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <slot />
    </p>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string
  icon: Component
  /** Bila diisi, tile menjadi tautan ke halaman detailnya. */
  to?: string
}>()
</script>
