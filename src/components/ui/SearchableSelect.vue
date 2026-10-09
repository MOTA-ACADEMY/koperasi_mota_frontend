<template>
  <div class="relative" ref="selectContainer">
    <!-- Search Input / Display -->
    <div 
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200',
        isOpen && 'ring-2 ring-ring ring-offset-2',
        $attrs.class as string
      )"
      @click="toggleDropdown"
      tabindex="0"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.escape="closeDropdown"
      @keydown.arrow-down.prevent="openDropdown"
    >
      <input
        v-if="searchable && isOpen"
        ref="searchInput"
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        :class="cn(
          'flex-1 bg-transparent outline-none',
          'text-foreground placeholder:text-muted-foreground'
        )"
        @click.stop
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape.prevent="closeDropdown"
        @keydown.arrow-down.prevent="highlightNext"
        @keydown.arrow-up.prevent="highlightPrevious"
      />
      <span
        v-else
        :class="cn(
          'flex-1 truncate',
          !selectedOption && 'text-muted-foreground'
        )"
      >
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDown 
        :class="cn(
          'h-4 w-4 opacity-50 transition-transform duration-200 shrink-0 ml-2',
          isOpen && 'rotate-180'
        )" 
      />
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen && dropdownStyle"
        :style="dropdownStyle"
        :class="cn(
          'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
        )"
      >
        <div 
          v-if="filteredOptions.length === 0"
          :class="cn(
            'px-2 py-1.5 text-sm text-muted-foreground text-center'
          )"
        >
          {{ searchable && searchQuery ? 'No results found' : 'No options available' }}
        </div>
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          :class="cn(
            'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            option.disabled && 'pointer-events-none opacity-50',
            index === highlightedIndex && 'bg-accent text-accent-foreground',
            selectedOption?.value === option.value && 'bg-primary text-primary-foreground'
          )"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="truncate">{{ option.label }}</span>
          <Check 
            v-if="selectedOption?.value === option.value"
            class="ml-auto h-4 w-4" 
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface SearchableSelectProps {
  options: SelectOption[]
  modelValue?: string | number
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<SearchableSelectProps>(), {
  placeholder: 'Select an option...',
  searchable: true,
  searchPlaceholder: 'Search options...',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  'change': [option: SelectOption | undefined]
}>()

// Refs
const selectContainer = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>()

// Computed
const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options.filter(option => !option.disabled)
  }
  
  return props.options.filter(option => 
    !option.disabled && 
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const calculateDropdownPosition = () => {
  if (!selectContainer.value) return

  const rect = selectContainer.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = Math.min(filteredOptions.value.length * 36 + 8, 200) // Approximate height

  // Determine if dropdown should open upward or downward
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top
  const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

  dropdownStyle.value = {
    width: `${rect.width}px`,
    left: `${rect.left}px`,
    ...(openUpward 
      ? { bottom: `${viewportHeight - rect.top}px`, maxHeight: `${Math.min(spaceAbove - 8, 200)}px` }
      : { top: `${rect.bottom}px`, maxHeight: `${Math.min(spaceBelow - 8, 200)}px` }
    ),
    overflowY: 'auto'
  }
}

const openDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = true
  searchQuery.value = ''
  highlightedIndex.value = -1
  
  nextTick(() => {
    calculateDropdownPosition()
    if (props.searchable && searchInput.value) {
      searchInput.value.focus()
    }
  })
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
  dropdownStyle.value = undefined
}

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

const highlightNext = () => {
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
}

const highlightPrevious = () => {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

const handleResize = () => {
  if (isOpen.value) {
    calculateDropdownPosition()
  }
}

// Watchers
watch(() => filteredOptions.value, () => {
  highlightedIndex.value = -1
  if (isOpen.value) {
    nextTick(() => calculateDropdownPosition())
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
})
</script>
