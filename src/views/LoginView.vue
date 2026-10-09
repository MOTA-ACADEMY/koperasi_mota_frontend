<template>
  <AuthLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Selamat datang kembali</h1>
      <p class="mt-2 text-sm text-muted-foreground">Masuk untuk mengelola koperasi Anda.</p>
    </div>

    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <!-- Pesan error -->
      <div
        v-if="userStore.error"
        role="alert"
        class="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      >
        <CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ userStore.error }}</span>
      </div>

      <div class="space-y-1.5">
        <label for="email" class="text-sm font-medium text-foreground">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            v-model="form.email"
            type="email"
            inputmode="email"
            autocomplete="username"
            autofocus
            required
            placeholder="nama@koperasi.id"
            class="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-shadow focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15 dark:focus:ring-green-500/20"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label for="password" class="text-sm font-medium text-foreground">Password</label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            v-model="form.password"
            :type="tampilkanPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            placeholder="Masukkan password"
            class="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 transition-shadow focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15 dark:focus:ring-green-500/20"
            @keyup="capsLock = $event.getModifierState?.('CapsLock') ?? false"
            @blur="capsLock = false"
          />
          <button
            type="button"
            class="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40"
            :aria-label="tampilkanPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            :aria-pressed="tampilkanPassword"
            @click="tampilkanPassword = !tampilkanPassword"
          >
            <EyeOff v-if="tampilkanPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
        <p v-if="capsLock" class="text-xs text-amber-600 dark:text-amber-400">Caps Lock sedang aktif.</p>
      </div>

      <button
        type="submit"
        :disabled="userStore.loading || !form.email || !form.password"
        class="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 text-sm font-semibold text-white shadow-sm shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-md hover:shadow-green-600/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-600/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:bg-green-600"
      >
        <Loader2 v-if="userStore.loading" class="h-4 w-4 animate-spin" />
        <template v-else>
          Masuk
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </template>
      </button>
    </form>

    <div class="my-7 flex items-center gap-3 text-xs text-muted-foreground">
      <span class="h-px flex-1 bg-border" />
      Belum punya akun koperasi?
      <span class="h-px flex-1 bg-border" />
    </div>

    <RouterLink
      to="/daftar"
      class="flex h-11 w-full items-center justify-center rounded-lg border border-input text-sm font-medium text-foreground transition-colors hover:border-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40 dark:hover:text-green-400"
    >
      Daftarkan koperasi
    </RouterLink>

    <!-- Bantuan pengembangan: hanya tampil saat `npm run dev`, tidak ikut ke build produksi -->
    <div
      v-if="isDev"
      class="mt-8 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground"
    >
      <p class="mb-2 font-medium">Akun demo (klik untuk mengisi)</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="akun in akunDemo"
          :key="akun.email"
          type="button"
          class="rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-left transition-colors hover:border-green-600 hover:text-foreground"
          @click="isiAkun(akun)"
        >
          <span class="block font-medium text-foreground">{{ akun.label }}</span>
          <span class="block">{{ akun.email }}</span>
        </button>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ArrowRight, CircleAlert, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { success } = useToast()

const form = reactive({
  email: '',
  password: ''
})

const tampilkanPassword = ref(false)
const capsLock = ref(false)

// Data demo dikondisikan langsung pada import.meta.env.DEV (konstanta saat build), supaya
// bundler membuangnya dari build produksi — kredensial tidak boleh ikut terkirim ke browser.
const isDev = import.meta.env.DEV
const akunDemo = import.meta.env.DEV
  ? [
      { label: 'Admin (2 koperasi)', email: 'admin@demo.koperasi.test', password: 'demo12345' },
      { label: 'Staf (1 koperasi)', email: 'staf@demo.koperasi.test', password: 'demo12345' }
    ]
  : []

const isiAkun = (akun: { email: string; password: string }) => {
  userStore.clearError()
  form.email = akun.email
  form.password = akun.password
}

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
    // Pesan error sudah diisi di userStore.error dan tampil di atas form.
  }
}
</script>
