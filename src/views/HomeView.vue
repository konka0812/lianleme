<script setup>
import { computed } from 'vue'
import { settings } from '../stores/settings'
import { workout } from '../stores/workout'
import { weekStats, last7Days } from '../stores/history'
import { MUSCLE_GROUPS, byGroup, poolFor, EQUIPMENT_ZH } from '../data/catalog'
import Icon from '../components/Icon.vue'

const groupArt = import.meta.glob(`../assets/groups/group-*.png`, { eager: true, import: 'default' })
const artFor = (id) => groupArt[`../assets/groups/group-${id}.png`] || null

const hour = new Date().getHours()
const greeting = hour < 5 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
const dateStr = `${new Date().getMonth() + 1}月${new Date().getDate()}日 星期${'日一二三四五六'[new Date().getDay()]}`

const sceneLabel = { home: '在家', gym: '健身房', all: '全部' }
const groups = computed(() => MUSCLE_GROUPS.map((g) => ({ ...g, count: byGroup(g.id, settings).length })))
const total = computed(() => poolFor(settings).length)
const pending = computed(() => workout.list.filter((i) => !i.done).length)
const week = computed(() => weekStats())
const days = last7Days()
const equipSummary = computed(() => {
  if (settings.scene !== 'home' || !settings.equipment.length) return '全部器械可用'
  return settings.equipment.map((k) => EQUIPMENT_ZH[k]).join(' · ')
})
</script>

<template>
  <div class="page page-top">
    <div class="row">
      <div class="grow">
        <h1 style="margin-top: 2px; font-size: 30px;">练了么</h1>
      </div>
      <div class="seg">
        <button v-for="(label, key) in sceneLabel" :key="key" class="scene-seg" :class="{ on: settings.scene === key }" @click="settings.scene = key">
          {{ label }}
        </button>
      </div>
    </div>

    <div class="hero card pressable" @click="$router.push('/generator')">
      <div class="hero-ico"><Icon name="zap" :size="22" /></div>
      <div class="grow">
        <div class="hero-title">智能配计划</div>
        <div class="hero-sub">根据你的目标和状态，定制专属训练计划</div>
      </div>
      <span class="hero-arrow"><Icon name="chevron" :size="16" /></span>
    </div>

    <div class="week-card card">
      <div class="row" style="padding: 14px 16px 0;">
        <b class="grow" style="font-size: 15px;">本周训练</b>
        <span class="muted" style="font-size: 12.5px;">{{ week.sessions }}/7 天已完成</span>
        <Icon name="chevron" :size="14" style="color: var(--faint);" />
      </div>
      <div class="week-dots">
        <div v-for="d in days" :key="d.key" class="day" :class="{ on: d.active }">
          <i>{{ d.label }}</i>
          <em>{{ d.date }}</em>
        </div>
      </div>
    </div>

    <h2>今天练哪儿？</h2>
    <div class="group-grid stagger">
      <router-link v-for="g in groups" :key="g.id" :to="g.count ? `/m/${g.id}` : '#'" class="g-card card" :class="{ locked: !g.count }">
        <div class="g-top">
          <span class="g-ico" :style="{ background: g.color }">{{ g.char }}</span>
          <span class="g-count"><b>{{ g.count }}</b><i>个动作</i></span>
        </div>
        <div class="g-name">{{ g.name }}</div>
        <div class="g-slogan">{{ g.slogan }}</div>
        <img v-if="artFor(g.id)" :src="artFor(g.id)" class="g-art" alt="" />
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.seg { display: flex; gap: 0; background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 3px; box-shadow: var(--shadow-1); }
.scene-seg {
  border: none; background: transparent; color: var(--muted);
  font-size: 12px; padding: 7px 12px; border-radius: 999px; cursor: pointer; font-weight: 700;
  transition: all 0.15s;
}
.scene-seg.on { background: var(--accent-fill); color: #17240a; box-shadow: 0 2px 10px rgba(140, 205, 70, 0.3); }
.hero {
  margin-top: 16px; padding: 18px; position: relative; overflow: hidden;
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(120deg, #d8f2a0 0%, #b9e87e 55%, #a5e064 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(140, 205, 70, 0.3);
}
.hero-ico {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  background: #17240a; color: var(--accent);
  display: inline-flex; align-items: center; justify-content: center;
}
.hero-title { font-weight: 900; font-size: 17px; color: #1c2a0c; }
.hero-sub { font-size: 12.5px; color: rgba(28, 42, 12, 0.72); }
.hero-arrow {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.55); color: #17240a;
  display: inline-flex; align-items: center; justify-content: center;
}
.week-card { margin-top: 10px; padding-bottom: 14px; }
.week-dots { display: flex; justify-content: space-between; padding: 12px 16px 0; }
.day {
  width: 40px; height: 46px; border-radius: 14px;
  background: rgba(127, 137, 152, 0.07);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
}
.day i { font-style: normal; font-size: 10.5px; color: var(--faint); font-weight: 700; }
.day em { font-style: normal; font-size: 13px; font-weight: 800; color: var(--muted); }
.day.on { background: var(--accent-fill); box-shadow: 0 4px 14px rgba(140, 205, 70, 0.35); }
.day.on i, .day.on em { color: #17240a; }
.group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.g-card {
  padding: 16px; text-decoration: none; color: var(--text); position: relative;
  overflow: hidden; display: flex; flex-direction: column; min-height: 138px;
}
.g-card::before {
  content: ''; position: absolute; right: -26px; bottom: -26px;
  width: 110px; height: 110px; border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--gc) 16%, transparent), transparent 70%);
}
.g-card:active { transform: scale(0.97); }
.g-card.locked { opacity: 0.55; }
.g-top { display: flex; justify-content: space-between; align-items: flex-start; }
.g-ico {
  width: 38px; height: 38px; border-radius: 12px;
  color: #fff; font-size: 16px; font-weight: 900;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--gc) 40%, transparent);
}
.g-count { display: flex; align-items: baseline; gap: 2px; }
.g-count b { font-size: 17px; font-weight: 900; }
.g-count i { font-style: normal; font-size: 11px; color: var(--faint); }
.g-name { font-size: 18px; font-weight: 900; margin-top: 12px; }
.g-slogan { font-size: 11.5px; color: var(--faint); margin-top: 2px; padding-right: 52px; }
:root[data-theme='dark'] .g-art { background: #fff; border-radius: 12px; }
.g-art {
  position: absolute; right: 6px; bottom: 6px;
  width: 66px; height: 88px; object-fit: contain;
  pointer-events: none;
}
</style>

