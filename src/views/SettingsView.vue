<template>
  <div :class="[
    'min-h-full transition-all duration-300',
    darkModeStore.themeClasses.main
  ]">
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 :class="[
            'text-3xl font-bold transition-colors duration-300',
            darkModeStore.themeClasses.text.primary
          ]">
            Navigation Settings
          </h1>
          <p :class="[
            'text-lg mt-1 transition-colors duration-300',
            darkModeStore.themeClasses.text.muted
          ]">
            Manage sidebar navigation menu items
          </p>
        </div>
      </div>

      <!-- Navigation Management -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Current Navigation Items -->
        <Card :class="`p-6 ${darkModeStore.themeClasses.card}`">
          <h3 :class="[
            'text-lg font-semibold mb-4 transition-colors duration-300',
            darkModeStore.themeClasses.text.primary
          ]">
            Current Navigation Items ({{ navigationStore.navigationItems.length }})
          </h3>
          
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div 
              v-for="item in navigationStore.navigationItems" 
              :key="item.id"
              :class="[
                'flex items-center justify-between p-3 rounded-lg border transition-all duration-300',
                darkModeStore.themeClasses.card,
                item.type === 'header' ? 'bg-gray-50 dark:bg-gray-800' : ''
              ]"
            >
              <div class="flex items-center space-x-3">
                <component 
                  v-if="item.icon" 
                  :is="item.icon" 
                  class="h-4 w-4" 
                />
                <div>
                  <span :class="[
                    'font-medium',
                    darkModeStore.themeClasses.text.primary
                  ]">
                    {{ item.name }}
                  </span>
                  <span v-if="item.type === 'header'" class="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    Header
                  </span>
                  <div v-if="item.path" :class="[
                    'text-sm',
                    darkModeStore.themeClasses.text.muted
                  ]">
                    {{ item.path }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <Badge v-if="item.badge" variant="secondary" class="text-xs">
                  {{ item.badge }}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  @click="updateBadge(item.id)"
                  class="text-xs"
                >
                  Badge
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="removeItem(item.id)"
                  class="text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <!-- Actions -->
        <Card :class="`p-6 ${darkModeStore.themeClasses.card}`">
          <h3 :class="[
            'text-lg font-semibold mb-4 transition-colors duration-300',
            darkModeStore.themeClasses.text.primary
          ]">
            Quick Actions
          </h3>
          
          <div class="space-y-4">
            <Button
              @click="addSampleItem"
              class="w-full"
              variant="default"
            >
              <Plus class="h-4 w-4 mr-2" />
              Add Sample Menu Item
            </Button>
            
            <Button
              @click="addSampleHeader"
              class="w-full"
              variant="outline"
            >
              <Hash class="h-4 w-4 mr-2" />
              Add Sample Header
            </Button>
            
            <Button
              @click="updateRandomBadge"
              class="w-full"
              variant="secondary"
            >
              <Badge class="h-4 w-4 mr-2" />
              Update Random Badge
            </Button>
            
            <Button
              @click="resetToDefault"
              class="w-full"
              variant="destructive"
            >
              <RotateCcw class="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          <!-- Demo Info -->
          <div :class="[
            'mt-6 p-4 rounded-lg border-l-4 border-blue-500',
            darkModeStore.themeClasses.card
          ]">
            <h4 :class="[
              'font-semibold text-blue-600 dark:text-blue-400',
              'mb-2'
            ]">
              Demo Information
            </h4>
            <p :class="[
              'text-sm',
              darkModeStore.themeClasses.text.muted
            ]">
              This page demonstrates how the navigation menu is managed through Pinia store. 
              Changes here will immediately reflect in the sidebar. The navigation data persists 
              during the session but resets on page reload.
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, 
  Hash, 
  RotateCcw,
  Star,
  Zap,
  Heart,
  Gift,
  Coffee
} from 'lucide-vue-next'
import { useDarkModeStore, useNavigationStore, type NavigationItem } from '@/stores'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

const darkModeStore = useDarkModeStore()
const navigationStore = useNavigationStore()

const sampleIcons = [Star, Zap, Heart, Gift, Coffee]
const sampleNames = ['Favorites', 'Quick Actions', 'Bookmarks', 'Rewards', 'Break Room']

let itemCounter = 1

const addSampleItem = () => {
  const randomIndex = Math.floor(Math.random() * sampleNames.length)
  const newItem: NavigationItem = {
    id: `sample-${Date.now()}-${itemCounter}`,
    name: `${sampleNames[randomIndex]} ${itemCounter}`,
    path: `/sample-${itemCounter}`,
    icon: sampleIcons[randomIndex],
    badge: Math.random() > 0.5 ? String(Math.floor(Math.random() * 100)) : undefined
  }
  
  navigationStore.addNavigationItem(newItem)
  itemCounter++
}

const addSampleHeader = () => {
  const newHeader: NavigationItem = {
    id: `header-${Date.now()}`,
    name: `Sample Section ${itemCounter}`,
    type: 'header'
  }
  
  navigationStore.addNavigationItem(newHeader)
  itemCounter++
}

const removeItem = (id: string) => {
  navigationStore.removeNavigationItem(id)
}

const updateBadge = (id: string) => {
  const currentItem = navigationStore.getItemById(id)
  if (currentItem && currentItem.type !== 'header') {
    const newBadge = currentItem.badge 
      ? undefined 
      : String(Math.floor(Math.random() * 999))
    navigationStore.updateBadge(id, newBadge)
  }
}

const updateRandomBadge = () => {
  const linkItems = navigationStore.getLinkItems
  if (linkItems.length > 0) {
    const randomItem = linkItems[Math.floor(Math.random() * linkItems.length)]
    const newBadge = String(Math.floor(Math.random() * 999))
    navigationStore.updateBadge(randomItem.id, newBadge)
  }
}

const resetToDefault = () => {
  // This would reset to the original navigation items
  // For demo purposes, we'll just show an alert
  alert('Reset functionality would restore the original navigation menu. This is just a demo!')
}
</script>
