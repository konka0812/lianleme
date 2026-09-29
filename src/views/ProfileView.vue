<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { settings } from '../stores/settings'
import { history, weekStats, last7Days, last4Weeks } from '../stores/history'
import { ALL_EQUIPMENT, EQUIPMENT_ZH, getExercise, allAssetUrls } from '../data/catalog'
import { showToast, buzz } from '../stores/toast'
import Icon from '../components/Icon.vue'

const router = useRouter()
const stats = computed(() => weekStats())
const days = last7Days()
const weeks = last4Weeks()
const maxWeek = computed(() => Math.max(1, ...weeks.map((w) => w.n)))
const recent = computed(() => history.records.slice(0, 8))
const expanded = ref('')          // '' | 'scene' | 'theme' | 'equip' | 'hist'
const openHist = ref('')

const sceneLabel = { home: '在家练', gym: '健身房', all: '都要' }
const themeLabel = { light: '浅色', dark: '深色', auto: '跟随系统' }
const streakDays = computed(() => new Set(history.records.map((r) => r.date)).size)

function toggleEquip(k) {
  const i = settings.equipment.indexOf(k)
  if (i >= 0) settings.equipment.splice(i, 1)
  else settings.equipment.push(k)
}
function toggleSection(key) {
  expanded.value = expanded.value === key ? '' : key
}
function toggleHist(id) {
  openHist.value = openHist.value === id ? '' : id
}

const prog = reactive({ running: false, done: 0, total: 0 })
async function prefetch() {
  if (prog.running) return
  const urls = allAssetUrls()
  prog.done = 0
  prog.total = urls.length
  prog.running = true
  let idx = 0
  const CONC = 6
  async function worker() {
    while (idx < urls.length) {
      const u = urls[idx++]
      try { await fetch(u, { mode: 'cors' }) } catch (e) { /* retry next time */ }
      prog.done++
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker))
  prog.running = false
  buzz(30)
  showToast('全部动作图已离线缓存')
  localStorage.setItem('lian-prefetch-at', String(Date.now()))
}
function resetOnboarding() {
  settings.onboarded = false
  router.replace('/onboarding')
}
</script>

