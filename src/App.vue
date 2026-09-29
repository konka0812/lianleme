<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { workout } from './stores/workout'
import { toast } from './stores/toast'
import Icon from './components/Icon.vue'

const route = useRoute()
const showTabs = computed(() => route.path !== '/onboarding')
const pending = computed(() => workout.list.filter((i) => !i.done).length)

const tabs = [
  { path: '/', label: '首页', icon: 'home' },
  { path: '/search', label: '搜索', icon: 'search' },
  { path: '/workout', label: '训练', icon: 'flame' },
  { path: '/me', label: '我的', icon: 'user' },
]
</script>

<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>

    <transition name="toast">
      <div v-if="toast.show" class="toast">
        <Icon name="check" :size="15" style="color: var(--accent);" />
        {{ toast.text }}
      </div>
    </transition>

    <nav v-if="showTabs" class="tabbar">
      <router-link v-for="t in tabs" :key="t.path" :to="t.path" class="tab" :class="{ on: t.path === '/' ? route.path === '/' : route.path.startsWith(t.path) }">
        <span class="tab-icon">
          <Icon :name="t.icon" :size="21" />
          <i v-if="t.path === '/workout' && pending" class="badge">{{ pending }}</i>
        </span>
        <span>{{ t.label }}</span>
      </router-link>
    </nav>
  </div>
</template>
