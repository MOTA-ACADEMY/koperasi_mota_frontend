<template>
  <Teleport to="body">
    <Transition name="dialog" appear>
      <div 
        v-if="isVisible"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        @click.self="handleClose"
      >
        <!-- This is just the overlay - DialogContent will provide the actual dialog box -->
        <div class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

interface DialogProps {
  open: boolean
}

const props = defineProps<DialogProps>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { openDialog, closeDialog, isDialogOpen, activeDialog } = useGlobalDialog()

// Generate a unique ID for this dialog instance
const dialogId = `dialog-${Math.random().toString(36).substr(2, 9)}`

// This dialog is visible only if it's the active one globally
const isVisible = computed(() => {
  return props.open && isDialogOpen(dialogId)
})

// Watch for changes to the open prop
watch(() => props.open, (newOpen) => {
  if (newOpen) {
    openDialog(dialogId)
  } else if (isDialogOpen(dialogId)) {
    closeDialog()
  }
})

// Watch for global dialog changes
watch(activeDialog, (activeId) => {
  if (activeId !== dialogId && props.open) {
    // Another dialog opened, close this one
    emit('update:open', false)
  }
})

const handleClose = () => {
  closeDialog()
  emit('update:open', false)
}

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isVisible.value) {
    handleClose()
  }
}

// Body scroll management
watch(activeDialog, (activeId) => {
  if (typeof document !== 'undefined') {
    if (activeId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  
  // If this dialog was active when unmounted, close it
  if (isDialogOpen(dialogId)) {
    closeDialog()
  }
  
  // Reset body scroll if no dialogs are open
  if (!activeDialog.value && typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div > *,
.dialog-leave-to > div > * {
  opacity: 0;
  transform: scale(0.95);
}
</style>
