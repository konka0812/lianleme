<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { settings } from '../stores/settings'
import { MUSCLE_GROUPS, getExercise, gifUrl, gifFallback } from '../data/catalog'
import { generatePlan } from '../data/generator'
import { addExercise } from '../stores/workout'
import { showToast, buzz } from '../stores/toast'
import FramePlayer from '../components/FramePlayer.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const step = ref(1)
const pickedGroups = ref([])
const minutes = ref(30)
const level = ref('')
const plan = ref([])

const bodyGroups = computed(() => MUSCLE_GROUPS.filter((g) => g.id !== 'stretch'))
function toggleGroup(id) {
  const i = pickedGroups.value.indexOf(id)
  if (i >= 0) pickedGroups.value.splice(i, 1)
  else pickedGroups.value.push(id)
}
function make() {
  plan.value = generatePlan({ groups: pickedGroups.value, minutes: minutes.value, settings, level: level.value || undefined })
  step.value = 3
}
function addAll() {
  plan.value.forEach((ex) => addExercise(ex.slug))
  buzz([30, 60, 30])
  showToast(`已加入 ${plan.value.length} 个动作`)
  router.push('/workout')
}
const gName = (id) => MUSCLE_GROUPS.find((g) => g.id === id)?.name
</script>

<template>
  <div class="page page-top">
    <div class="row">
      <button class="icon-btn" @click="step > 1 ? step-- : $router.back()"><Icon name="back" :size="19" /></button>
      <div class="grow">
        <div class="muted" style="font-size: 12px;">智能配计划 · 第 {{ step }} 步 / 3</div>
        <h1 style="font-size: 20px;">{{ step === 1 ? '今天想练哪里？' : step === 2 ? '练多长时间？' : '你的训练计划' }}</h1>
      </div>
    </div>

    <div v-if="step === 1" class="stagger">
      <div class="chip-row" style="margin-top: 20px;">
        <button
          v-for="g in bodyGroups" :key="g.id" class="chip g-chip"
          :class="{ on: pickedGroups.includes(g.id) }"
          :style="pickedGroups.includes(g.id) ? { '--gc': g.color } : {}"
          @click="toggleGroup(g.id)"
        >
          <i class="g-dot" :style="{ background: g.color }" /> {{ g.name }}
        </button>
      </div>
      <button class="btn btn-primary btn-lg btn-block" style="margin-top: 26px;" :disabled="!pickedGroups.length" @click="step = 2">
        下一步{{ pickedGroups.length ? ` · 已选 ${pickedGroups.length} 个部位` : '' }}
      </button>
    </div>

    <div v-else-if="step === 2" class="stagger">
      <div class="time-grid">
        <button v-for="m in [20, 30, 45, 60]" :key="m" class="time-card card" :class="{ on: minutes === m }" @click="minutes = m">
          <b>{{ m }}</b><span>分钟</span>
        </button>
      </div>
      <p class="muted" style="margin: 22px 0 10px;">难度水平（不选 = 不限）</p>
      <div class="chip-row">
        <button v-for="(label, key) in { '': '不限', '新手': '新手', '进阶': '进阶', '高阶': '高阶' }" :key="key" class="chip" :class="{ on: level === key }" @click="level = key">{{ label }}</button>
      </div>
      <button class="btn btn-primary btn-lg btn-block" style="margin-top: 26px;" @click="make">
        <Icon name="zap" :size="18" /> 生成计划
      </button>
    </div>

    <div v-else class="stagger">
      <p class="muted" style="margin: 16px 0 12px;">
        {{ pickedGroups.map(gName).join(' + ') }} · {{ minutes }} 分钟 · {{ plan.length }} 个动作
      </p>
      <div class="plan-list">
        <div v-for="(ex, i) in plan" :key="ex.slug" class="card p-item">
          <span class="p-idx">{{ i + 1 }}</span>
          <FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" style="width: 62px; height: 62px; flex-shrink: 0;" />
          <router-link :to="`/e/${ex.slug}`" class="grow" style="text-decoration: none; color: inherit; min-width: 0;">
            <div style="font-weight: 800; font-size: 14px;">{{ ex.zh }}</div>
            <div class="faint">{{ ex.equipZh }} · {{ ex.muscleZh }}</div>
          </router-link>
          <button class="p-rm" @click="plan.splice(i, 1)"><Icon name="close" :size="13" /></button>
        </div>
      </div>
      <div class="row" style="gap: 10px; margin-top: 18px;">
        <button class="btn" style="flex: 1;" @click="make"><Icon name="refresh" :size="16" /> 换一批</button>
        <button class="btn btn-primary" style="flex: 1.6;" @click="addAll">
          <Icon name="plus" :size="16" /> 加入今日训练
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.g-chip { padding: 9px 15px; font-size: 14px; }
.g-chip.on .g-dot { background: #141a08; }
.g-dot { width: 9px; height: 9px; border-radius: 3px; display: inline-block; background: var(--gc, var(--muted)); }
.time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.time-card { padding: 24px 0; text-align: center; color: var(--text); cursor: pointer; transition: all 0.15s; }
.time-card b { display: block; font-size: 32px; font-weight: 900; line-height: 1.2; }
.time-card span { display: block; font-size: 12px; color: var(--muted); font-weight: 700; }
.time-card.on { border-color: var(--accent); background: rgba(200, 241, 105, 0.09); }
.time-card.on b { color: var(--accent); }
.plan-list { display: flex; flex-direction: column; gap: 8px; }
.p-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; }
.p-idx {
  width: 24px; height: 24px; border-radius: 9px; flex-shrink: 0; margin-left: 4px;
  background: rgba(200, 241, 105, 0.12); color: var(--accent);
  font-size: 12px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
}
.p-rm {
  width: 30px; height: 30px; border-radius: 10px; border: 1px solid var(--line);
  background: transparent; color: var(--muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
</style>
