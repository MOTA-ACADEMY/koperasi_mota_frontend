<template>
  <div class="vue-select-wrapper" :data-clearable="clearable">
    <Multiselect
      v-model="internalValue"
      :options="options"
      :mode="mode"
      :placeholder="placeholder"
      :searchable="searchable"
      :create-option="createOption"
      :close-on-select="closeOnSelect"
      :clear-on-select="clearOnSelect"
      :preserve-search="preserveSearch"
      :preselect-first="preselectFirst"
      :max="max"
      :disabled="disabled"
      :loading="loading"
      :id="id"
      :name="name"
      :required="required"
      :label="label"
      :track-by="trackBy"
      :value-prop="valueProp"
      :filter-results="filterResults"
      :min-chars="minChars"
      :resolve-on-load="resolveOnLoad"
      :delay="delay"
      :no-options-text="noOptionsText"
      :no-results-text="noResultsText"
      :multiple-label="multipleLabel"
      :object="object"
      :limit="limit"
      :groups="groups"
      :group-label="groupLabel"
      :group-options="groupOptions"
      :group-hide-empty="groupHideEmpty"
      :group-select="groupSelect"
      :autocomplete="autocomplete"
      :classes="computedClasses"
      :appendTo="'body'"
      @change="handleChange"
      @select="handleSelect"
      @deselect="handleDeselect"
      @search-change="handleSearchChange"
      @tag="handleTag"
      @open="handleOpen"
      @close="handleClose"
      @clear="handleClear"
      @paste="handlePaste"
    >
      <!-- Custom slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </Multiselect>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Multiselect from '@vueform/multiselect'

// Props interface
interface Props {
  modelValue?: any
  options?: any[] | object | Function
  mode?: 'single' | 'multiple' | 'tags'
  placeholder?: string
  searchable?: boolean
  createOption?: boolean
  closeOnSelect?: boolean
  clearOnSelect?: boolean
  preserveSearch?: boolean
  preselectFirst?: boolean
  max?: number
  disabled?: boolean
  loading?: boolean
  id?: string
  name?: string
  required?: boolean
  label?: string
  trackBy?: string
  valueProp?: string
  filterResults?: boolean
  minChars?: number
  resolveOnLoad?: boolean
  delay?: number
  noOptionsText?: string
  noResultsText?: string
  multipleLabel?: Function
  object?: boolean
  limit?: number
  groups?: boolean
  groupLabel?: string
  groupOptions?: string
  groupHideEmpty?: boolean
  groupSelect?: boolean
  autocomplete?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  appendTo?: string | Element
  clearable?: boolean
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  mode: 'single',
  placeholder: 'Select option',
  searchable: true,
  closeOnSelect: true,
  clearOnSelect: true,
  preserveSearch: false,
  preselectFirst: false,
  disabled: false,
  loading: false,
  filterResults: true,
  minChars: 0,
  resolveOnLoad: true,
  delay: -1,
  noOptionsText: 'The list is empty',
  noResultsText: 'No results found',
  object: false,
  groupHideEmpty: true,
  groupSelect: true,
  variant: 'default',
  size: 'default',
  appendTo: 'body',
  clearable: true
})

// Define emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any, option: any]
  select: [option: any, value: any]
  deselect: [option: any, value: any]
  'search-change': [query: string]
  tag: [query: string]
  open: []
  close: []
  clear: []
  paste: [event: Event]
}>()

