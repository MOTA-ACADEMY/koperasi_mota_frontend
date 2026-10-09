<template>
  <div class="p-6 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-foreground">Dialog Component Demo</h1>
      <p class="text-muted-foreground">
        Comprehensive demonstration of Dialog components with various configurations and use cases.
      </p>
    </div>

    <!-- Basic Dialog Examples -->
    <div class="bg-card rounded-lg shadow-sm border p-6 space-y-6">
      <h2 class="text-xl font-semibold text-foreground">Basic Dialogs</h2>
      
      <!-- Simple Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Simple Information Dialog</h3>
        <p class="text-sm text-muted-foreground">Basic dialog with title, content, and close button.</p>
        <Button @click="openSimpleDialog">Open Simple Dialog</Button>
      </div>

      <!-- Confirmation Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Confirmation Dialog</h3>
        <p class="text-sm text-muted-foreground">Dialog with action buttons for confirmation workflows.</p>
        <Button @click="openConfirmDialog" variant="destructive">Delete Item</Button>
      </div>

      <!-- Form Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Form Dialog</h3>
        <p class="text-sm text-muted-foreground">Dialog containing a form with input validation.</p>
        <Button @click="openFormDialog" variant="outline">Add User</Button>
      </div>
    </div>

    <!-- Advanced Dialog Examples -->
    <div class="bg-card rounded-lg shadow-sm border p-6 space-y-6">
      <h2 class="text-xl font-semibold text-foreground">Advanced Dialogs</h2>
      
      <!-- Large Content Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Large Content Dialog</h3>
        <p class="text-sm text-muted-foreground">Dialog with scrollable content and custom sizing.</p>
        <Button @click="openLargeDialog" variant="secondary">View Details</Button>
      </div>

      <!-- Multi-step Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Multi-step Wizard</h3>
        <p class="text-sm text-muted-foreground">Dialog with multiple steps and navigation.</p>
        <Button @click="openWizardDialog">Start Setup Wizard</Button>
      </div>

      <!-- Custom Styled Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Custom Styled Dialog</h3>
        <p class="text-sm text-muted-foreground">Dialog with custom styling and animations.</p>
        <Button @click="openCustomDialog" variant="outline">Open Custom Dialog</Button>
      </div>
    </div>

    <!-- Dialog Component Showcase -->
    <div class="bg-card rounded-lg shadow-sm border p-6 space-y-6">
      <h2 class="text-xl font-semibold text-foreground">Component Variations</h2>
      
      <!-- Alert Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Alert Dialog</h3>
        <p class="text-sm text-muted-foreground">Alert-style dialog for important notifications.</p>
        <div class="flex gap-2">
          <Button @click="openSuccessAlert" variant="default">Success Alert</Button>
          <Button @click="openWarningAlert" variant="secondary">Warning Alert</Button>
          <Button @click="openErrorAlert" variant="destructive">Error Alert</Button>
        </div>
      </div>

      <!-- Modal vs Dialog -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium text-foreground">Modal Behavior</h3>
        <p class="text-sm text-muted-foreground">Dialogs with different modal behaviors.</p>
        <div class="flex gap-2">
          <Button @click="openModalDialog">Modal Dialog</Button>
          <Button @click="openNonModalDialog" variant="outline">Non-Modal Dialog</Button>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="bg-muted/50 rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-3 text-foreground">Event Log</h3>
      <div class="max-h-48 overflow-y-auto space-y-1">
        <div
          v-for="(event, index) in eventLog"
          :key="index"
          class="text-sm font-mono bg-card p-2 rounded border"
        >
          <span class="text-primary">{{ event.timestamp }}</span>
          <span class="text-muted-foreground mx-2">-</span>
          <span class="text-foreground">{{ event.message }}</span>
        </div>
      </div>
      <Button 
        v-if="eventLog.length > 0" 
        @click="clearEventLog" 
        variant="outline" 
        size="sm" 
        class="mt-2"
      >
        Clear Log
      </Button>
    </div>

    <!-- Dialog Components -->
    
    <!-- Simple Dialog -->
    <Dialog v-model:open="simpleDialogOpen" id="simple-dialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            This is a simple dialog with basic content. You can use this pattern for displaying information to users.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="closeSimpleDialog">Cancel</Button>
          <Button @click="confirmSimpleDialog">Got it</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Confirmation Dialog -->
    <Dialog v-model:open="confirmDialogOpen" id="confirm-dialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="cancelDelete">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Form Dialog -->
    <Dialog v-model:open="formDialogOpen" id="form-dialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Please fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitForm" class="space-y-4 pt-4">
          <div class="space-y-2">
            <Label for="name">Full Name</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Enter full name"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter email address"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="role">Role</Label>
            <select
              id="role"
              v-model="formData.role"
              class="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            >
              <option value="">Select a role</option>
              <option value="admin">Administrator</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="cancelForm">Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Large Content Dialog -->
    <Dialog v-model:open="largeDialogOpen">
      <DialogContent class="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Information</DialogTitle>
          <DialogDescription>
            This dialog contains a large amount of content with scrollable area.
          </DialogDescription>
        </DialogHeader>
        <div class="pt-4 space-y-4">
          <div v-for="section in 10" :key="section" class="space-y-2">
            <h4 class="font-medium text-foreground">Section {{ section }}</h4>
            <p class="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p class="text-sm text-muted-foreground">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>
          </div>
        </div>
        <div class="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" @click="closeLargeDialog">Close</Button>
          <Button @click="confirmLargeDialog">Accept</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Wizard Dialog -->
    <Dialog v-model:open="wizardDialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Setup Wizard - Step {{ currentStep }} of 3</DialogTitle>
          <DialogDescription>
            Complete the setup process by following these steps.
          </DialogDescription>
        </DialogHeader>
        
        <!-- Progress indicator -->
        <div class="flex items-center space-x-2 pt-4">
          <div 
            v-for="step in 3" 
            :key="step"
            :class="[
              'h-2 flex-1 rounded',
              step <= currentStep ? 'bg-primary' : 'bg-muted'
            ]"
          />
        </div>

        <!-- Step content -->
        <div class="pt-6">
          <div v-if="currentStep === 1" class="space-y-4">
            <h4 class="font-medium">Basic Information</h4>
            <div class="space-y-2">
              <Label>Company Name</Label>
              <Input v-model="wizardData.companyName" placeholder="Enter company name" />
            </div>
          </div>
          
          <div v-else-if="currentStep === 2" class="space-y-4">
            <h4 class="font-medium">Configuration</h4>
            <div class="space-y-2">
              <Label>Settings</Label>
              <div class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="wizardData.enableNotifications" />
                  <span class="text-sm">Enable notifications</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="wizardData.enableAnalytics" />
                  <span class="text-sm">Enable analytics</span>
                </label>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentStep === 3" class="space-y-4">
            <h4 class="font-medium">Review & Confirm</h4>
            <div class="bg-muted/50 p-4 rounded-lg space-y-2">
              <p><strong>Company:</strong> {{ wizardData.companyName || 'Not set' }}</p>
              <p><strong>Notifications:</strong> {{ wizardData.enableNotifications ? 'Enabled' : 'Disabled' }}</p>
              <p><strong>Analytics:</strong> {{ wizardData.enableAnalytics ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between pt-6">
          <Button 
            variant="outline" 
            @click="currentStep > 1 ? previousStep() : cancelWizard()"
          >
            {{ currentStep > 1 ? 'Previous' : 'Cancel' }}
          </Button>
          <Button 
            @click="currentStep < 3 ? nextStep() : completeWizard()"
          >
            {{ currentStep < 3 ? 'Next' : 'Complete' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Custom Dialog -->
    <Dialog v-model:open="customDialogOpen">
      <DialogContent class="sm:max-w-md border-2 border-primary">
        <div class="text-center space-y-4 pt-4">
          <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Star class="h-8 w-8 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle class="text-center">Congratulations!</DialogTitle>
            <DialogDescription class="text-center">
              You've unlocked a special achievement. This dialog showcases custom styling possibilities.
            </DialogDescription>
          </DialogHeader>
          <div class="flex justify-center pt-4">
            <Button @click="closeCustomDialog" class="bg-gradient-to-r from-primary to-primary/80">
              Awesome!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Alert Dialogs -->
    <Dialog v-model:open="alertDialogOpen">
      <DialogContent class="sm:max-w-md">
        <div class="flex items-start space-x-4">
          <div :class="[
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            alertType === 'success' ? 'bg-green-100 text-green-600' : '',
            alertType === 'warning' ? 'bg-yellow-100 text-yellow-600' : '',
            alertType === 'error' ? 'bg-red-100 text-red-600' : ''
          ]">
            <CheckCircle v-if="alertType === 'success'" class="h-6 w-6" />
            <AlertTriangle v-else-if="alertType === 'warning'" class="h-6 w-6" />
            <XCircle v-else-if="alertType === 'error'" class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <DialogHeader class="text-left">
              <DialogTitle>{{ alertTitle }}</DialogTitle>
              <DialogDescription>{{ alertMessage }}</DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <div class="flex justify-end pt-4">
          <Button @click="closeAlert">OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Star, CheckCircle, AlertTriangle, XCircle 
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label
} from '@/components/ui'

// Event logging
const eventLog = ref<Array<{ timestamp: string; message: string }>>([])

const logEvent = (message: string) => {
  eventLog.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message
  })
  
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20)
  }
}

