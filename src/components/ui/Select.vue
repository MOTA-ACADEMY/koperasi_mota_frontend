<template>
  <div class="relative">
    <select
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-foreground',
        $attrs.class as string
      )"
      :value="modelValue"
      v-bind="$attrs"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>
    <ChevronDown class="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface SelectProps {
  class?: string
  modelValue?: string
}

defineProps<SelectProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
