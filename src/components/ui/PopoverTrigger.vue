<template>
  <div class="relative inline-block">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<Emits>()
</script>
