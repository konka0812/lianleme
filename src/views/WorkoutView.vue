<script setup>
import { computed, ref } from 'vue'
import { workout, toggleDone, removeExercise, moveExercise, clearWorkout } from '../stores/workout'
import { saveRecord } from '../stores/history'
import { getExercise } from '../data/catalog'
import { repSuggestion as repFor } from '../data/tips'
import { showToast, buzz } from '../stores/toast'
import FramePlayer from '../components/FramePlayer.vue'
import RestTimer from '../components/RestTimer.vue'
import Icon from '../components/Icon.vue'

const showSaved = ref(false)
const items = computed(() =>
  workout.list
    .map((i) => ({ ...i, ex: getExercise(i.slug), rep: repFor(getExercise(i.slug) || { exerciseType: '' }) }))
    .filter((i) => i.ex)
)
const current = computed(() => items.value.find((i) => !i.done) || null)
const doneCount = computed(() => items.value.filter((i) => i.done).length)
const progressPct = computed(() => (items.value.length ? Math.round((doneCount.value / items.value.length) * 100) : 0))

function inc(item, d) {
  item.sets = Math.min(9, Math.max(1, (parseInt(item.sets) || 3) + d))
}
function finishWorkout() {
  if (saveRecord(workout.list)) {
    buzz([30, 60, 30, 60, 30])
    showSaved.value = true
    clearWorkout()
    setTimeout(() => { showSaved.value = false }, 2600)
  }
}
</script>

<template>
  <div class="page page-top">
    <div class="row">
      <h1 class="grow" style="font-size: 24px;">今日训练</h1>
      <span v-if="items.length" class="done-pill">{{ doneCount }}/{{ items.length }} 已完成</span>
      <button v-if="items.length" class="icon-btn danger" style="width: 38px; height: 38px;" @click="clearWorkout"><Icon name="trash" :size="17" /></button>
    </div>
    <div v-if="items.length" class="prog-bar" style="margin-top: 12px;"><i :style="{ width: progressPct + '%' }" /></div>

    <template v-if="items.length">
      <div v-if="current" class="card current-card">
        <div class="cur-label"><i />当前动作</div>
        <FramePlayer :slug="current.slug" class="current-player" />
        <div class="cur-body">
          <div class="cur-name">{{ current.ex.zh }}</div>
          <div class="muted" style="font-size: 13.5px; margin-bottom: 14px;">{{ current.ex.equipZh }} · 建议 {{ current.rep }}</div>
          <div class="sets-row">
            <span class="muted" style="font-size: 14px;">组数</span>
            <div class="stepper">
              <button @click="inc(current, -1)">−</button>
              <b>{{ current.sets || 3 }}</b>
              <button @click="inc(current, 1)">＋</button>
            </div>
            <button class="btn btn-primary" style="flex: 1; padding: 13px; font-size: 15.5px;" @click="toggleDone(current.slug); buzz(30)">
              <Icon name="check" :size="18" /> 完成
            </button>
          </div>
        </div>
      </div>
      <div v-else class="card alldone">
        <Icon name="check" :size="32" style="color: var(--accent);" />
        <b style="font-size: 17px;">全部完成！</b>
        <span class="muted">今天练了 {{ doneCount }} 个动作，保存下来吧</span>
      </div>

      <RestTimer style="margin: 12px 0;" />

      <div class="card list-card" style="margin-top: 12px;">
        <div class="list-title">动作清单</div>
        <div v-for="(it, idx) in items" :key="it.slug" class="w-item" :class="{ done: it.done, current: current && current.slug === it.slug }">
          <button class="check" :class="{ on: it.done }" @click="toggleDone(it.slug)"><Icon v-if="it.done" name="check" :size="13" /></button>
          <router-link :to="`/e/${it.slug}`" class="w-name">
            <b>{{ it.ex.zh }}</b>
            <span class="faint">{{ it.sets || 3 }} 组 · {{ it.rep }}</span>
          </router-link>
          <div class="w-ops">
            <button class="op" :disabled="idx === 0" @click="moveExercise(it.slug, 1)"><Icon name="down" :size="14" /></button>
            <button class="op" :disabled="idx === items.length - 1" @click="moveExercise(it.slug, -1)"><Icon name="up" :size="14" /></button>
            <button class="op danger" @click="removeExercise(it.slug)"><Icon name="close" :size="14" /></button>
          </div>
        </div>
      </div>

      <button v-if="doneCount" class="btn btn-primary btn-lg btn-block" style="margin-top: 14px;" @click="finishWorkout">
        <Icon name="check" :size="18" /> 保存训练记录
      </button>
    </template>

    <div v-else class="empty">
      <div class="empty-ico"><Icon name="flame" :size="26" style="color: var(--accent);" /></div>
      <p class="muted" style="text-align: center;">今日清单还是空的<br />去挑几个动作，或者让 AI 帮你配</p>
      <div class="row" style="gap: 10px;">
        <router-link to="/generator" class="btn btn-primary" style="text-decoration: none;">智能配计划</router-link>
        <router-link to="/" class="btn" style="text-decoration: none;">自己挑</router-link>
      </div>
    </div>

    <transition name="toast">
      <div v-if="showSaved" class="toast">
        <Icon name="check" :size="15" style="color: var(--accent);" /> 训练记录已保存
      </div>
    </transition>
  </div>
