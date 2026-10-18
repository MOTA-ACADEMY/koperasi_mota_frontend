<template>
  <MasterSederhana
    judul="Distributor"
    nama-item="distributor"
    deskripsi="Pemasok barang untuk toko. Dipakai saat membuat pesanan pembelian dan menerima barang di gudang."
    jenis="distributor"
    menu="toko.distributor"
    :fields="FIELDS"
  />
</template>

<script setup lang="ts">
import MasterSederhana, { type FieldMaster } from '@/components/toko/MasterSederhana.vue'

const FIELDS: FieldMaster[] = [
  { key: 'nama', label: 'Nama distributor', type: 'text', wajib: true, placeholder: 'mis. CV Sumber Rejeki' },
  { key: 'kontak_person', label: 'Kontak person', type: 'text', placeholder: 'mis. Pak Budi' },
  { key: 'telepon', label: 'Telepon', type: 'text', placeholder: 'mis. 0812 3456 7890' },
  { key: 'alamat', label: 'Alamat', type: 'textarea', placeholder: 'Alamat kantor / gudang distributor' },
  { key: 'keterangan', label: 'Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)', diTabel: false }
]
</script>
