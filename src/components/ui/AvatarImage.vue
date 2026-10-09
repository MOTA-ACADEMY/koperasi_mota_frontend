<template>
  <img
    :class="cn('aspect-square h-full w-full', ($attrs.class as string))"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface AvatarImageProps {
  class?: string
}

defineProps<AvatarImageProps>()
</script>
