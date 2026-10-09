<template>
  <div :class="[
    'min-h-full transition-all duration-300',
    darkModeStore.themeClasses.main
  ]">
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div>
        <h1 :class="[
          'text-3xl font-bold transition-colors duration-300',
          darkModeStore.themeClasses.text.primary
        ]">
          Shadcn/ui Components Demo
        </h1>
        <p :class="[
          'text-lg mt-1 transition-colors duration-300',
          darkModeStore.themeClasses.text.muted
        ]">
          All available Shadcn/ui components installed and ready to use
        </p>
      </div>

      <!-- Buttons Section -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Buttons</CardTitle>
          <div class="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Form Components -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Form Components</CardTitle>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
            <div>
              <Label>Input Field</Label>
              <Input placeholder="Enter some text..." class="mt-1" />
            </div>
            <div>
              <Label>Textarea</Label>
              <Textarea placeholder="Enter a longer text..." class="mt-1" />
            </div>
            <div>
              <Label>Vue Select (Single)</Label>
              <VueSelect
                v-model="selectedCountry"
                :options="countries"
                placeholder="Search for a country..."
                class="mt-1"
                searchable
                mode="single"
              />
              <p class="text-sm text-muted-foreground mt-1" v-if="selectedCountry">
                Selected: {{ getCountryLabel(selectedCountry) }}
              </p>
            </div>
            <div>
              <Label>Vue Select (Multiple)</Label>
              <VueSelect
                v-model="selectedCountries"
                :options="countries"
                placeholder="Select multiple countries..."
                class="mt-1"
                searchable
                mode="multiple"
                :close-on-select="false"
              />
              <p class="text-sm text-muted-foreground mt-1" v-if="selectedCountries && selectedCountries.length > 0">
                Selected {{ selectedCountries.length }} countries
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox :checked="checkboxValue" @update:checked="checkboxValue = $event" />
              <Label>Checkbox option</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Switch :checked="switchValue" @update:checked="switchValue = $event" />
              <Label>Switch option</Label>
            </div>
            <div>
              <Label>Progress</Label>
              <Progress :value="75" class="mt-2" />
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

      <!-- Alerts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Alert>
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>This is a default alert message.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle class="h-4 w-4" />
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>This is an error alert message.</AlertDescription>
        </Alert>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content area.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Another Card</CardTitle>
            <CardDescription>With different content</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>New</Badge>
            <Badge variant="secondary" class="ml-2">Popular</Badge>
            <Badge variant="destructive" class="ml-2">Limited</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar Demo</CardTitle>
          </CardHeader>
          <CardContent class="flex space-x-2">
            <Avatar>
              <AvatarFallback class="bg-green-500 text-white">JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback class="bg-green-600 text-white">AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback class="bg-green-700 text-white">CD</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs Demo -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Tabs</CardTitle>
          <div>
            <TabsList>
              <TabsTrigger 
                value="tab1" 
                :isActive="activeTab === 'tab1'"
                @select="activeTab = $event"
              >
                Tab 1
              </TabsTrigger>
              <TabsTrigger 
                value="tab2" 
                :isActive="activeTab === 'tab2'"
                @select="activeTab = $event"
              >
                Tab 2
              </TabsTrigger>
              <TabsTrigger 
                value="tab3" 
                :isActive="activeTab === 'tab3'"
                @select="activeTab = $event"
              >
                Tab 3
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" :isActive="activeTab === 'tab1'">
              <p class="mt-4">Content for Tab 1</p>
            </TabsContent>
            <TabsContent value="tab2" :isActive="activeTab === 'tab2'">
              <p class="mt-4">Content for Tab 2</p>
            </TabsContent>
            <TabsContent value="tab3" :isActive="activeTab === 'tab3'">
              <p class="mt-4">Content for Tab 3</p>
            </TabsContent>
          </div>
        </CardContent>
      </Card>

      <!-- Table Demo -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Table</CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell><Badge variant="secondary">Active</Badge></TableCell>
              <TableCell>$1,200</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">Edit</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell><Badge>Pending</Badge></TableCell>
              <TableCell>$850</TableCell>
              <TableCell>
                <Button size="sm" variant="outline">Edit</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      <!-- Accordion Demo -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Accordion</CardTitle>
        <div class="space-y-2">
          <AccordionItem>
            <template #trigger>What is Shadcn/ui?</template>
            <p>Shadcn/ui is a collection of reusable components built using Radix UI and Tailwind CSS.</p>
          </AccordionItem>
          <AccordionItem>
            <template #trigger>How do I use these components?</template>
            <p>Simply import them from the components/ui directory and use them in your Vue templates.</p>
          </AccordionItem>
          <AccordionItem>
            <template #trigger>Are they customizable?</template>
            <p>Yes! All components are fully customizable using Tailwind CSS classes and can be themed.</p>
          </AccordionItem>
        </div>
        </CardContent>
      </Card>

      <!-- Skeleton Demo -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Loading States</CardTitle>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="space-y-2">
                <Skeleton class="h-4 w-[250px]" />
                <Skeleton class="h-4 w-[200px]" />
              </div>
            </div>
            <Separator />
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-[80%]" />
              <Skeleton class="h-4 w-[60%]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Toast Demo -->
      <Card>
        <CardContent class="p-4">
          <CardTitle class="mb-4">Toast Notifications (Vue Native)</CardTitle>
          <div class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Vue-native toast system with support for different types, descriptions, and interactive actions.
            </p>
            <div class="flex flex-wrap gap-4">
              <Button @click="showToast('default')">Default Toast</Button>
              <Button @click="showToast('success')" variant="outline">Success Toast</Button>
              <Button @click="showToast('warning')" variant="secondary">Warning Toast</Button>
              <Button @click="showToast('error')" variant="destructive">Error Toast</Button>
            </div>
            <div class="text-sm space-y-1">
              <div>
                <RouterLink to="/dashboard/toast-demo" class="text-primary hover:underline">
                  → View full toast demo page for more examples
                </RouterLink>
              </div>
              <div>
                <RouterLink to="/dashboard/datatable-demo" class="text-primary hover:underline">
                  → View DataTable demo with advanced features
                </RouterLink>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle, AlertTriangle, Settings } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useDarkModeStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Input, Label, Textarea, Checkbox, Switch, Progress, Badge,
  Alert, AlertTitle, AlertDescription, Avatar, AvatarFallback,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TabsList, TabsTrigger, TabsContent, AccordionItem, Skeleton, Separator,
  VueSelect
} from '@/components/ui'

const darkModeStore = useDarkModeStore()
const { toast, success, error, warning } = useToast()

// Form states
const checkboxValue = ref(false)
const switchValue = ref(true)
const activeTab = ref('tab1')
const selectedCountry = ref('')
const selectedCountries = ref([])

// Sample data for VueSelect
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'br', label: 'Brazil' },
  { value: 'ar', label: 'Argentina' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'it', label: 'Italy' },
  { value: 'es', label: 'Spain' },
  { value: 'jp', label: 'Japan' },
  { value: 'kr', label: 'South Korea' },
  { value: 'cn', label: 'China' },
  { value: 'in', label: 'India' },
  { value: 'au', label: 'Australia' },
  { value: 'nz', label: 'New Zealand' }
]

// Helper function to get country label
const getCountryLabel = (value: string) => {
  const country = countries.find(c => c.value === value)
  return country ? country.label : value
}

// Toast functions
const showToast = (variant: 'default' | 'success' | 'warning' | 'error') => {
  switch (variant) {
    case 'success':
      success('Success! Operation completed successfully.')
      break
    case 'warning':
      warning('Warning! Please review your settings.')
      break
    case 'error':
      error('Error! Something went wrong.')
      break
    default:
      toast('This is a default toast message!')
  }
}
</script>
