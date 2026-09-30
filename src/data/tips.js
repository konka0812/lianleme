// 要点库：自旧库迁移（新slug）+ 规则兜底
import { DB } from './tips-migrated'

export function getTips(ex) {
  if (!ex) return []
  const item = DB[ex.slug]
  if (item) return item.cues.slice(0, 4)
  const zh = ex.muscleZh || ex.primaryMuscle
  const tips = []
  if (/squat/i.test(ex.name)) tips.push('膝盖对准脚尖方向，下蹲至大腿平行，脚跟踩实')
  if (/deadlift/i.test(ex.name)) tips.push('背部平直，用髋部铰链发力')
  if (/row|pulldown|pull/i.test(ex.name)) tips.push('肩胛后收，用肘部带动，而非只用手臂')
  if (/press|push/i.test(ex.name)) tips.push('手肘约45°后移，不要水平外展90°')
  if (/curl/i.test(ex.name)) tips.push('大臂固定，只有前臂移动，顶峰挤压')
  if (/stretch/i.test(ex.name)) tips.push('拉到轻微紧绷即可，静态保持20~30秒不弹震')
  tips.push('发力时呼气、还原时吸气，全程不憋气')
  return tips.slice(0, 3)
}

export function getMistake(ex) {
  const item = ex && DB[ex.slug]
  return item ? item.mistake : null
}

export function repSuggestion(ex) {
  switch (ex.exerciseType) {
    case 'weight_reps': return '8~12 次 × 3~4 组'
    case 'bodyweight_reps': return '10~15 次 × 3~4 组'
    case 'assisted_bodyweight': return '8~10 次 × 3 组'
    case 'duration': return '30~45 秒 × 3 组'
    case 'distance_duration': return '15~30 分钟'
    default: return ''
  }
}
