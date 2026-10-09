<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 px-4">
    <Card class="w-full max-w-sm p-8">
      <div class="text-center mb-6">
        <Avatar class="h-12 w-12 mx-auto mb-3">
          <AvatarFallback class="bg-green-600 text-white font-bold">KM</AvatarFallback>
        </Avatar>
        <h1 class="text-xl font-bold text-foreground">Koperasi MOTA</h1>
        <p class="text-sm text-muted-foreground mt-1">Masuk ke dashboard koperasi</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@koperasimota.com"
            required
            autocomplete="username"
          />
        </div>

        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="userStore.error" class="text-sm text-destructive">
          {{ userStore.error }}
        </p>

        <Button
          type="submit"
          variant="primary"
          class="w-full gap-2"
          :disabled="userStore.loading"
        >
          <Loader2 v-if="userStore.loading" class="h-4 w-4 animate-spin" />
          {{ userStore.loading ? 'Memproses...' : 'Masuk' }}
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          Koperasi Anda belum terdaftar?
          <RouterLink to="/daftar" class="text-green-600 hover:underline">Daftarkan koperasi</RouterLink>
        </p>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AvatarFallback from '@/components/ui/AvatarFallback.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { success } = useToast()

const form = reactive({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  userStore.clearError()

  try {
    const session = await userStore.login({ email: form.email, password: form.password })
    success('Berhasil masuk', { description: `Selamat datang, ${userStore.user.name}` })

    const redirect = (route.query.redirect as string) || '/dashboard'
    // Terdaftar di lebih dari satu koperasi → pilih dulu koperasi yang akan dikelola.
    if (!session.koperasi) {
      router.push({ path: '/pilih-koperasi', query: { redirect } })
      return
    }
    router.push(redirect)
  } catch {
    // Error message is already set on userStore.error and shown in the form.
  }
}
</script>
