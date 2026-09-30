<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  fallback: { type: String, default: '' },
})

const el = ref(null)
const visible = ref(false)
const tier = ref(0)
const darkBg = ref(false)

function onLoad(e) {
  try {
    const img = e.target
    if (!img.naturalWidth) return
    const cv = document.createElement("canvas")
    const s = 24
    cv.width = s; cv.height = s
    const cx = cv.getContext("2d")
    cx.drawImage(img, 0, 0, s, s)
    const d = cx.getImageData(0, 0, s, s).data
    let sum = 0, n = 0
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]
      sum += lum; n++
    }
    darkBg.value = sum / n < 70
  } catch (err) { /* skip */ }
}
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
    <img v-if="visible" :src="src" :alt="''" loading="lazy" draggable="false" @error="tier = 1" @load="onLoad" />
  </div>
</template>
