<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { assetUrl, fallbackUrl, fallbackUrl2 } from '../data/catalog'

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
const tier = ref(0) // 0=OBS主源 1=内置包 2=jsDelivr
const src = computed(() => {
  const s = props.slug, n = frame.value
  if (tier.value === 0) return assetUrl(s, n)
  if (tier.value === 1) return fallbackUrl(s, n)
  return fallbackUrl2(s, n)
})
watch(frame, () => { tier.value = 0 })
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
    <img :src="src" :alt="slug" loading="lazy" draggable="false" @error="tier = Math.min(tier + 1, 2)" />
  </div>
</template>
