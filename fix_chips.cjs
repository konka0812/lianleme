const fs = require('fs');
let s = fs.readFileSync('src/style.css', 'utf8');
s = s.replace(
`.chip.on {`,
`.chip-row { display: flex; flex-wrap: wrap; margin: -5px; }
/* margin 兜底：兼容不支持 flex gap 的老内核 */
.chip-row > * { margin: 5px; }
.chip.on {`);
fs.writeFileSync('src/style.css', s, 'utf8');
console.log('chip-row added:', s.includes('.chip-row'));
