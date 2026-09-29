import { reactive, watch } from 'vue'

const KEY = 'lian-history-v1'

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { records: Array.isArray(v.records) ? v.records : [] }
  } catch { return { records: [] } }
}

export const history = reactive(load())

watch(history, (v) => localStorage.setItem(KEY, JSON.stringify({ records: v.records })), { deep: true })

const dayKey = (ts = Date.now()) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function saveRecord(items) {
  const done = items.filter((i) => i.done)
  if (!done.length) return false
  history.records.unshift({
    id: `r${Date.now()}`,
    date: dayKey(),
    ts: Date.now(),
    total: done.length,
    exercises: done.map((i) => i.slug),
  })
  return true
}

export function weekStats() {
  const now = Date.now()
  const week = history.records.filter((r) => now - r.ts < 7 * 864e5)
  const days = new Set(week.map((r) => r.date))
  const totalMoves = week.reduce((s, r) => s + r.total, 0)
  return { sessions: days.size, totalMoves, allTime: history.records.length }
}

export function last7Days() {
  const out = []
  for (let i = 6; i >= 0; i--) {
    const ts = Date.now() - i * 864e5
    out.push({ key: dayKey(ts), label: '一二三四五六日'[new Date(ts).getDay()], date: new Date(ts).getDate(), active: history.records.some((r) => r.date === dayKey(ts)) })
  }
  return out
}

export function last4Weeks() {
  const out = []
  for (let i = 3; i >= 0; i--) {
    const start = Date.now() - (i * 7 + 6) * 864e5
    const end = Date.now() - i * 7 * 864e5
    const n = history.records.filter((r) => r.ts >= start && r.ts <= end).reduce((s, r) => s + r.total, 0)
    out.push({ label: i === 0 ? '本周' : i + '周前', n })
  }
  return out
}
