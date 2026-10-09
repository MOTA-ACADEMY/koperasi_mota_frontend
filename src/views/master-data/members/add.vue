<template>
  <div class="min-h-full w-full p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Button 
          variant="danger"
          size="sm" 
          @click="$router.push('/members')"
          class="gap-2 bg-white text-green-600"
        >
          <ArrowLeft class="h-4 w-4" />
          Kembali
        </Button>
        <div class="h-6 w-px bg-border"></div>
        <h1 class="text-2xl font-bold text-foreground">Tambah Anggota</h1>
      </div>
      <p class="text-muted-foreground">
        Tambahkan anggota baru ke dalam sistem koperasi
      </p>
    </div>

    <!-- Add Member Form -->
    <div class="mt-4">
      <AddMemberForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import AddMemberForm from '@/components/form/AddMemberForm.vue'
</script>