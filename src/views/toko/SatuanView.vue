<template>
  <MasterSederhana
    judul="Satuan"
    nama-item="satuan"
    deskripsi="Satuan jual & beli barang, mis. Pcs, Botol, Dus, Kg. Satu barang bisa memakai beberapa satuan dengan harga dan stok masing-masing."
    jenis="satuan"
    menu="toko.satuan"
    :fields="FIELDS"
  />
</template>

<script setup lang="ts">
import MasterSederhana, { type FieldMaster } from '@/components/toko/MasterSederhana.vue'

const FIELDS: FieldMaster[] = [
  { key: 'nama', label: 'Nama satuan', type: 'text', wajib: true, placeholder: 'mis. Botol' },
  { key: 'singkatan', label: 'Singkatan', type: 'text', placeholder: 'mis. btl' }
]
</script>
