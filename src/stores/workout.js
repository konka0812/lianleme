import { reactive, watch } from 'vue'

const KEY = 'lian-workout-v1'

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { list: Array.isArray(v.list) ? v.list : [], timer: { duration: 60, endsAt: 0, running: false } }
  } catch { return { list: [], timer: { duration: 60, endsAt: 0, running: false } } }
}

export const workout = reactive(load())

watch(() => workout.list, (v) => localStorage.setItem(KEY, JSON.stringify({ list: v })), { deep: true })

export function addExercise(slug) {
  if (!workout.list.find((i) => i.slug === slug)) workout.list.push({ slug, sets: '', done: false })
}
export function removeExercise(slug) {
  const i = workout.list.findIndex((i) => i.slug === slug)
  if (i >= 0) workout.list.splice(i, 1)
}
export function toggleDone(slug) {
  const item = workout.list.find((i) => i.slug === slug)
  if (item) item.done = !item.done
}
export function moveExercise(slug, dir) {
  const i = workout.list.findIndex((i) => i.slug === slug)
  const j = i + dir
  if (i < 0 || j < 0 || j >= workout.list.length) return
  const [it] = workout.list.splice(i, 1)
  workout.list.splice(j, 0, it)
}
export function clearWorkout() { workout.list.splice(0) }
export function startRest(seconds) {
  workout.timer = { duration: seconds, endsAt: Date.now() + seconds * 1000, running: true }
}
export function stopRest() { workout.timer.running = false }
