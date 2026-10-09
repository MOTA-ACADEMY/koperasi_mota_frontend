<template>
  <div>
    <div
      class="flex items-center justify-between gap-2 rounded-md border-b border-border/50 px-2 py-2 hover:bg-muted/40"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <button
          v-if="node.has_children"
          type="button"
          class="shrink-0 text-muted-foreground hover:text-foreground"
          @click="expanded = !expanded"
        >
          <ChevronRight class="h-4 w-4 transition-transform" :class="{ 'rotate-90': expanded }" />
        </button>
        <span v-else class="w-4 shrink-0" />

        <code class="text-xs font-semibold shrink-0 min-w-[70px]">{{ node.kode_akun }}</code>
        <span class="text-xs text-muted-foreground font-mono shrink-0 min-w-[70px]">{{ node.full_kode }}</span>
        <span class="text-sm truncate">{{ node.nama_akun }}</span>

        <Badge variant="outline" class="text-[10px] shrink-0">
          {{ node.tipe_akun?.nama_tipe || '-' }}
        </Badge>
        <Badge variant="secondary" class="text-[10px] shrink-0">
          {{ node.kategori_akun?.nama_kategori || '-' }}
        </Badge>
        <Badge variant="outline" class="text-[10px] w-8 justify-center shrink-0">{{ node.karakter_akun }}</Badge>
        <Badge :variant="node.is_aktif ? 'green' : 'secondary'" class="text-[10px] shrink-0">
          {{ node.is_aktif ? 'Aktif' : 'Nonaktif' }}
        </Badge>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <Button
          v-if="node.tipe_akun?.kode === 'kategori'"
          variant="ghost" size="icon" class="h-7 w-7"
          title="Tambah akun anak"
          @click="$emit('add-child', node)"
        >
          <Plus class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7" @click="$emit('edit', node)">
          <Pencil class="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" class="h-7 w-7 text-destructive" @click="$emit('delete', node)">
          <Trash2 class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <div v-if="expanded && node.children?.length">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import type { MasterAkunNode } from '@/services/akuntansi/masterAkunService'

const props = defineProps<{
  node: MasterAkunNode
  depth: number
}>()

defineEmits<{
  'add-child': [node: MasterAkunNode]
  edit: [node: MasterAkunNode]
  delete: [node: MasterAkunNode]
}>()

const expanded = ref(true)
</script>
