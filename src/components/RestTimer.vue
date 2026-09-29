<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { workout, stopRest } from '../stores/workout'
import Icon from './Icon.vue'

const now = ref(Date.now())
const paused = ref(false)
const fullscreen = ref(false)
const duration = ref(workout.timer.duration || 60)
const endsAt = ref(0)
let t = null

onMounted(() => { t = setInterval(() => { now.value = Date.now() }, 200) })
onUnmounted(() => clearInterval(t))

const C = 2 * Math.PI * 54
const C2 = 2 * Math.PI * 108

const remainSec = computed(() => {
  if (!workout.timer.running) return duration.value
  return Math.max(0, (endsAt.value - now.value) / 1000)
})
const remainCeil = computed(() => Math.ceil(remainSec.value))
const progress = computed(() => (duration.value ? Math.min(1, remainSec.value / duration.value) : 0))
const mmss = computed(() => {
  const s = remainCeil.value
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 1.25
    speechSynthesis.speak(u)
  } catch (e) { /* noop */ }
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[880, 880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = f
      o.type = 'sine'
      g.gain.value = 0.16
      o.connect(g)
      g.connect(ctx.destination)
      const st = ctx.currentTime + i * 0.3
      o.start(st)
      o.stop(st + 0.24)
    })
  } catch (e) { /* noop */ }
}

const spoken = new Set()
function openTimer(seconds) {
  duration.value = seconds
  endsAt.value = Date.now() + seconds * 1000
  paused.value = false
  spoken.clear()
  workout.timer = { duration: seconds, endsAt: endsAt.value, running: true }
  fullscreen.value = true
}
function restart(s) { openTimer(s) }
function adjust(d) {
  endsAt.value = Math.max(Date.now() + 1000, endsAt.value + d * 1000)
  duration.value = Math.max(1, Math.round((endsAt.value - Date.now()) / 1000))
}
function closeTimer() {
  stopRest()
  fullscreen.value = false
}

watch(remainCeil, (v, old) => {
  if (workout.timer.running && !paused.value && v <= 3 && v > 0 && !spoken.has(v)) {
    spoken.add(v)
    speak(String(v))
  }
  if (workout.timer.running && !paused.value && v === 0 && old > 0) {
    workout.timer.running = false
    if (navigator.vibrate) navigator.vibrate([400, 120, 400, 120, 700])
    beep()
    speak('休息结束')
    setTimeout(() => { fullscreen.value = false }, 900)
  }
})

const smallProgress = computed(() => {
  const tm = workout.timer
  if (!tm.running) return 0
  return Math.max(0, Math.min(1, (tm.endsAt - now.value) / (tm.duration * 1000)))
})
const smallMmss = computed(() => {
  if (!workout.timer.running) return '休息'
  const s = Math.ceil(Math.max(0, (workout.timer.endsAt - now.value) / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
</script>

<template>
  <div>
    <div class="card rest-trigger pressable" @click="openTimer(duration)">
      <div class="ring-wrap">
        <svg viewBox="0 0 120 120" class="ring">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--line)" stroke-width="8" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" stroke-width="8"
            stroke-linecap="round" :stroke-dasharray="C" :stroke-dashoffset="C * (1 - smallProgress)"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div class="ring-text" :class="{ running: workout.timer.running }">{{ smallMmss }}</div>
      </div>
      <div class="grow" style="text-align: left;">
        <div style="font-weight: 800; font-size: 15px;">组间休息</div>
        <div class="muted">点击开始 {{ duration }}s · 全屏沉浸计时</div>
      </div>
      <Icon name="chevron" :size="18" style="color: var(--faint);" />
    </div>

    <transition name="screen-timer">
      <div v-if="fullscreen" class="screen-timer" @click="fullscreen = false">
        <div class="muted" style="letter-spacing: 5px; font-size: 13px; font-weight: 700;">组间休息</div>
        <div class="big-ring-wrap" @click.stop>
          <svg viewBox="0 0 240 240" class="big-ring">
            <circle cx="120" cy="120" r="108" fill="none" stroke="var(--line)" stroke-width="6" />
            <circle
              cx="120" cy="120" r="108" fill="none" stroke="var(--accent)" stroke-width="6"
              stroke-linecap="round" :stroke-dasharray="C2" :stroke-dashoffset="C2 * (1 - progress)"
              transform="rotate(-90 120 120)"
              style="filter: drop-shadow(0 0 14px rgba(200, 241, 105, 0.45));"
            />
          </svg>
          <div class="big-ring-text" :class="{ paused }">{{ paused ? '已暂停' : mmss }}</div>
        </div>
        <div class="row" style="gap: 16px;" @click.stop>
          <button class="t-btn" @click="adjust(-15)">−15s</button>
          <button class="t-btn main" @click="paused = !paused">
            <Icon :name="paused ? 'play' : 'pause'" :size="26" />
          </button>
          <button class="t-btn" @click="adjust(15)">+15s</button>
        </div>
        <div class="chip-row" style="justify-content: center;" @click.stop>
          <button v-for="s in [30, 45, 60, 90, 120]" :key="s" class="chip" :class="{ on: duration === s }" @click="restart(s)">{{ s }}s</button>
        </div>
        <button class="chip" style="opacity: 0.65;" @click="closeTimer">跳过休息</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.rest-trigger { display: flex; align-items: center; gap: 14px; padding: 14px 16px; }
.ring-wrap { position: relative; width: 74px; height: 74px; flex-shrink: 0; }
.ring { width: 100%; height: 100%; }
.ring-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: var(--muted);
}
.ring-text.running { color: var(--accent); font-variant-numeric: tabular-nums; }
.big-ring-wrap { position: relative; width: min(62vw, 280px); }
.big-ring { width: 100%; display: block; }
.big-ring-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 64px; font-weight: 200; color: var(--text); font-variant-numeric: tabular-nums;
}
.big-ring-text.paused { font-size: 30px; font-weight: 700; color: var(--muted); }
.t-btn {
  width: 56px; height: 56px; border-radius: 50%;
  border: 1px solid var(--line-strong); background: var(--card);
  color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform 0.12s;
}
.t-btn:active { transform: scale(0.9); }
.t-btn.main {
  width: 76px; height: 76px;
  background: var(--accent-fill); border: none; color: #141a08;
  box-shadow: 0 6px 26px rgba(200, 241, 105, 0.35);
}
</style>

