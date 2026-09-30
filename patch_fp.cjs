const fs = require('fs');
let c = fs.readFileSync('src/components/FramePlayer.vue', 'utf8');
const oldRef = 'const el = ref(null)\nconst visible = ref(false)\nconst tier = ref(0)';
const newRef = 'const el = ref(null)\nconst visible = ref(false)\nconst tier = ref(0)\nconst darkBg = ref(false)\n\nfunction onLoad(e) {\n  try {\n    const img = e.target\n    if (!img.naturalWidth) return\n    const cv = document.createElement("canvas")\n    const s = 24\n    cv.width = s; cv.height = s\n    const cx = cv.getContext("2d")\n    cx.drawImage(img, 0, 0, s, s)\n    const d = cx.getImageData(0, 0, s, s).data\n    let sum = 0, n = 0\n    for (let i = 0; i < d.length; i += 4) {\n      const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]\n      sum += lum; n++\n    }\n    darkBg.value = sum / n < 70\n  } catch (err) { /* skip */ }\n}';
if (!c.includes('darkBg')) {
  c = c.replace(oldRef, newRef);
  c = c.replace('draggable="false" @error="tier = 1" />', 'draggable="false" @error="tier = 1" @load="onLoad" />');
  fs.writeFileSync('src/components/FramePlayer.vue', c, 'utf8');
}
console.log('FP darkBg:', c.includes('darkBg'), '| onLoad:', c.includes('onLoad'));

let s = fs.readFileSync('src/style.css', 'utf8');
if (!s.includes('dark-bg')) {
  s = s.replace('.frame-player img { width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }',
    '.frame-player img { width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }\n.frame-player img.dark-bg { mix-blend-mode: screen; }');
  fs.writeFileSync('src/style.css', s, 'utf8');
}
console.log('style dark-bg:', s.includes('dark-bg'));
