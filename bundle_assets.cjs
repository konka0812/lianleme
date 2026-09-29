const fs = require('fs');

// 1. catalog.js: 素材改为同源打包路径 + 保留 jsDelivr 兜底函数
let c = fs.readFileSync('src/data/catalog.js', 'utf8');
c = c.replace(
`export const OBS_BASE = 'https://makerizon.obs.cn-north-4.myhuaweicloud.com/fitness-app/workout-guide'
export const assetUrl = (slug, n) => \`\${OBS_BASE}/assets/\${slug}/frame-\${n}.svg\``,
`// 素材已打包进应用（/wg-assets），不再依赖外部对象存储
export const assetUrl = (slug, n) => \`/wg-assets/assets/\${slug}/frame-\${n}.svg\`
// 兜底 CDN：jsDelivr 直连 workout-guide 仓库
export const fallbackUrl = (slug, n) => \`https://cdn.jsdelivr.net/gh/bryllim/workout-guide@main/packages/workout-guide/assets/\${slug}/frame-\${n}.svg\``);
fs.writeFileSync('src/data/catalog.js', c, 'utf8');
console.log('catalog ok:', c.includes('/wg-assets/assets/') && c.includes('fallbackUrl'));

// 2. FramePlayer: onerror 自动切兜底 CDN
let f = fs.readFileSync('src/components/FramePlayer.vue', 'utf8');
f = f.replace(
`import { assetUrl } from '../data/catalog'`,
`import { assetUrl, fallbackUrl } from '../data/catalog'`);
f = f.replace(
`const frame = computed(() => SEQ[idx.value % SEQ.length])`,
`const frame = computed(() => SEQ[idx.value % SEQ.length])
const failed = ref(false)
const src = computed(() => (failed.value ? fallbackUrl(props.slug, frame.value) : assetUrl(props.slug, frame.value)))
watch(frame, () => { failed.value = false })`);
f = f.replace(
`import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'`,
`import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'`);
f = f.replace(
`    <img :src="assetUrl(slug, frame)" :alt="slug" loading="lazy" draggable="false" />`,
`    <img :src="src" :alt="slug" loading="lazy" draggable="false" @error="failed = true" />`);
fs.writeFileSync('src/components/FramePlayer.vue', f, 'utf8');
console.log('FramePlayer fallback ok');

// 3. vite.config: SW 预缓存排除 wg-assets（24MB 不适合装进 precache），改用运行时缓存
let v = fs.readFileSync('vite.config.js', 'utf8');
v = v.replace(
`        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],`,
`        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        globIgnores: ['wg-assets/**'],`);
v = v.replace(
`        runtimeCaching: [
          {`,
`        runtimeCaching: [
          {
            urlPattern: /\\/wg-assets\\/.*\\.svg$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'workout-assets-bundled',
              expiration: { maxEntries: 1000, maxAgeSeconds: 365 * 24 * 3600 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {`);
fs.writeFileSync('vite.config.js', v, 'utf8');
console.log('vite.config ok');

// 4. ProfileView 预缓存说明微调（现在走同源）
let p = fs.readFileSync('src/views/ProfileView.vue', 'utf8');
p = p.replace('预缓存全部动作图 · 离线可用', '预缓存全部动作图 · 离线可用');
p = p.replace('约 18MB · 建议Wi-Fi环境 · 健身房断网也能用', '约 25MB · 建议Wi-Fi · 健身房断网也能用');
fs.writeFileSync('src/views/ProfileView.vue', p, 'utf8');
console.log('profile copy ok');
