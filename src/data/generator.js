import { byGroup, getExercise, MUSCLE_GROUPS } from './catalog'
import { difficultyOf } from './difficulty'

const COMPOUND_RE = /(squat|deadlift|press|row|pull-up|chin-up|bench|lunge|thrust|dip|swing|clean|push-up|bridge|pulldown|carry|burpee)/i

const DURATION_MAP = { 20: 4, 30: 6, 45: 8, 60: 10 }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generatePlan({ groups, minutes, settings, level }) {
  const target = DURATION_MAP[minutes] || 6
  const poolByGroup = groups.map((gid) => byGroup(gid, settings))
  const union = []
  const seen = new Set()
  poolByGroup.forEach((pool, gi) => {
    pool.forEach((ex) => {
      if (!seen.has(ex.slug)) {
        seen.add(ex.slug)
        union.push({ ...ex, _g: gi })
      }
    })
  })
  const filtered = level ? union.filter((e) => difficultyOf(e) === level) : union
  const pool = filtered.length >= 3 ? filtered : union
  if (!pool.length) return []

  const compounds = shuffle(pool.filter((e) => COMPOUND_RE.test(e.slug)))
  const others = shuffle(pool.filter((e) => !COMPOUND_RE.test(e.slug)))

  // 轮转各部位，主项优先
  const picked = []
  const usedGroups = new Map()
  const pick = (list) => {
    let bestIdx = -1
    let bestCount = Infinity
    list.forEach((ex, i) => {
      const c = usedGroups.get(ex._g) || 0
      if (c < bestCount) { bestCount = c; bestIdx = i }
    })
    if (bestIdx < 0) return null
    const [ex] = list.splice(bestIdx, 1)
    usedGroups.set(ex._g, (usedGroups.get(ex._g) || 0) + 1)
    return ex
  }
  const nCompound = Math.ceil(target * 0.6)
  for (let i = 0; i < nCompound; i++) {
    const ex = pick(compounds) || pick(others)
    if (ex) picked.push(ex)
  }
  for (let i = picked.length; i < target; i++) {
    const ex = pick(others) || pick(compounds)
    if (ex) picked.push(ex)
  }

  // 收尾：核心 + 拉伸
  const wantCore = !groups.includes('core')
  const wantStretch = !groups.includes('stretch')
  if (wantCore) {
    const core = shuffle(byGroup('core', settings))[0]
    if (core) picked.push(core)
  }
  if (wantStretch && minutes >= 30) {
    const st = shuffle(byGroup('stretch', settings))[0]
    if (st) picked.push(st)
  }
  return picked.map((p) => getExercise(p.slug)).filter(Boolean)
}

