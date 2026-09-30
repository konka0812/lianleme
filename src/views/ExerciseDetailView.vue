<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExercise } from '../data/catalog'
import { getTips, getMistake, repSuggestion } from '../data/tips'
import { settings, toggleFavorite } from '../stores/settings'
import { addExercise, workout } from '../stores/workout'
import { showToast, buzz } from '../stores/toast'
import FramePlayer from '../components/FramePlayer.vue'
import Icon from '../components/Icon.vue'
import { difficultyOf, DIFF_COLOR } from '../data/difficulty'
import { gifUrl, gifFallback, TYPE_ZH } from '../data/catalog'
import { STEPS_ZH } from '../data/steps-zh'

const route = useRoute()
const router = useRouter()
const ex = computed(() => getExercise(route.params.slug))
const playing = ref(true)
const speed = ref(320)
const tips = computed(() => getTips(ex.value))
const mistake = computed(() => getMistake(ex.value))
const steps = computed(() => STEPS_ZH[route.params.slug] || [])
const stepsOpen = ref(false)
const rep = computed(() => (ex.value ? repSuggestion(ex.value) : ''))
const fav = computed(() => settings.favorites.includes(route.params.slug))
const inList = computed(() => !!workout.list.find((i) => i.slug === route.params.slug))
const diff = computed(() => difficultyOf(ex.value))

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) { lines.push(line); line = ch } else { line += ch }
  }
  if (line) lines.push(line)
  return lines
}


function back() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
function onAdd() {
  addExercise(ex.value.slug)
  buzz([20, 40, 20])
  showToast(`已加入 · ${ex.value.zh}`)
}
</script>

<template>
  <div v-if="ex" class="page page-top detail">
    <div class="row">
      <button class="icon-btn" @click="back"><Icon name="back" :size="19" /></button>
      <span class="muted grow" style="text-align: center;">动作详情</span>
      <button class="icon-btn" :class="{ on: fav }" @click="toggleFavorite(ex.slug); buzz(12)">
        <Icon name="heart" :size="19" :style="fav ? 'fill: currentColor' : ''" />
      </button>
    </div>

    <div class="player-card card" @click="playing = !playing">
      <div class="player-glow" />
      <FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" />
      <span class="play-state">
        <Icon :name="playing ? 'pause' : 'play'" :size="13" />
        {{ playing ? '播放中' : '已暂停' }}
      </span>
    </div>
    <div class="row" style="justify-content: center; margin: 12px 0 18px; gap: 6px;">
      <button v-for="(label, v) in { 450: '慢', 320: '中', 220: '快' }" :key="v" class="chip" :class="{ on: speed === Number(v) }" @click="speed = Number(v); playing = true">{{ label }}</button>
    </div>

    <h1 style="font-size: 24px;">{{ ex.zh }}</h1>
    <p class="faint" style="margin: 3px 0 14px; font-size: 13px;">{{ ex.name }}</p>
    <div class="row" style="flex-wrap: wrap; gap: 6px;">
      <span class="tag">{{ ex.equipZh }}</span>
      <span class="tag" style="color: var(--accent); border-color: rgba(200, 241, 105, 0.3);">目标 · {{ ex.muscleZh }}</span>
      <span class="tag">{{ TYPE_ZH[ex.exerciseType] || ex.exerciseType }}</span>
      <span class="tag" :style="{ color: DIFF_COLOR[diff], borderColor: 'color-mix(in srgb, ' + DIFF_COLOR[diff] + ' 40%, transparent)', background: 'color-mix(in srgb, ' + DIFF_COLOR[diff] + ' 10%, transparent)' }">难度 · {{ diff }}</span>
      <span v-if="rep" class="tag" style="color: var(--accent2); border-color: rgba(94, 234, 212, 0.3);">建议 {{ rep }}</span>
    </div>
    <p class="muted" style="margin-top: 12px; font-size: 13px;">协同肌群：{{ ex.secondaryZh.join('、') || '无' }}</p>

    <div v-if="steps.length" class="card steps-card">
      <button class="steps-toggle" @click="stepsOpen = !stepsOpen">
        <b>详细步骤</b>
        <span class="muted" style="font-size: 12px;">{{ steps.length }} 步</span>
        <Icon name="chevron" :size="15" style="color: var(--faint); margin-left: auto;" :style="stepsOpen ? 'transform: rotate(90deg)' : ''" />
      </button>
      <div v-if="stepsOpen">
        <div v-for="(s, i) in steps" :key="i" class="tip-row">
          <span class="tip-num">{{ i + 1 }}</span>
          <span class="tip-text">{{ s }}</span>
        </div>
      </div>
    </div>

    <div class="card tips-card">
      <div class="row" style="padding: 13px 16px 3px;">
        <div class="tip-ico"><Icon name="zap" :size="15" /></div>
        <b style="font-size: 14px;">动作要点</b>
      </div>
      <div style="padding: 0 16px 6px;">
        <div v-for="(t, i) in tips" :key="i" class="tip-row">
          <span class="tip-num">{{ i + 1 }}</span>
          <span class="tip-text">{{ t }}</span>
        </div>
        <div v-if="mistake" class="tip-mistake">
          <span class="mistake-ico"><Icon name="alert" :size="15" /></span>
          <span><b>常见错误：</b>{{ mistake }}</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bar-row">
        <button class="btn btn-primary grow" style="padding: 11px; font-size: 15px;" @click="inList ? router.push('/workout') : onAdd()">
          <Icon :name="inList ? 'check' : 'plus'" :size="18" />
          {{ inList ? '已在今日训练 · 去查看' : '加入今日训练' }}
        </button>
      </div>
    </div>
    <div style="height: 140px;" />

    <p class="faint" style="margin-top: 8px; font-size: 11px; text-align: center;">
      动作演示 © Gym visual · 数据 exercises-dataset (MIT)
    </p>
  </div>
</template>

<style scoped>
.detail { padding-bottom: 0; }
.player-card { position: relative; padding: 10px; margin-top: 14px; overflow: hidden; }
.player-glow {
  position: absolute; inset: 0;
  background: radial-gradient(300px 200px at 50% 40%, rgba(200, 241, 105, 0.08), transparent 70%);
  pointer-events: none;
}
.player-card :deep(.frame-player) { height: 330px; cursor: pointer; position: relative; }
.play-state {
  position: absolute; right: 14px; bottom: 12px;
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  background: var(--scrim); border: 1px solid var(--line);
  padding: 4px 10px; border-radius: 999px; backdrop-filter: blur(8px);
}
.tip-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
  background: var(--accent-fill); color: #17240a;
  font-size: 11.5px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
}
.tips-card { margin-top: 12px; margin-bottom: 6px; }
.steps-card { margin-top: 18px; }
.steps-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 13px 16px; background: transparent; border: none;
  color: var(--text); font-size: 14px; cursor: pointer;
}
.bar-row { display: flex; gap: 10px; }
.bottom-bar {
  position: fixed; bottom: calc(68px + env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%);
  width: min(528px, calc(100% - 32px)); z-index: 40;
  background: var(--scrim); backdrop-filter: blur(18px);
  border: 1px solid var(--line); border-radius: 18px; padding: 12px;
  box-shadow: var(--shadow-2);
}
</style>




<style scoped>
.speed-chip {
  min-width: 92px; padding: 9px 0; border-radius: 999px; text-align: center;
  border: 1px solid var(--line-strong); background: var(--card);
  color: var(--muted); font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.speed-chip.on { background: var(--accent-fill); border-color: transparent; color: #17240a; box-shadow: 0 3px 12px rgba(140, 205, 70, 0.3); }
</style>
