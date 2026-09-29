import { reactive } from 'vue'

export const toast = reactive({ show: false, text: '' })
let timer = null

export function showToast(text) {
  toast.text = text
  toast.show = true
  clearTimeout(timer)
  timer = setTimeout(() => { toast.show = false }, 1600)
}

export function buzz(pattern = 15) {
  try { navigator.vibrate && navigator.vibrate(pattern) } catch (e) { /* noop */ }
}
