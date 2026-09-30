<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  fallback: { type: String, default: '' },
})

const el = ref(null)
const visible = ref(false)
const tier = ref(0)
const src = computed(() => (tier.value === 1 && props.fallback ? props.fallback : props.url))
let io = null

onMounted(() => {
  io = new IntersectionObserver(([e]) => { visible.value = e.isIntersecting }, { rootMargin: '200px' })
  io.observe(el.value)
})
onUnmounted(() => io && io.disconnect())
</script>

<template>
  <div ref="el" class="frame-player">
    <img v-if="visible" :src="src" :alt="''" loading="lazy" draggable="false" @error="tier = 1" />
  </div>
</template>
