<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { assetUrl } from '../data/catalog'

const props = defineProps({
  slug: { type: String, required: true },
  speed: { type: Number, default: 320 },
  playing: { type: Boolean, default: true },
})

const el = ref(null)
const visible = ref(false)
const idx = ref(0)
const SEQ = [1, 2, 3, 2]
const frame = computed(() => SEQ[idx.value % SEQ.length])
let t = null
let io = null

watchEffect(() => {
  if (t) { clearInterval(t); t = null }
  if (visible.value && props.playing) {
    t = setInterval(() => { idx.value = (idx.value + 1) % SEQ.length }, props.speed)
  }
})

onMounted(() => {
  io = new IntersectionObserver(([e]) => { visible.value = e.isIntersecting }, { rootMargin: '150px' })
  io.observe(el.value)
})

onUnmounted(() => {
  if (t) clearInterval(t)
  if (io) io.disconnect()
})
</script>

<template>
  <div ref="el" class="frame-player">
    <img :src="assetUrl(slug, frame)" :alt="slug" loading="lazy" draggable="false" />
  </div>
</template>