</template>

<style scoped>
.done-pill { font-size: 12.5px; font-weight: 800; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid var(--accent-border); padding: 5px 12px; border-radius: 999px; }
.prog-bar { height: 8px; border-radius: 5px; background: rgba(127, 137, 152, 0.12); overflow: hidden; }
.prog-bar i { display: block; height: 100%; background: var(--accent-fill); border-radius: 5px; transition: width 0.4s cubic-bezier(0.22, 0.9, 0.36, 1); }
.current-card { margin-top: 16px; overflow: hidden; }
.cur-label {
  display: flex; align-items: center; gap: 7px;
  padding: 14px 16px 0; font-size: 13.5px; font-weight: 800;
}
.cur-label i { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.current-player { height: 250px; }
.cur-body { padding: 0 18px 18px; }
.cur-name { font-size: 20px; font-weight: 900; margin-bottom: 3px; }
.sets-row { display: flex; align-items: center; gap: 12px; }
.stepper {
  display: flex; align-items: center; gap: 4px;
  background: var(--bg); border: 1px solid var(--line-strong); border-radius: 14px;
  padding: 4px;
}
.stepper button {
  width: 34px; height: 34px; border: none; border-radius: 10px; background: transparent;
  color: var(--muted); font-size: 17px; cursor: pointer;
}
.stepper b { min-width: 34px; text-align: center; font-size: 17px; font-weight: 900; }
.alldone { margin-top: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
.list-card { padding: 4px 16px; }
.list-title { font-size: 15px; font-weight: 800; padding: 14px 0 6px; }
.w-item { display: flex; align-items: center; gap: 11px; padding: 13px 0; }
.w-item + .w-item { border-top: 1px solid var(--line); }
.w-item.current { margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 14px; border: 1px solid var(--accent-border); background: var(--accent-soft); }
.w-item.done { opacity: 0.45; }
.check {
  width: 27px; height: 27px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--line-strong); background: transparent; color: #17240a;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.check.on { background: var(--accent-fill); border-color: transparent; animation: pop 0.3s; }
.w-name { flex: 1; min-width: 0; text-decoration: none; color: var(--text); display: flex; flex-direction: column; gap: 1px; }
.w-name b { font-size: 15px; font-weight: 800; }
.w-ops { display: flex; gap: 6px; }
.op {
  width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--line-strong);
  background: var(--card); color: var(--muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}
.op:active { transform: scale(0.88); }
.op:disabled { opacity: 0.25; }
.op.danger { color: var(--danger); }
.empty { text-align: center; padding: 80px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.empty-ico { width: 62px; height: 62px; border-radius: 20px; background: var(--card); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; }
</style>

