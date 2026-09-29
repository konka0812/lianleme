import manifest from './manifest.json'
import { MUSCLE_ZH, EQUIPMENT_ZH, TYPE_ZH, EXERCISE_ZH } from './zh-map'

export { MUSCLE_ZH, EQUIPMENT_ZH, TYPE_ZH }

// 三级素材源：① 华为云OBS(主) ② 应用内置包(辅) ③ jsDelivr(兜底)
export const OBS_BASE = 'https://makerizon.obs.cn-north-4.myhuaweicloud.com/fitness-app/workout-guide'
export const assetUrl = (slug, n) => `${OBS_BASE}/assets/${slug}/frame-${n}.svg`
export const fallbackUrl = (slug, n) => `/wg/${slug}-${n}.svg`
export const fallbackUrl2 = (slug, n) => `https://cdn.jsdelivr.net/gh/bryllim/workout-guide@main/packages/workout-guide/assets/${slug}/frame-${n}.svg`


export const exercises = manifest.map((e) => ({
  ...e,
  zh: EXERCISE_ZH[e.slug] || e.name,
  equipZh: EQUIPMENT_ZH[e.equipment] || e.equipment,
  muscleZh: MUSCLE_ZH[e.primaryMuscle] || e.primaryMuscle,
  secondaryZh: e.secondaryMuscles.map((m) => MUSCLE_ZH[m] || m),
  typeZh: TYPE_ZH[e.exerciseType] || e.exerciseType,
}))

export const MUSCLE_GROUPS = [
  { id: 'chest', name: '胸部', char: '胸', slogan: '打造饱满胸肌线条', match: ['Chest'], color: '#ff7a70' },
  { id: 'shoulders', name: '肩部', char: '肩', slogan: '塑造宽阔肩膀', match: ['Shoulders', 'Rear Delts'], color: '#4dabf7' },
  { id: 'back', name: '背部', char: '背', slogan: '强化背部肌肉', match: ['Back', 'Lats', 'Upper Back', 'Lower Back'], color: '#b197fc' },
  { id: 'arms', name: '手臂', char: '臂', slogan: '雕刻紧实手臂', match: ['Biceps', 'Triceps', 'Forearms'], color: '#f5b940' },
  { id: 'core', name: '核心', char: '核', slogan: '提升核心稳定性', match: ['Core'], color: '#38d2c2' },
  { id: 'legs', name: '臀腿', char: '腿', slogan: '打造强壮下肢', match: ['Glutes', 'Quads', 'Hamstrings', 'Legs', 'Calves', 'Adductors', 'Hips', 'Posterior Chain'], color: '#e599f7' },
  { id: 'cardio', name: '有氧心肺', char: '氧', slogan: '提升心肺耐力', equipment: 'Cardio', color: '#3bc9db' },
  { id: 'stretch', name: '拉伸放松', char: '拉', slogan: '放松恢复更高效', stretch: true, color: '#94a3b2' },
]

export const HOME_EQUIPMENT = ['Bodyweight', 'Dumbbell', 'Resistance Band', 'Pull-up Bar', 'Chair', 'Wall', 'Towel', 'Doorway', 'Stability Ball']
export const ALL_EQUIPMENT = Object.keys(EQUIPMENT_ZH)

function pool(settings) {
  return exercises.filter((ex) => {
    if (settings.scene === 'home' && !HOME_EQUIPMENT.includes(ex.equipment)) return false
    if (settings.equipment.length && !settings.equipment.includes(ex.equipment)) return false
    return true
  })
}

export function poolFor(settings) {
  return pool(settings)
}

function matchGroup(ex, g) {
  if (g.stretch) return ex.isStretch
  if (g.equipment) return ex.equipment === g.equipment && !ex.isStretch
  if (ex.isStretch || (g.id === 'legs' && ex.equipment === 'Cardio')) return false
  return g.match.includes(ex.primaryMuscle)
}

export function byGroup(groupId, settings) {
  const g = MUSCLE_GROUPS.find((x) => x.id === groupId)
  return g ? pool(settings).filter((ex) => matchGroup(ex, g)) : []
}

export function getExercise(slug) {
  return exercises.find((e) => e.slug === slug) || null
}

export function searchExercises(q, settings) {
  const norm = (s) => s.toLowerCase()
  const tokens = norm(q.trim()).split(/\s+/).filter(Boolean)
  const p = pool(settings)
  if (!tokens.length) return p
  return p.filter((ex) => {
    const hay = norm([ex.zh, ex.name, ex.slug, ex.equipZh, ex.equipment, ex.muscleZh, ex.primaryMuscle, ...ex.secondaryZh, ...ex.secondaryMuscles, ex.typeZh].join(' '))
    return tokens.every((t) => hay.includes(t))
  })
}

export function allAssetUrls() {
  const urls = []
  for (const ex of exercises) for (const f of ex.frames) urls.push(assetUrl(ex.slug, f.index))
  return urls
}