const clearEventLog = () => {
  eventLog.value = []
  logEvent('Event log cleared')
}

// Dialog states
const simpleDialogOpen = ref(false)
const confirmDialogOpen = ref(false)
const formDialogOpen = ref(false)
const largeDialogOpen = ref(false)
const wizardDialogOpen = ref(false)
const customDialogOpen = ref(false)
const alertDialogOpen = ref(false)

// Function to close all dialogs
const closeAllDialogs = () => {
  simpleDialogOpen.value = false
  confirmDialogOpen.value = false
  formDialogOpen.value = false
  largeDialogOpen.value = false
  wizardDialogOpen.value = false
  customDialogOpen.value = false
  alertDialogOpen.value = false
  
  // Also ensure body overflow is reset
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    document.body.classList.remove('dialog-open')
  }
}

// Form data
const formData = reactive({
  name: '',
  email: '',
  role: ''
})

// Wizard data
const wizardData = reactive({
  companyName: '',
  enableNotifications: false,
  enableAnalytics: false
})

const currentStep = ref(1)

// Alert data
const alertType = ref<'success' | 'warning' | 'error'>('success')
const alertTitle = ref('')
const alertMessage = ref('')

// Simple Dialog
const openSimpleDialog = () => {
  closeAllDialogs()
  simpleDialogOpen.value = true
  logEvent('Opened simple dialog')
}

