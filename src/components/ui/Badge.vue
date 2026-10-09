<template>
  <div :class="cn(badgeVariants({ variant }), ($attrs.class as string))">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        green:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        red:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'green' | 'red'
  class?: string
}

defineProps<BadgeProps>()
</script>
