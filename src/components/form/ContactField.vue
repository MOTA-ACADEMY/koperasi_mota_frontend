<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Button 
        type="button"
        variant="outline" 
        size="sm"
        @click="addContact"
        class="gap-2"
      >
        <Plus class="h-4 w-4" />
        Tambah Kontak
      </Button>
    </div>

    <div class="space-y-3">
      <div 
        v-for="(contact, index) in contacts" 
        :key="index"
        class="flex gap-3 items-start p-4 border border-border rounded-lg bg-card"
      >
        <!-- Contact Type Selector -->
        <div class="flex-1">
          <Label :for="`contact-type-${index}`" class="text-xs text-muted-foreground">
            Jenis Kontak
          </Label>
          <Select v-model="contact.jenis_kontak">
            <option value="email">Email</option>
            <option value="no_telp">No. Telepon</option>
            <option value="whatsapp">WhatsApp</option>
          </Select>
        </div>

        <!-- Contact Value Input -->
        <div class="flex-2">
          <Label :for="`contact-value-${index}`" class="text-xs text-muted-foreground">
            {{ getContactLabel(contact.jenis_kontak) }}
          </Label>
          <Input
            :id="`contact-value-${index}`"
            v-model="contact.kontak"
            :type="contact.jenis_kontak === 'email' ? 'email' : 'text'"
            :placeholder="getContactPlaceholder(contact.jenis_kontak)"
            class="mt-1"
          />
        </div>

        <!-- Remove Contact Button -->
        <Button
          v-if="contacts.length > 1"
          type="button"
          variant="outline"
          size="sm"
          @click="removeContact(index)"
          class="mt-6 text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'

export interface Contact {
  jenis_kontak: 'email' | 'no_telp' | 'whatsapp'
  kontak: string
}

interface Props {
  modelValue?: Contact[]
}

interface Emits {
  (e: 'update:modelValue', value: Contact[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [{ jenis_kontak: 'email', kontak: '' }]
})

const emit = defineEmits<Emits>()

const contacts = ref<Contact[]>([...props.modelValue])

// Watch for changes and emit to parent
watch(contacts, (newContacts) => {
  emit('update:modelValue', newContacts)
}, { deep: true })

const addContact = () => {
  contacts.value.push({
    jenis_kontak: 'email',
    kontak: ''
  })
}

const removeContact = (index: number) => {
  if (contacts.value.length > 1) {
    contacts.value.splice(index, 1)
  }
}

const getContactLabel = (type: string) => {
  const labels = {
    email: 'Alamat Email',
    no_telp: 'Nomor Telepon',
    whatsapp: 'Nomor WhatsApp'
  }
  return labels[type as keyof typeof labels] || 'Kontak'
}

const getContactPlaceholder = (type: string) => {
  const placeholders = {
    email: 'contoh@email.com',
    no_telp: '081234567890',
    whatsapp: '081234567890'
  }
  return placeholders[type as keyof typeof placeholders] || ''
}
</script>