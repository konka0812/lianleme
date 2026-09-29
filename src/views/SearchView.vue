<script setup>
import { ref, computed, watch } from 'vue'
import { settings } from '../stores/settings'
import { searchExercises } from '../data/catalog'
import ExerciseCard from '../components/ExerciseCard.vue'
import Icon from '../components/Icon.vue'

const KEY = 'lian-search-history'
const q = ref('')
const hot = ['卧推', '深蹲', '硬拉', '引体', '平板支撑', '臀桥', '哑铃', '弹力带', '拉伸']
const historyList = ref(JSON.parse(localStorage.getItem(KEY) || '[]'))

const results = computed(() => searchExercises(q.value, settings))

function remember(kw) {
  historyList.value = [kw, ...historyList.value.filter((x) => x !== kw)].slice(0, 10)
  localStorage.setItem(KEY, JSON.stringify(historyList.value))
}
function pick(kw) { q.value = kw; remember(kw) }
watch(q, (v) => { if (v.trim().length > 1) remember(v.trim()) })
function clearHistory() { historyList.value = []; localStorage.removeItem(KEY) }
</script>

<template>
  <div class="page page-top">
    <div class="search-wrap">
      <Icon name="search" :size="18" class="search-ico" />
      <input v-model="q" type="text" placeholder="搜索：中文 / 英文 / 部位 / 器材" />
      <button v-if="q" class="clear" @click="q = ''"><Icon name="close" :size="14" /></button>
    </div>

    <template v-if="!q">
      <template v-if="historyList.length">
        <div class="row" style="margin-top: 20px;">
          <h2 class="grow" style="margin: 0;">搜索历史</h2>
          <button class="icon-btn" style="width: 32px; height: 32px; border-radius: 10px;" @click="clearHistory"><Icon name="trash" :size="15" /></button>
        </div>
        <div class="chip-row" style="margin-top: 10px;">
          <button v-for="h in historyList" :key="h" class="chip" @click="pick(h)">{{ h }}</button>
        </div>
      </template>
      <h2>热门搜索</h2>
      <div class="chip-row">
        <button v-for="h in hot" :key="h" class="chip" @click="pick(h)">{{ h }}</button>
      </div>
    </template>

    <template v-else>
      <p class="muted" style="margin: 16px 0 12px;">「{{ q }}」· {{ results.length }} 个结果</p>
      <div class="list stagger">
        <ExerciseCard v-for="ex in results" :key="ex.slug" :ex="ex" />
        <div v-if="!results.length" class="empty">
          <div class="empty-ico"><Icon name="search" :size="24" /></div>
          <p class="muted">没有找到相关动作，换个词试试</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.search-wrap { position: relative; }
.search-ico { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--faint); }
.clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  width: 26px; height: 26px; border-radius: 50%; border: none;
  background: var(--card); border: 1px solid var(--line-strong); color: var(--muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.list { display: flex; flex-direction: column; gap: 10px; }
.empty { text-align: center; padding: 50px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.empty-ico { width: 58px; height: 58px; border-radius: 18px; background: var(--card); border: 1px solid var(--line); color: var(--muted); display: flex; align-items: center; justify-content: center; }
</style>
