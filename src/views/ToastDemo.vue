<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Toast System</h1>
      <p class="text-muted-foreground">
        A Vue-native toast notification system with various types and customization options.
      </p>
    </div>

    <div class="grid gap-6">
      <!-- Basic Toasts -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Toasts</CardTitle>
          <CardDescription>
            Simple toast notifications with different types
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showBasicToast">
              Default
            </Button>
            <Button @click="showSuccessToast" variant="outline">
              Success
            </Button>
            <Button @click="showErrorToast" variant="outline">
              Error
            </Button>
            <Button @click="showWarningToast" variant="outline">
              Warning
            </Button>
            <Button @click="showInfoToast" variant="outline">
              Info
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Toast with Description -->
      <Card>
        <CardHeader>
          <CardTitle>With Description</CardTitle>
          <CardDescription>
            Toasts with additional description text
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showToastWithDescription">
              Show Description
            </Button>
            <Button @click="showLongDescription" variant="outline">
              Long Description
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Interactive Toasts -->
      <Card>
        <CardHeader>
          <CardTitle>Interactive Toasts</CardTitle>
          <CardDescription>
            Toasts with action buttons and custom interactions
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showActionToast">
              With Action
            </Button>
            <Button @click="showCancelableToast" variant="outline">
              With Cancel
            </Button>
            <Button @click="showBothActionsToast" variant="outline">
              Both Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Loading & Promise -->
      <Card>
        <CardHeader>
          <CardTitle>Loading & Promise</CardTitle>
          <CardDescription>
            Loading states and promise-based toasts
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showLoadingToast">
              Loading
            </Button>
            <Button @click="showPromiseSuccess" variant="outline">
              Promise Success
            </Button>
            <Button @click="showPromiseError" variant="outline">
              Promise Error
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Custom Duration -->
      <Card>
        <CardHeader>
          <CardTitle>Custom Duration</CardTitle>
          <CardDescription>
            Control how long toasts stay visible
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showShortToast">
              Short (1s)
            </Button>
            <Button @click="showLongToast" variant="outline">
              Long (10s)
            </Button>
            <Button @click="showPersistentToast" variant="outline">
              Persistent
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Bulk Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Manage multiple toasts at once
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button @click="showMultipleToasts">
              Show Multiple
            </Button>
            <Button @click="clearAllToasts" variant="outline">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  Button 
} from '@/components/ui'

const toast = useToast()

// Basic toasts
const showBasicToast = () => {
  toast.toast('Default toast message')
}

const showSuccessToast = () => {
  toast.success('Operation completed successfully!')
}

const showErrorToast = () => {
  toast.error('Something went wrong')
}

const showWarningToast = () => {
  toast.warning('Please review your settings')
}

const showInfoToast = () => {
  toast.info('New update available')
}

// With description
const showToastWithDescription = () => {
  toast.success('Profile updated', {
    description: 'Your profile information has been saved successfully.'
  })
}

const showLongDescription = () => {
  toast.info('System Maintenance', {
    description: 'We will be performing scheduled maintenance on our servers tonight from 2:00 AM to 4:00 AM EST. During this time, some features may be temporarily unavailable.'
  })
}

// Interactive toasts
const showActionToast = () => {
  toast.success('File uploaded', {
    description: 'Your file has been uploaded successfully.',
    action: {
      label: 'View',
      onClick: () => {
        toast.info('Opening file viewer...')
      }
    }
  })
}

const showCancelableToast = () => {
  toast.warning('Delete confirmation', {
    description: 'This action cannot be undone.',
    cancel: {
      label: 'Cancel',
      onClick: () => {
        toast.info('Action cancelled')
      }
    }
  })
}

const showBothActionsToast = () => {
  toast.info('Invitation sent', {
    description: 'An invitation has been sent to the user.',
    action: {
      label: 'Resend',
      onClick: () => {
        toast.success('Invitation resent!')
      }
    },
    cancel: {
      label: 'Undo',
      onClick: () => {
        toast.success('Invitation cancelled')
      }
    }
  })
}

// Loading & Promise
const showLoadingToast = () => {
  const loadingId = toast.loading('Processing your request...')
  
  // Simulate completion after 3 seconds
  setTimeout(() => {
    toast.dismiss(loadingId)
    toast.success('Request completed!')
  }, 3000)
}

const showPromiseSuccess = () => {
  const fakeApiCall = new Promise<{ message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Data loaded successfully' })
    }, 2000)
  })

  toast.promise(fakeApiCall, {
    loading: 'Loading data...',
    success: (data) => data.message,
    error: 'Failed to load data'
  })
}

const showPromiseError = () => {
  const fakeApiCall = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Network error'))
    }, 2000)
  })

  toast.promise(fakeApiCall, {
    loading: 'Saving changes...',
    success: 'Changes saved successfully',
    error: (err) => `Error: ${err.message}`
  })
}

// Custom duration
const showShortToast = () => {
  toast.info('Quick message', {
    duration: 1000
  })
}

const showLongToast = () => {
  toast.warning('Important notice', {
    description: 'This message will stay for 10 seconds.',
    duration: 10000
  })
}

const showPersistentToast = () => {
  toast.error('Critical error', {
    description: 'This message requires manual dismissal.',
    persistent: true
  })
}

// Bulk actions
const showMultipleToasts = () => {
  toast.success('First toast')
  setTimeout(() => toast.info('Second toast'), 200)
  setTimeout(() => toast.warning('Third toast'), 400)
  setTimeout(() => toast.error('Fourth toast'), 600)
}

const clearAllToasts = () => {
  toast.clearAll()
  toast.success('All toasts cleared')
}
</script>