<template>
  <div class="page page-top">    <!-- 个人信息卡 -->
    <div class="card me-card">
      <div class="me-head">
        <div class="avatar"><Icon name="dumbbell" :size="26" /></div>
        <div class="grow">
          <div class="me-name">训练者</div>
          <div class="muted" style="font-size: 12.5px;">已坚持 {{ streakDays }} 天 · 累计 {{ stats.allTime }} 次训练</div>
        </div>
      </div>
      <div class="me-stats">
        <div class="stat"><b>{{ stats.sessions }}</b><span>本周训练</span></div>
        <div class="stat-div" />
        <div class="stat"><b>{{ stats.totalMoves }}</b><span>本周动作</span></div>
        <div class="stat-div" />
        <div class="stat"><b>{{ stats.allTime }}</b><span>累计次数</span></div>
      </div>
    </div>

    <!-- 本周打卡 -->
    <div class="card sect-card">
      <div class="sect-title">本周打卡</div>
      <div class="punch-row">
        <div v-for="d in days" :key="d.key" class="punch">
          <span class="punch-circle" :class="{ on: d.active }"><Icon v-if="d.active" name="check" :size="14" /></span>
          <i>周{{ d.label }}</i>
        </div>
      </div>
    </div>

    <!-- 训练量 -->
    <div class="card sect-card">
      <div class="sect-title">训练量 · 近 4 周</div>
      <div class="chart-row">
        <div v-for="w in weeks" :key="w.label" class="chart-col">
          <span class="chart-n" :class="{ zero: !w.n }">{{ w.n }}</span>
          <div class="chart-bar"><i :style="{ height: Math.max(6, w.n / maxWeek * 78) + 'px' }" /></div>
          <em>{{ w.label }}</em>
        </div>
      </div>
    </div>

    <!-- 训练历史 -->
    <div v-if="history.records.length" class="card sect-card">
      <div class="sect-title">训练历史</div>
      <div v-for="r in recent" :key="r.id" class="hist-wrap">
        <div class="hist-row pressable" @click="toggleHist(r.id)">
          <span class="hist-check"><Icon name="check" :size="12" /></span>
          <span class="hist-date">{{ r.date.slice(5) }}</span>
          <span class="hist-names grow">{{ r.exercises.map((s) => getExercise(s)?.zh || s).slice(0, 3).join(' · ') }}{{ r.exercises.length > 3 ? ' …' : '' }}</span>
          <b class="hist-n">{{ r.total }}</b>
          <Icon name="chevron" :size="13" style="color: var(--faint);" :style="openHist === r.id ? 'transform: rotate(90deg)' : ''" />
        </div>
        <div v-if="openHist === r.id" class="hist-open">
          <router-link v-for="s in r.exercises" :key="s" :to="`/e/${s}`" class="chip hist-chip">{{ getExercise(s)?.zh }}</router-link>
        </div>
      </div>
      <p v-if="history.records.length > recent.length" class="faint" style="text-align: center; padding: 8px 0 4px; margin: 0;">
        更早的 {{ history.records.length - recent.length }} 条记录已收起
      </p>
    </div>

    <!-- 偏好设置 -->
    <div class="card sect-card">
      <div class="sect-title">偏好设置</div>
      <button class="pref-row" @click="toggleSection('scene')">
        <span class="pref-ico"><Icon name="dumbbell" :size="16" /></span>
        <span class="grow" style="text-align: left;">训练场景</span>
        <span class="pref-val">{{ sceneLabel[settings.scene] }}</span>
        <Icon name="chevron" :size="13" style="color: var(--faint);" :style="expanded === 'scene' ? 'transform: rotate(90deg)' : ''" />
      </button>
      <div v-if="expanded === 'scene'" class="pref-open">
        <div class="chip-row">
          <button v-for="(label, key) in sceneLabel" :key="key" class="chip" :class="{ on: settings.scene === key }" @click="settings.scene = key">{{ label }}</button>
        </div>
        <p class="faint" style="margin: 8px 0 0;">器械偏好：{{ settings.equipment.length ? settings.equipment.map((k) => EQUIPMENT_ZH[k]).join(' · ') : '全部可用' }}</p>
        <div class="chip-row" style="margin-top: 8px;">
          <button v-for="k in ALL_EQUIPMENT" :key="k" class="chip" :class="{ on: settings.equipment.includes(k) }" @click="toggleEquip(k)">{{ EQUIPMENT_ZH[k] }}</button>
        </div>
      </div>
      <button class="pref-row" @click="toggleSection('theme')">
        <span class="pref-ico"><Icon name="sun" :size="16" /></span>
        <span class="grow" style="text-align: left;">外观</span>
        <span class="pref-val">{{ themeLabel[settings.theme] }}</span>
        <Icon name="chevron" :size="13" style="color: var(--faint);" :style="expanded === 'theme' ? 'transform: rotate(90deg)' : ''" />
      </button>
      <div v-if="expanded === 'theme'" class="pref-open">
        <div class="chip-row">
          <button v-for="(label, key) in themeLabel" :key="key" class="chip" :class="{ on: settings.theme === key }" @click="settings.theme = key">{{ label }}</button>
        </div>
      </div>
    </div>

    <!-- 离线缓存 -->
    <button class="prefetch-btn btn-primary" :disabled="prog.running" @click="prefetch">
      <Icon v-if="!prog.running" name="zap" :size="17" />
      {{ prog.running ? `缓存中 ${prog.done}/${prog.total}` : '预缓存全部动作图 · 离线可用' }}
    </button>
    <div v-if="prog.total" class="bar" style="margin-top: 10px;"><i :style="{ width: (prog.done / prog.total * 100) + '%' }" /></div>
    <p v-else class="faint" style="text-align: center; margin: 8px 0 0;">约 25MB · 建议Wi-Fi · 健身房断网也能用</p>

    <p class="faint" style="text-align: center; margin: 22px 0 0; font-size: 11px;">
      练了么 v1.0 · 线稿素材 Bryl Lim（CC BY-SA 4.0）
    </p>
  </div>
