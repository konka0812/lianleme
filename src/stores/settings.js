import { reactive, watch } from 'vue'

const KEY = 'lian-settings-v1'
const defaults = { onboarded: false, scene: 'home', equipment: [], favorites: [], theme: 'light' }

function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...defaults } }
}

export const settings = reactive(load())

watch(settings, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

function applyTheme() {
  const t = settings.theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme
  document.documentElement.dataset.theme = t
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = t === 'dark' ? '#0a0c10' : '#f4f6f8'
}
applyTheme()
watch(() => settings.theme, applyTheme)

export function completeOnboarding(scene, equipment) {
  settings.scene = scene
  settings.equipment = equipment
  settings.onboarded = true
}

export function toggleFavorite(slug) {
  const i = settings.favorites.indexOf(slug)
  if (i >= 0) settings.favorites.splice(i, 1)
  else settings.favorites.push(slug)
}
