<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { settings } from '../stores/settings'
import { MUSCLE_GROUPS, byGroup, EQUIP_LABEL } from '../data/catalog'
import ExerciseCard from '../components/ExerciseCard.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const group = computed(() => MUSCLE_GROUPS.find((g) => g.id === route.params.id) || { name: '动作', color: 'var(--accent)' })
const base = computed(() => byGroup(route.params.id, settings))
const equipOptions = computed(() => [...new Set(base.value.map((e) => e.equipment))].map((k) => ({ k, zh: EQUIP_LABEL[k] || k })))
const selected = ref([])
watch(() => route.params.id, () => { selected.value = [] })
const list = computed(() => (selected.value.length ? base.value.filter((e) => selected.value.includes(e.equipment)) : base.value))
function toggle(k) {
  const i = selected.value.indexOf(k)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(k)
}
</script>

<template>
  <div class="page page-top">
    <div class="row">
      <router-link to="/" class="icon-btn"><Icon name="back" :size="19" /></router-link>
      <div class="grow">
        <div class="row" style="gap: 7px;">
          <i class="g-dot" :style="{ background: group.color }" />
          <h1 style="font-size: 21px;">{{ group.name }}</h1>
        </div>
      </div>
      <span class="count-pill">{{ list.length }} 个</span>
    </div>

    <div v-if="equipOptions.length > 1" class="chip-row" style="margin: 16px 0 4px;">
      <button v-for="o in equipOptions" :key="o.k" class="chip" :class="{ on: selected.includes(o.k) }" @click="toggle(o.k)">
        {{ o.zh }}
      </button>
    </div>

    <div class="list stagger" style="margin-top: 14px;">
      <ExerciseCard v-for="ex in list" :key="ex.slug" :ex="ex" />
      <div v-if="!list.length" class="empty">
        <div class="empty-ico"><Icon name="zap" :size="26" /></div>
        <p class="muted">当前器械设置下没有这个部位的动作</p>
        <button class="btn" @click="$router.push('/me')">去调整器械偏好</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.g-dot { width: 11px; height: 11px; border-radius: 4px; display: inline-block; }
.count-pill { font-size: 12px; font-weight: 800; color: var(--accent); background: rgba(200, 241, 105, 0.1); border: 1px solid rgba(200, 241, 105, 0.25); padding: 4px 11px; border-radius: 999px; }
.list { display: flex; flex-direction: column; gap: 10px; }
.empty { text-align: center; padding: 50px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.empty-ico { width: 58px; height: 58px; border-radius: 18px; background: var(--card); border: 1px solid var(--line); color: var(--accent); display: flex; align-items: center; justify-content: center; }
</style>