const closeSimpleDialog = () => {
  simpleDialogOpen.value = false
  logEvent('Closed simple dialog')
}

const confirmSimpleDialog = () => {
  simpleDialogOpen.value = false
  logEvent('Confirmed simple dialog')
}

// Confirmation Dialog
const openConfirmDialog = () => {
  closeAllDialogs()
  confirmDialogOpen.value = true
  logEvent('Opened confirmation dialog')
}

const cancelDelete = () => {
  confirmDialogOpen.value = false
  logEvent('Cancelled deletion')
}

const confirmDelete = () => {
  confirmDialogOpen.value = false
  logEvent('Confirmed deletion - item deleted')
}

// Form Dialog
const openFormDialog = () => {
  closeAllDialogs()
  formDialogOpen.value = true
  formData.name = ''
  formData.email = ''
  formData.role = ''
  logEvent('Opened form dialog')
}

const cancelForm = () => {
  formDialogOpen.value = false
  logEvent('Cancelled form')
}

const submitForm = () => {
  if (formData.name && formData.email && formData.role) {
    formDialogOpen.value = false
    logEvent(`Created user: ${formData.name} (${formData.email}) as ${formData.role}`)
  }
}

// Large Dialog
const openLargeDialog = () => {
  closeAllDialogs()
  largeDialogOpen.value = true
  logEvent('Opened large content dialog')
}

const closeLargeDialog = () => {
  largeDialogOpen.value = false
  logEvent('Closed large dialog')
}

const confirmLargeDialog = () => {
  largeDialogOpen.value = false
  logEvent('Accepted large dialog content')
}

// Wizard Dialog
const openWizardDialog = () => {
  wizardDialogOpen.value = true
  currentStep.value = 1
  wizardData.companyName = ''
  wizardData.enableNotifications = false
  wizardData.enableAnalytics = false
  logEvent('Started setup wizard')
}

const cancelWizard = () => {
  wizardDialogOpen.value = false
  logEvent('Cancelled setup wizard')
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
    logEvent(`Wizard: moved to step ${currentStep.value}`)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    logEvent(`Wizard: moved to step ${currentStep.value}`)
  }
}

const completeWizard = () => {
  wizardDialogOpen.value = false
  logEvent('Completed setup wizard')
}

// Custom Dialog
const openCustomDialog = () => {
  customDialogOpen.value = true
  logEvent('Opened custom styled dialog')
}

const closeCustomDialog = () => {
  customDialogOpen.value = false
  logEvent('Closed custom dialog')
}

// Alert Dialogs
const openSuccessAlert = () => {
  closeAllDialogs()
  alertType.value = 'success'
  alertTitle.value = 'Success!'
  alertMessage.value = 'Your operation has been completed successfully.'
  alertDialogOpen.value = true
  logEvent('Opened success alert')
}

const openWarningAlert = () => {
  closeAllDialogs()
  alertType.value = 'warning'
  alertTitle.value = 'Warning'
  alertMessage.value = 'This action requires your attention before proceeding.'
  alertDialogOpen.value = true
  logEvent('Opened warning alert')
}

const openErrorAlert = () => {
  closeAllDialogs()
  alertType.value = 'error'
  alertTitle.value = 'Error'
  alertMessage.value = 'An error occurred while processing your request.'
  alertDialogOpen.value = true
  logEvent('Opened error alert')
}

const closeAlert = () => {
  alertDialogOpen.value = false
  logEvent(`Closed ${alertType.value} alert`)
}

// Modal behavior examples
const openModalDialog = () => {
  // This would be the same as simpleDialog but with different content
  simpleDialogOpen.value = true
  logEvent('Opened modal dialog (blocks interaction)')
}

const openNonModalDialog = () => {
  // This would require a different implementation for non-modal behavior
  simpleDialogOpen.value = true
  logEvent('Opened non-modal dialog (allows background interaction)')
}
</script>
