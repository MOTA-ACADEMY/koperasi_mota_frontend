<template>
  <div class="min-h-full p-6 space-y-6">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground">
          DatePicker Demo
        </h1>
        <p class="text-muted-foreground mt-2">
          Test the custom DatePicker component
        </p>
      </div>

      <div class="space-y-8">
        <!-- Basic DatePicker -->
        <Card>
          <CardContent class="p-6">
            <h3 class="text-lg font-semibold mb-4">Basic DatePicker</h3>
            <div class="space-y-4">
              <div>
                <Label>Select a date:</Label>
                <DatePicker 
                  v-model="selectedDate" 
                  placeholder="Choose a date..."
                  class="mt-1"
                  format="dd MMMM yyyy"
                />
              </div>
              <div v-if="selectedDate" class="text-sm text-muted-foreground">
                Selected: {{ formatDate(selectedDate) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Date Range Example -->
        <Card>
          <CardContent class="p-6">
            <h3 class="text-lg font-semibold mb-4">Date Range</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date:</Label>
                <DatePicker 
                  v-model="startDate" 
                  placeholder="Start date..."
                  class="mt-1"
                />
              </div>
              <div>
                <Label>End Date:</Label>
                <DatePicker 
                  v-model="endDate" 
                  placeholder="End date..."
                  class="mt-1"
                />
              </div>
            </div>
            <div v-if="startDate && endDate" class="mt-4 text-sm text-muted-foreground">
              Range: {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
              <br>
              Duration: {{ calculateDays(startDate, endDate) }} days
            </div>
          </CardContent>
        </Card>

        <!-- Usage Examples -->
        <Card>
          <CardContent class="p-6">
            <h3 class="text-lg font-semibold mb-4">Usage Examples</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Birth Date:</Label>
                  <DatePicker 
                    v-model="birthDate" 
                    placeholder="Your birth date"
                    class="mt-1"
                  />
                </div>
                <div>
                  <Label>Event Date:</Label>
                  <DatePicker 
                    v-model="eventDate" 
                    placeholder="Event date"
                    class="mt-1"
                  />
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 mt-4">
                <Button @click="setToday" variant="outline" size="sm">
                  Set Today
                </Button>
                <Button @click="setTomorrow" variant="outline" size="sm">
                  Set Tomorrow
                </Button>
                <Button @click="clearAll" variant="outline" size="sm">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import DatePicker from '@/components/ui/DatePicker.vue'

const selectedDate = ref<Date | null>(null)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const birthDate = ref<Date | null>(null)
const eventDate = ref<Date | null>(null)

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

const calculateDays = (start: Date, end: Date) => {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const setToday = () => {
  const today = new Date()
  selectedDate.value = today
}

const setTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  selectedDate.value = tomorrow
}

const clearAll = () => {
  selectedDate.value = null
  startDate.value = null
  endDate.value = null
  birthDate.value = null
  eventDate.value = null
}
</script>
