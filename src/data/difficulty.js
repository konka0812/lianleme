// 动作难度分级：高阶技能 > 新手友好（器械/绳索/弹力带/计时/拉伸/基础自重）> 其余进阶
const ADV = /pistol|handstand|dragon-flag|copenhagen|muscle|planche|l-sit|hindu|archer|typewriter|explosive-push|commando|shrimp|sissy|skater-squat|nordic|deficit|hang-clean|front-squat|glass|weight(ed)?-pull|weighted-dip/i

export function difficultyOf(ex) {
  if (!ex) return '进阶'
  if (ADV.test(ex.name)) return '高阶'
  if (ex.isStretch || ex.equipment === 'Machine' || ex.equipment === 'Cable' || ex.equipment === 'Resistance Band' || ex.exerciseType === 'duration') return '新手'
  if (/plank|crunch|bridge|curl|raise|pushdown|push-down|extension|fly|walk|swing|tuck|tap|jack|mountain|burpee|rope/i.test(ex.name)) return '新手'
  return '进阶'
}

export const DIFF_COLOR = { '新手': 'var(--teal)', '进阶': 'var(--accent-deep)', '高阶': '#d97706' }