</template>

<style scoped>
.me-card { padding: 18px; }
.me-head { display: flex; align-items: center; gap: 14px; }
.avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent-fill); color: #17240a;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 18px rgba(140, 205, 70, 0.35);
}
.me-name { font-size: 18px; font-weight: 900; }
.me-stats { display: flex; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); }
.stat { flex: 1; text-align: center; }
.stat b { display: block; font-size: 22px; font-weight: 900; color: var(--accent-deep); font-variant-numeric: tabular-nums; }
.stat span { font-size: 11.5px; color: var(--muted); }
.stat-div { width: 1px; height: 30px; background: var(--line); }
.sect-card { margin-top: 12px; padding: 16px; }
.sect-title { font-size: 15px; font-weight: 800; margin-bottom: 12px; }
.punch-row { display: flex; justify-content: space-between; }
.punch { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.punch-circle {
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid var(--line-strong); color: transparent;
  display: inline-flex; align-items: center; justify-content: center;
}
.punch-circle.on { background: var(--accent-fill); border-color: transparent; color: #17240a; box-shadow: 0 3px 12px rgba(140, 205, 70, 0.3); }
.punch i { font-style: normal; font-size: 11px; color: var(--faint); font-weight: 600; }
.hist-wrap + .hist-wrap { border-top: 1px solid var(--line); }
.hist-row { display: flex; align-items: center; gap: 10px; padding: 11px 0; }
.hist-open { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 0 12px; }
.hist-chip { font-size: 12px; padding: 4px 10px; }
.hist-check {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: var(--accent-fill); color: #17240a;
  display: inline-flex; align-items: center; justify-content: center;
}
.hist-date { font-size: 13px; font-weight: 800; flex-shrink: 0; }
.hist-names { font-size: 12.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hist-chip { text-decoration: none; }
.chart-row { display: flex; justify-content: space-around; align-items: flex-end; }
.chart-col { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.chart-n { font-size: 13px; font-weight: 800; color: var(--accent-deep); font-variant-numeric: tabular-nums; }
.chart-n.zero { color: var(--faint); }
.chart-bar { width: 34px; border-radius: 8px; background: rgba(127, 137, 152, 0.08); display: flex; align-items: flex-end; height: 84px; overflow: hidden; }
.chart-bar i { display: block; width: 100%; background: var(--accent-fill); border-radius: 8px; transition: height 0.4s; }
.chart-col em { font-style: normal; font-size: 11px; color: var(--faint); font-weight: 600; }
.hist-n { font-size: 14px; font-weight: 900; flex-shrink: 0; }
.pref-row {
  width: 100%; display: flex; align-items: center; gap: 11px;
  padding: 13px 0; background: transparent; border: none;
  color: var(--text); font-size: 14.5px; font-weight: 700; cursor: pointer;
}
.pref-row + .pref-row { border-top: 1px solid var(--line); }
.pref-ico {
  width: 30px; height: 30px; border-radius: 10px;
  background: var(--accent-soft); color: var(--accent-deep);
  display: inline-flex; align-items: center; justify-content: center;
}
.pref-val { font-size: 13px; color: var(--muted); font-weight: 600; }
.pref-open { padding: 2px 0 14px; }
.prefetch-btn {
  width: 100%; margin-top: 14px; padding: 15px; border: none; border-radius: 17px;
  font-size: 15px; font-weight: 800; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--accent-fill); color: #17240a;
  box-shadow: 0 6px 20px rgba(140, 205, 70, 0.35);
  transition: transform 0.12s;
}
.prefetch-btn:active { transform: scale(0.98); }
.prefetch-btn[disabled] { opacity: 0.7; }
.bar { height: 8px; border-radius: 5px; background: rgba(127, 137, 152, 0.12); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent-fill); border-radius: 5px; transition: width 0.2s; }
</style>

