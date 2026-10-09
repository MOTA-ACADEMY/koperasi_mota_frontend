<template>
  <div
    :class="cn(
      'relative w-full rounded-lg border p-4',
      alertVariants({ variant }),
      $attrs.class as string
    )"
    role="alert"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning:
          'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600',
        success:
          'border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  class?: string
}

defineProps<AlertProps>()
</script>
