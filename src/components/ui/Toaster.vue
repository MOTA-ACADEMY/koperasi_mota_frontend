<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] pointer-events-none">
      <div :class="getPositionClasses(position)">
        <TransitionGroup
          name="toast"
          tag="div"
          class="space-y-2"
        >
          <div
            v-for="toast in visibleToasts"
            :key="toast.id"
            :class="getToastClasses(toast)"
            class="pointer-events-auto"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0 mt-0.5">
                <CheckCircle 
                  v-if="toast.type === 'success'" 
                  class="h-5 w-5 text-green-500" 
                />
                <XCircle 
                  v-else-if="toast.type === 'error'" 
                  class="h-5 w-5 text-red-500" 
                />
                <AlertTriangle 
                  v-else-if="toast.type === 'warning'" 
                  class="h-5 w-5 text-yellow-500" 
                />
                <Info 
                  v-else-if="toast.type === 'info'" 
                  class="h-5 w-5 text-blue-500" 
                />
                <Loader2 
                  v-else-if="toast.type === 'loading'" 
                  class="h-5 w-5 text-gray-500 animate-spin" 
                />
                <MessageSquare 
                  v-else 
                  class="h-5 w-5 text-gray-500" 
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm">
                  {{ toast.title }}
                </div>
                <div 
                  v-if="toast.description" 
                  class="text-sm text-muted-foreground mt-1"
                >
                  {{ toast.description }}
                </div>
                
                <!-- Action Buttons -->
                <div v-if="toast.action || toast.cancel" class="flex gap-2 mt-3">
                  <Button
                    v-if="toast.action"
                    size="sm"
                    variant="outline"
                    @click="handleAction(toast)"
                  >
                    {{ toast.action.label }}
                  </Button>
                  <Button
                    v-if="toast.cancel"
                    size="sm"
                    variant="ghost"
                    @click="handleCancel(toast)"
                  >
                    {{ toast.cancel.label || 'Cancel' }}
                  </Button>
                </div>
              </div>

              <!-- Close Button -->
              <Button
                v-if="toast.dismissible !== false"
                size="sm"
                variant="ghost"
                class="flex-shrink-0 p-1 h-6 w-6"
                @click="removeToast(toast.id)"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  CheckCircle, XCircle, AlertTriangle, Info, 
  Loader2, MessageSquare, X 
} from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import { Button } from '@/components/ui'

interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  class?: string
}

const { position = 'bottom-right' } = defineProps<ToasterProps>()

const toastStore = useToastStore()

const visibleToasts = computed(() => toastStore.toasts)

const getPositionClasses = (pos: string) => {
  const positions = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  }
  return `fixed ${positions[pos as keyof typeof positions]} flex flex-col w-full max-w-sm`
}

const getToastClasses = (toast: any) => {
  const baseClasses = 'rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300'
  const typeClasses = {
    default: 'bg-background border-border',
    success: 'bg-background border-green-200 dark:border-green-800',
    error: 'bg-background border-red-200 dark:border-red-800',
    warning: 'bg-background border-yellow-200 dark:border-yellow-800',
    info: 'bg-background border-blue-200 dark:border-blue-800',
    loading: 'bg-background border-border',
  }
  return `${baseClasses} ${typeClasses[toast.type as keyof typeof typeClasses] || typeClasses.default}`
}

const handleAction = (toast: any) => {
  if (toast.action?.onClick) {
    toast.action.onClick()
  }
  if (toast.action?.dismissOnClick !== false) {
    removeToast(toast.id)
  }
}

const handleCancel = (toast: any) => {
  if (toast.cancel?.onClick) {
    toast.cancel.onClick()
  }
  removeToast(toast.id)
}

const removeToast = (id: string) => {
  toastStore.removeToast(id)
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