// Internal value management
const internalValue = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// Watch for internal changes
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Computed classes for Shadcn/ui integration
const computedClasses = computed(() => ({
  container: [
    'multiselect',
    'relative',
    'w-full',
    'flex',
    'items-center',
    'justify-end',
    'box-border',
    'cursor-pointer',
    'outline-none',
    'border',
    'rounded-md',
    'transition-colors',
    'focus-within:ring-2',
    'focus-within:ring-ring',
    'focus-within:ring-offset-2',
    'focus-within:border-transparent',
    // Use CSS custom properties for theming
    'border-[hsl(var(--border))]',
    'bg-[hsl(var(--background))]',
    'text-[hsl(var(--foreground))]',
    props.disabled && 'opacity-50 cursor-not-allowed',
    {
      'h-8 text-xs px-2': props.size === 'sm',
      'h-10 text-sm px-3': props.size === 'default',
      'h-12 text-base px-4': props.size === 'lg'
    }
  ].filter(Boolean),
  containerDisabled: 'cursor-not-allowed opacity-50',
  containerOpen: 'border-[hsl(var(--ring))]',
  containerOpenTop: 'rounded-b-none',
  containerActive: 'border-[hsl(var(--ring))]',
  wrapper: 'relative mx-auto w-full flex items-center justify-end box-border',
  singleLabel: 'flex items-center h-full max-w-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3 pr-16 box-border',
  singleLabelText: 'overflow-ellipsis overflow-hidden block whitespace-nowrap max-w-full text-[hsl(var(--foreground))]',
  multipleLabel: 'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3 pr-16 box-border max-w-full',
  search: 'w-full absolute inset-0 outline-none focus:ring-0 appearance-none box-border border-0 text-sm font-sans bg-transparent rounded-md pl-3 pr-10 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
  tags: 'flex-grow flex-shrink flex flex-wrap items-center mt-1 pl-2',
  tag: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium mr-1 mb-1 py-0.5 pl-2 rounded whitespace-nowrap',
  tagDisabled: 'pr-2 opacity-50',
  tagRemove: 'flex items-center justify-center p-1 mx-0.5 rounded-sm hover:bg-black hover:bg-opacity-10 group',
  tagRemoveIcon: 'bg-multiselect-remove bg-center bg-no-repeat opacity-30 inline-block w-3 h-3 group-hover:opacity-60',
  tagsSearchWrapper: 'inline-block relative mx-1 mb-1 flex-grow flex-shrink h-full',
  tagsSearch: 'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 text-sm font-sans box-border w-full bg-transparent text-[hsl(var(--foreground))]',
  tagsSearchCopy: 'invisible whitespace-pre-wrap inline-block h-px',
  placeholder: 'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3 text-[hsl(var(--muted-foreground))]',
  caret: 'bg-multiselect-caret bg-center bg-no-repeat w-2.5 h-4 py-px box-content mr-3.5 relative z-10 opacity-40 flex-shrink-0 flex-grow-0 transition-transform transform pointer-events-none',
  caretOpen: 'rotate-180 pointer-events-auto',
  clear: [
    'pr-3.5 relative z-10 opacity-40 transition duration-300 flex-shrink-0 flex-grow-0 flex hover:opacity-80',
    !props.clearable && 'hidden'
  ].filter(Boolean).join(' '),
  clearIcon: 'bg-multiselect-remove bg-center bg-no-repeat w-2.5 h-4 py-px box-content inline-block',
  spinner: 'bg-multiselect-spinner bg-center bg-no-repeat w-4 h-4 z-10 mr-3.5 animate-spin flex-shrink-0 flex-grow-0',
  infinite: 'flex items-center justify-center w-full',
  infiniteSpinner: 'bg-multiselect-spinner bg-center bg-no-repeat w-4 h-4 z-10 animate-spin flex-shrink-0 flex-grow-0 m-3.5',
  dropdown: 'max-h-60 absolute left-0 right-0 top-full transform translate-y-1 border rounded-md py-2 z-[999999] overflow-y-auto shadow-xl border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
  dropdownTop: '-translate-y-full top-auto bottom-px',
  dropdownHidden: 'hidden',
  options: 'flex flex-col p-0 m-0 list-none',
  optionsTop: 'flex-col-reverse',
  group: 'p-0 m-0',
  groupLabel: 'flex text-sm box-border items-center justify-start text-left py-1 px-3 font-semibold bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-default leading-normal',
  groupLabelPointable: 'cursor-pointer',
  groupLabelPointed: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] opacity-90',
  groupLabelSelected: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
  groupLabelDisabled: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed',
  groupLabelSelectedPointed: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] opacity-90',
  groupLabelSelectedDisabled: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed',
  groupOptions: 'p-0 m-0',
  option: 'flex items-center justify-start box-border text-left cursor-pointer text-sm leading-snug py-2 px-3 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  optionPointed: 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]',
  optionSelected: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
  optionDisabled: 'text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed',
  optionSelectedPointed: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] opacity-90',
  optionSelectedDisabled: 'text-[hsl(var(--muted-foreground))] opacity-50 cursor-not-allowed',
  noOptions: 'py-2 px-3 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--background))] text-sm',
  noResults: 'py-2 px-3 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--background))] text-sm',
  fakeInput: 'bg-transparent absolute left-0 right-0 -bottom-px w-full h-px border-0 p-0 appearance-none outline-none text-transparent',
  assist: 'absolute -m-px w-px h-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]',
  spacer: 'hidden'
}))

// Event handlers
const handleChange = (value: any, option: any) => {
  emit('change', value, option)
}

const handleSelect = (option: any, value: any) => {
  emit('select', option, value)
}

const handleDeselect = (option: any, value: any) => {
  emit('deselect', option, value)
}

const handleSearchChange = (query: string) => {
  emit('search-change', query)
}

const handleTag = (query: string) => {
  emit('tag', query)
}

const handleOpen = () => {
  emit('open')
}

const handleClose = () => {
  emit('close')
}

