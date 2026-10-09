import { ref, computed, readonly } from 'vue'

// Global dialog state
const dialogs = ref<Map<string, boolean>>(new Map())
const dialogOrder = ref<string[]>([])

export function useDialogManager() {
  const registerDialog = (id: string, isOpen: boolean = false) => {
    dialogs.value.set(id, isOpen)
    if (isOpen && !dialogOrder.value.includes(id)) {
      // Close all other dialogs first
      dialogOrder.value.forEach(existingId => {
        if (existingId !== id) {
          dialogs.value.set(existingId, false)
        }
      })
      dialogOrder.value = [id] // Only keep the current dialog
    }
  }

  const openDialog = (id: string) => {
    // Close all other dialogs
    dialogOrder.value.forEach(existingId => {
      if (existingId !== id) {
        dialogs.value.set(existingId, false)
      }
    })
    
    dialogs.value.set(id, true)
    dialogOrder.value = [id] // Reset order to only current dialog
  }

  const closeDialog = (id: string) => {
    dialogs.value.set(id, false)
    const index = dialogOrder.value.indexOf(id)
    if (index > -1) {
      dialogOrder.value.splice(index, 1)
    }
  }

  const closeAllDialogs = () => {
    dialogs.value.forEach((_, id) => {
      dialogs.value.set(id, false)
    })
    dialogOrder.value = []
  }

  const isDialogOpen = (id: string) => {
    return computed(() => dialogs.value.get(id) || false)
  }

  const getActiveDialog = () => {
    return computed(() => dialogOrder.value[dialogOrder.value.length - 1] || null)
  }

  const hasAnyDialogOpen = computed(() => {
    return Array.from(dialogs.value.values()).some(isOpen => isOpen)
  })

  return {
    dialogs: readonly(dialogs),
    dialogOrder: readonly(dialogOrder),
    registerDialog,
    openDialog,
    closeDialog,
    closeAllDialogs,
    isDialogOpen,
    getActiveDialog,
    hasAnyDialogOpen
  }
}

// Export a singleton instance
export const dialogManager = useDialogManager()
