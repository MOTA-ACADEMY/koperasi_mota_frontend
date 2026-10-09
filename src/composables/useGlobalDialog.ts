import { ref } from 'vue'

// Simple global state to track which dialog is open
export const globalDialogState = ref<string | null>(null)

export function useGlobalDialog() {
  const openDialog = (id: string) => {
    globalDialogState.value = id
  }
  
  const closeDialog = () => {
    globalDialogState.value = null
  }
  
  const isDialogOpen = (id: string) => {
    return globalDialogState.value === id
  }
  
  return {
    openDialog,
    closeDialog,
    isDialogOpen,
    activeDialog: globalDialogState
  }
}
