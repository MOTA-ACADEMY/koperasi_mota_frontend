<template>
  <div 
    ref="checkboxRef"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer transition-all duration-200',
      checked ? 'bg-primary text-primary-foreground' : 'bg-background',
      $attrs.class as string
    )"
    role="checkbox"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
    tabindex="0"
  >
    <div v-if="checked" class="flex items-center justify-center text-current">
      <Check class="h-3 w-3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked?: boolean
  class?: string
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  checked: false
})

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const checkboxRef = ref<HTMLElement>()

const toggle = () => {
  emit('update:checked', !props.checked)
}
</script>
