<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { completeOnboarding } from '../stores/settings'
import { HOME_EQUIPMENT, ALL_EQUIPMENT, EQUIP_LABEL } from '../data/catalog'
import Icon from '../components/Icon.vue'

const router = useRouter()
const step = ref(0)
const scene = ref('home')
const equipment = ref([])

const scenes = [
  { key: 'home', title: '在家练', desc: '哑铃 / 弹力带 / 自重为主' },
  { key: 'gym', title: '健身房', desc: '杠铃 / 器械 / 绳索全开放' },
  { key: 'all', title: '都要', desc: '不限制场景' },
]

function pickScene(s) {
  scene.value = s
  equipment.value = s === 'home' ? [...HOME_EQUIPMENT] : []
}
const equipList = () => (scene.value === 'home' ? HOME_EQUIPMENT : ALL_EQUIPMENT)
function toggleEquip(k) {
  const i = equipment.value.indexOf(k)
  if (i >= 0) equipment.value.splice(i, 1)
  else equipment.value.push(k)
}
function finish() {
  completeOnboarding(scene.value, scene.value === 'home' ? equipment.value : [])
  router.replace('/')
}
</script>

<template>
  <div class="page page-top onb">
    <template v-if="step === 0">
      <div class="onb-hero">
        <div class="logo-dot"><Icon name="dumbbell" :size="38" /></div>
        <h1>练了么</h1>
        <p class="muted">1324 个标准动作 · 中文步骤要点 · 离线可用<br />今天，练了么？</p>
        <button class="btn btn-primary btn-lg btn-block" @click="step = 1">开始</button>
      </div>
    </template>

    <template v-else-if="step === 1">
      <h2 style="font-size: 20px;">你平时在哪里练？</h2>
      <div class="scene-list stagger">
        <button v-for="s in scenes" :key="s.key" class="scene-card card" :class="{ on: scene === s.key }" @click="pickScene(s.key)">
          <span class="scene-check"><Icon v-if="scene === s.key" name="check" :size="16" /></span>
          <div><b>{{ s.title }}</b><div class="muted" style="font-size: 12.5px;">{{ s.desc }}</div></div>
        </button>
      </div>
      <button class="btn btn-primary btn-lg btn-block" style="margin-top: 18px;" @click="step = 2">下一步</button>
    </template>

    <template v-else>
      <h2 style="font-size: 20px;">手边有哪些器械？</h2>
      <p class="muted">{{ scene === 'home' ? '选了才显示对应动作，之后可随时改' : '不选 = 全部可用' }}</p>
      <div class="chip-row" style="margin: 14px 0 22px;">
        <button
          v-for="k in equipList()" :key="k" class="chip"
          :class="{ on: equipment.includes(k) }" @click="toggleEquip(k)"
        >{{ EQUIP_LABEL[k] || k }}</button>
      </div>
      <button class="btn btn-primary btn-lg btn-block" @click="finish">
        完成设置{{ equipment.length ? `（${equipment.length} 种器械）` : '' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.onb { display: flex; flex-direction: column; justify-content: center; min-height: 90dvh; }
.onb-hero { display: flex; flex-direction: column; gap: 14px; text-align: center; align-items: center; padding-bottom: 8dvh; }
.logo-dot {
  width: 84px; height: 84px; border-radius: 26px;
  background: var(--accent-fill); color: #17240a;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px rgba(140, 205, 70, 0.35);
}
.scene-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.scene-card {
  display: flex; align-items: center; gap: 14px; text-align: left;
  padding: 16px 18px; cursor: pointer; color: var(--text); font-size: 15px;
  transition: all 0.15s;
}
.scene-card.on { border-color: var(--accent); background: var(--accent-soft); }
.scene-check {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--line-strong); color: #17240a;
  display: inline-flex; align-items: center; justify-content: center;
}
.scene-card.on .scene-check { background: var(--accent-fill); border-color: transparent; }
</style>