const handleClear = () => {
  emit('clear')
}

const handlePaste = (event: Event) => {
  emit('paste', event)
}
</script>

<style>
@import '@vueform/multiselect/themes/default.css';

/* Override all multiselect styles to ensure proper theming */
.vue-select-wrapper {
  width: 100%;
  position: relative;
  z-index: 10;
}

/* Container styles */
.multiselect {
  border-color: hsl(var(--border)) !important;
  background-color: hsl(var(--background)) !important;
  color: hsl(var(--foreground)) !important;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
  position: relative !important;
  z-index: 10 !important;
}

/* Dropdown styles */
.multiselect-dropdown {
  background-color: hsl(var(--background)) !important;
  border-color: hsl(var(--border)) !important;
  color: hsl(var(--foreground)) !important;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04) !important;
  padding: 8px 0 !important;
  margin-top: 4px !important;
  z-index: 999999 !important;
  position: fixed !important;
  border-radius: 8px !important;
  max-height: 240px !important;
  overflow-y: auto !important;
  width: auto !important;
  min-width: 200px !important;
}

/* Option styles */
.multiselect-option {
  background-color: transparent !important;
  color: hsl(var(--foreground)) !important;
  padding: 10px 16px !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  transition: all 150ms ease !important;
  border: none !important;
  margin: 0 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.multiselect-option:hover,
.multiselect-option.is-pointed {
  background-color: hsl(var(--accent)) !important;
  color: hsl(var(--accent-foreground)) !important;
}

.multiselect-option.is-selected {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  font-weight: 500 !important;
}

.multiselect-option.is-selected:hover,
.multiselect-option.is-selected.is-pointed {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  opacity: 0.9 !important;
}

/* Search input styles */
.multiselect-search {
  background-color: transparent !important;
  color: hsl(var(--foreground)) !important;
  border: none !important;
  font-size: 14px !important;
}

.multiselect-search::placeholder {
  color: hsl(var(--muted-foreground)) !important;
}

/* Placeholder styles */
.multiselect-placeholder {
  color: hsl(var(--muted-foreground)) !important;
}

/* Single label styles */
.multiselect-single-label {
  color: hsl(var(--foreground)) !important;
  background-color: transparent !important;
}

/* Tag styles for multiple mode */
.multiselect-tag {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  border-radius: 6px !important;
  padding: 2px 8px !important;
  margin-right: 4px !important;
  margin-bottom: 2px !important;
  font-size: 12px !important;
}

.multiselect-tag-remove {
  color: hsl(var(--primary-foreground)) !important;
  opacity: 0.7 !important;
}

.multiselect-tag-remove:hover {
  opacity: 1 !important;
}

/* No options/results styles */
.multiselect-no-options,
.multiselect-no-results {
  background-color: hsl(var(--background)) !important;
  color: hsl(var(--muted-foreground)) !important;
  padding: 8px 12px !important;
  font-size: 14px !important;
}

/* Remove spacer */
.multiselect-spacer {
  display: none !important;
}

/* Custom icons */
.multiselect-caret {
  background-image: none !important;
}

.multiselect-caret::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border: 2px solid hsl(var(--muted-foreground));
  border-top: 0;
  border-right: 0;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.multiselect-caret.is-open::after {
  transform: rotate(-135deg);
}

.multiselect-clear {
  background-image: none !important;
}

.multiselect-clear::after {
  content: '×';
  color: hsl(var(--muted-foreground));
  font-size: 1.125rem;
  font-weight: bold;
  line-height: 1;
}

/* Hide clear button when not clearable */
.vue-select-wrapper[data-clearable="false"] .multiselect-clear {
  display: none !important;
}

.vue-select-wrapper[data-clearable="false"] .clear {
  display: none !important;
}

.multiselect-spinner {
  background-image: none !important;
}

.multiselect-spinner::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border: 2px solid hsl(var(--muted-foreground));
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus styles */
.multiselect:focus-within {
  border-color: hsl(var(--ring)) !important;
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2) !important;
}

/* Ensure dropdown appears above other content */
.multiselect.is-open {
  z-index: 999998 !important;
}

.multiselect-dropdown {
  z-index: 999999 !important;
  min-width: 100% !important;
  width: auto !important;
}

/* Force dropdown to appear above everything */
.multiselect-dropdown {
  position: fixed !important;
  z-index: 999999 !important;
}

/* Make sure options are clickable and visible */
.multiselect-options {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Improve scrollbar styling */
.multiselect-dropdown::-webkit-scrollbar {
  width: 6px;
}

.multiselect-dropdown::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 3px;
}

.multiselect-dropdown::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 3px;
}

.multiselect-dropdown::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--foreground));
}
</style>
