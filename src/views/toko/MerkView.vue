<template>
  <MasterSederhana
    judul="Merk"
    nama-item="merk"
    deskripsi="Daftar merk barang untuk mengelompokkan dan mencari barang, mis. Aqua, Indomie, Sunlight."
    jenis="merk"
    menu="toko.merk"
    :fields="FIELDS"
  />
</template>

<script setup lang="ts">
import MasterSederhana, { type FieldMaster } from '@/components/toko/MasterSederhana.vue'

const FIELDS: FieldMaster[] = [
  { key: 'nama', label: 'Nama merk', type: 'text', wajib: true, placeholder: 'mis. Aqua' },
  { key: 'keterangan', label: 'Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)' }
]
</script>
