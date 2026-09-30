const fs = require('fs');
// FramePlayer: GIF 底色主题感知（浅色白底 / 深色黑底）
let s = fs.readFileSync('src/style.css', 'utf8');
s = s.replace(
'.frame-player { display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 12px; }',
""".frame-player { display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 12px; }
:root[data-theme='dark'] .frame-player { background: #000; }""");
// 黑底GIF：浅色下screen溶解到白卡；深色下黑底自然融入，不需要screen
s = s.replace(
'.frame-player img.dark-bg { mix-blend-mode: screen; }',
":root[data-theme='light'] .frame-player img.dark-bg { mix-blend-mode: screen; }");
fs.writeFileSync('src/style.css', s, 'utf8');
console.log('theme-aware gif bg ok');
