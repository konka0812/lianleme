<script setup>
import { computed } from 'vue'
import FramePlayer from './FramePlayer.vue'
import { gifUrl, gifFallback } from '../data/catalog'
import Icon from './Icon.vue'
import { settings, toggleFavorite } from '../stores/settings'
import { addExercise, workout } from '../stores/workout'
import { showToast, buzz } from '../stores/toast'

const props = defineProps({ ex: { type: Object, required: true } })

const fav = computed(() => settings.favorites.includes(props.ex.slug))
const inList = computed(() => !!workout.list.find((i) => i.slug === props.ex.slug))

function onFav() {
  toggleFavorite(props.ex.slug)
  buzz(12)
}
function onAdd() {
  addExercise(props.ex.slug)
  buzz([20, 40, 20])
  showToast(`已加入 · ${props.ex.zh}`)
}
</script>

<template>
  <div class="ex-card card">
    <router-link :to="`/e/${ex.slug}`" class="ex-thumb-link pressable">
      <FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" class="ex-thumb" />
    </router-link>
    <router-link :to="`/e/${ex.slug}`" class="ex-info">
      <div class="ex-name">{{ ex.zh }}</div>
      <div class="ex-en faint">{{ ex.name }}</div>
      <div class="row" style="flex-wrap: wrap; gap: 5px;">
        <span class="tag">{{ ex.equipZh }}</span>
        <span class="tag">{{ ex.muscleZh }}</span>
      </div>
    </router-link>
    <div class="ex-ops">
      <button class="mini-btn" :class="{ on: fav }" @click="onFav">
        <Icon name="heart" :size="17" :style="fav ? 'fill: currentColor' : ''" />
      </button>
      <button class="mini-btn add" :class="{ done: inList }" @click="onAdd">
        <Icon :name="inList ? 'check' : 'plus'" :size="17" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ex-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px 10px 10px; text-decoration: none; color: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.ex-card:active { background: var(--card-hover); }
.ex-thumb-link { flex-shrink: 0; display: block; }
.ex-thumb { width: 88px; height: 88px; border-radius: 14px; background: rgba(255, 255, 255, 0.03); }
.ex-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; text-decoration: none; color: inherit; }
.ex-name { font-weight: 800; font-size: 15px; }
.ex-en { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-ops { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.mini-btn {
  width: 34px; height: 34px; border-radius: 11px;
  border: 1px solid var(--line); background: rgba(255, 255, 255, 0.04);
  color: var(--muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.mini-btn:active { transform: scale(0.85); }
.mini-btn.on { color: var(--danger); border-color: rgba(255, 122, 122, 0.4); background: rgba(255, 122, 122, 0.08); }
.mini-btn.add { color: var(--accent); border-color: rgba(200, 241, 105, 0.35); background: rgba(200, 241, 105, 0.07); }
.mini-btn.add.done { background: var(--accent-fill); color: #141a08; border-color: transparent; }
</style>

