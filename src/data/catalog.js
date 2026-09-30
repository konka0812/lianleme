import manifest from './manifest.json'

// 三级素材源：① 华为云OBS(主) ② jsDelivr GH(兜底)
export const OBS_BASE = 'https://makerizon.obs.cn-north-4.myhuaweicloud.com/fitness-app/wg2'
export const gifUrl = (ex) => `${OBS_BASE}/${ex.gif}`
export const gifFallback = (ex) => `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/${ex.gif}`

export const exercises = manifest

export const MUSCLE_GROUPS = [
{ id: 'chest', name: '胸部', char: '胸', match: ['chest'], color: '#ff7a70' },
{ id: 'shoulders', name: '肩部', char: '肩', match: ['shoulders', 'neck'], color: '#4dabf7' },
{ id: 'back', name: '背部', char: '背', match: ['back'], color: '#b197fc' },
{ id: 'arms', name: '手臂', char: '臂', match: ['upper arms', 'lower arms'], color: '#f5b940' },
{ id: 'core', name: '核心', char: '核', match: ['waist'], color: '#38d2c2' },
{ id: 'legs', name: '臀腿', char: '腿', match: ['upper legs', 'lower legs'], color: '#e599f7' },
{ id: 'cardio', name: '有氧心肺', char: '氧', match: ['cardio'], color: '#3bc9db' },
{ id: 'stretch', name: '拉伸放松', char: '伸', stretch: true, color: '#94a3b2' },
]

export const HOME_EQUIPMENT = ['body weight', 'dumbbell', 'band', 'resistance band', 'kettlebell', 'stability ball', 'ez barbell', 'rope', 'roller', 'wheel roller', 'bosu ball', 'medicine ball', 'stationary bike']
export const ALL_EQUIPMENT = [...new Set(manifest.map((e) => e.equipment))].filter(Boolean)

function pool(settings) {
  return exercises.filter((ex) => {
    if (settings.scene === 'home' && !HOME_EQUIPMENT.includes(ex.equipment)) return false
    if (settings.equipment.length && !settings.equipment.includes(ex.equipment)) return false
    return true
  })
}

function matchGroup(ex, g) {
  if (g.stretch) return ex.isStretch
  return g.match.includes(ex.category) && !ex.isStretch
}

export function poolFor(settings) {
  return pool(settings)
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
    const hay = norm([ex.zh, ex.name, ex.slug, ex.equipZh, ex.equipment, ex.muscleZh, ex.primaryMuscle, ...ex.secondaryZh, ...ex.secondaryMuscles, ex.categoryZh].join(' '))
    return tokens.every((t) => hay.includes(t))
  })
}

export function allAssetUrls() {
  return exercises.map((e) => gifUrl(e)).filter(Boolean)
}

export const EQUIP_LABEL = Object.fromEntries(manifest.map((e) => [e.equipment, e.equipZh]))
export const TYPE_ZH = {
  weight_reps: '重量 × 次数',
  bodyweight_reps: '自重 × 次数',
  duration: '计时',
  distance_duration: '距离 × 计时',
  assisted_bodyweight: '辅助自重',
}
