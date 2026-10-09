<template>
  <div class="relative w-full">
    <div class="relative flex">
      <Input
        :value="formattedDate"
        :placeholder="placeholder"
        readonly
        class="cursor-pointer pl-10"
        @click="togglePicker"
      />
      <CalendarIcon 
        v-if="['',null,undefined].includes(formattedDate)"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
      />
      <Button
        v-else
        variant="ghost"
        size="icon"
        @click="clear"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
      >
        <X class="h-4 w-4"/>
      </Button>
    </div>
    
    <!-- Date Picker Dropdown -->
    <div
      v-if="showPicker"
      class="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-md shadow-lg p-3 min-w-[280px]"
    >
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          @click="previousMonth"
          class="h-8 w-8 p-0"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        
        <div class="text-sm font-medium">
          {{ currentMonthYear }}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          @click="nextMonth"
          class="h-8 w-8 p-0"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
      
      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 gap-1 text-center mb-2">
        <div
          v-for="day in weekdays"
          :key="day"
          class="text-xs font-medium text-muted-foreground p-2"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1 mb-3">
        <Button
          v-for="day in calendarDays"
          :key="day.dateStr"
          variant="ghost"
          size="sm"
          :class="getDayClasses(day)"
          @click="selectDate(day.date)"
          :disabled="!day.isCurrentMonth"
        >
          {{ day.day }}
        </Button>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex justify-between pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          @click="selectToday"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="clear"
        >
          Clear
        </Button>
      </div>
    </div>
    
    <!-- Backdrop to close picker -->
    <div
      v-if="showPicker"
      class="fixed inset-0 z-40"
      @click="closePicker"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-vue-next'
import Button from './Button.vue'
import Input from './Input.vue'

interface Props {
  modelValue?: Date | null
  placeholder?: string
  disabled?: boolean
  format?: string
}

interface Emits {
  (e: 'update:modelValue', value: Date | null): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date',
  disabled: false,
  format: 'MMM dd, yyyy'
})

const emit = defineEmits<Emits>()

const showPicker = ref(false)
const currentMonth = ref(new Date())

const selectedDate = computed({
  get: () => props.modelValue,
  set: (value: Date | null) => emit('update:modelValue', value)
})

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  
  const date = selectedDate.value
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des']
  const fullMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  // Parse the format prop and replace tokens
  let formatted = props.format
  
  // Year tokens
  formatted = formatted.replace(/yyyy/g, date.getFullYear().toString())
  formatted = formatted.replace(/yy/g, date.getFullYear().toString().slice(-2))
  
  // Month tokens
  formatted = formatted.replace(/MMMM/g, fullMonths[date.getMonth()])
  formatted = formatted.replace(/MMM/g, months[date.getMonth()])
  formatted = formatted.replace(/MM/g, (date.getMonth() + 1).toString().padStart(2, '0'))
  formatted = formatted.replace(/M/g, (date.getMonth() + 1).toString())
  
  // Day tokens
  formatted = formatted.replace(/dd/g, date.getDate().toString().padStart(2, '0'))
  formatted = formatted.replace(/d/g, date.getDate().toString())
  
  return formatted
})

const currentMonthYear = computed(() => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[currentMonth.value.getMonth()]} ${currentMonth.value.getFullYear()}`
})

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isSelected = selectedDate.value ? 
      date.getTime() === new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), selectedDate.value.getDate()).getTime() : 
      false
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear()
    
    days.push({
      date,
      day: date.getDate(),
      dateStr: date.toISOString(),
      isCurrentMonth,
      isSelected,
      isToday
    })
  }
  
  return days
})

const togglePicker = () => {
  if (props.disabled) return
  showPicker.value = !showPicker.value
}

const closePicker = () => {
  showPicker.value = false
}

const selectDate = (date: Date) => {
  selectedDate.value = new Date(date)
  closePicker()
}

const selectToday = () => {
  selectDate(new Date())
}

const clear = () => {
  selectedDate.value = null
  closePicker()
}

const previousMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() - 1)
  currentMonth.value = newMonth
}

const nextMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  currentMonth.value = newMonth
}

const getDayClasses = (day: any) => {
  const classes = ['h-8 w-8 p-0 font-normal']
  
  if (!day.isCurrentMonth) classes.push('text-muted-foreground')
  if (day.isSelected) classes.push('bg-primary text-primary-foreground hover:bg-primary')
  if (day.isToday && !day.isSelected) classes.push('bg-accent')
  if (!day.isSelected && day.isCurrentMonth) classes.push('hover:bg-accent')
  
  return classes.join(' ')
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
