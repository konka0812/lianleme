# -*- coding: utf-8 -*-
import sys, re
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

def rw(path, fn):
    p = Path(path); c = p.read_text(encoding='utf-8'); c2 = fn(c)
    p.write_text(c2, encoding='utf-8')
    print('ok', path)

# 1. catalog 增加 EQUIP_LABEL / TYPE_ZH
def cat(c):
    return c + '''
export const EQUIP_LABEL = Object.fromEntries(manifest.map((e) => [e.equipment, e.equipZh]))
export const TYPE_ZH = {
  weight_reps: '重量 × 次数',
  bodyweight_reps: '自重 × 次数',
  duration: '计时',
  distance_duration: '距离 × 计时',
  assisted_bodyweight: '辅助自重',
}
'''
rw('src/data/catalog.js', cat)

# 2. ExerciseCard
def card(c):
    c = c.replace("import FramePlayer from './FramePlayer.vue'",
                  "import FramePlayer from './FramePlayer.vue'\nimport { gifUrl, gifFallback } from '../data/catalog'")
    c = c.replace('<FramePlayer :slug="ex.slug" class="ex-thumb" />',
                  '<FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" class="ex-thumb" />')
    return c
rw('src/components/ExerciseCard.vue', card)

# 3. Detail
def detail(c):
    c = c.replace("import { difficultyOf, DIFF_COLOR } from '../data/difficulty'",
                  "import { difficultyOf, DIFF_COLOR } from '../data/difficulty'\nimport { gifUrl, gifFallback, TYPE_ZH } from '../data/catalog'")
    c = c.replace('''<FramePlayer :slug="ex.slug" :speed="speed" :playing="playing" />''',
                  '''<FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" />''')
    # 删变速行
    c = re.sub(r'<div class="row" style="justify-content: center; margin: 14px 0 18px; gap: 12px;">[\s\S]*?</div>\n', '', c, count=1)
    # 播放状态徽章 -> 演示署名
    c = c.replace("""<span class="play-state">
      <Icon :name="playing ? 'pause' : 'play'" :size="13" />
      {{ playing ? '播放中' : '已暂停' }}
    </span>""", """<span class="play-state">演示动画 · © Gym visual</span>""")
    c = c.replace('{{ ex.typeZh }}', "{{ TYPE_ZH[ex.exerciseType] || ex.exerciseType }}")
    c = c.replace('线稿素材：Bryl Lim（CC BY-SA 4.0）· 源自 Everkinetic',
                  '动作演示 © Gym visual · 数据 exercises-dataset (MIT)')
    return c
rw('src/views/ExerciseDetailView.vue', detail)

# 4. Workout
def work(c):
    c = c.replace("import { getExercise } from '../data/catalog'",
                  "import { getExercise, gifUrl, gifFallback } from '../data/catalog'")
    c = c.replace('<FramePlayer :slug="current.slug" class="current-player" />',
                  '<FramePlayer :url="gifUrl(current.ex)" :fallback="gifFallback(current.ex)" class="current-player" />')
    return c
rw('src/views/WorkoutView.vue', work)

# 5. Generator
def gen(c):
    c = c.replace("import { MUSCLE_GROUPS, getExercise } from '../data/catalog'",
                  "import { MUSCLE_GROUPS, getExercise, gifUrl, gifFallback } from '../data/catalog'")
    c = c.replace('<FramePlayer :slug="ex.slug" style="width: 62px; height: 62px; flex-shrink: 0;" />',
                  '<FramePlayer :url="gifUrl(ex)" :fallback="gifFallback(ex)" style="width: 62px; height: 62px; flex-shrink: 0;" />')
    return c
rw('src/views/GeneratorView.vue', gen)

# 6. MuscleView：器材 chips 用内联 zh
def muscle(c):
    c = c.replace("import { MUSCLE_GROUPS, byGroup, EQUIPMENT_ZH } from '../data/catalog'",
                  "import { MUSCLE_GROUPS, byGroup, EQUIP_LABEL } from '../data/catalog'")
    c = c.replace("const equipOptions = computed(() => [...new Set(base.value.map((e) => e.equipment))])",
                  "const equipOptions = computed(() => [...new Set(base.value.map((e) => e.equipment))].map((k) => ({ k, zh: EQUIP_LABEL[k] || k })))")
    c = c.replace('<button v-for="k in equipOptions" :key="k" class="chip" :class="{ on: selected.includes(k) }" @click="toggle(k)">\n        {{ EQUIPMENT_ZH[k] }}\n      </button>',
                  '<button v-for="o in equipOptions" :key="o.k" class="chip" :class="{ on: selected.includes(o.k) }" @click="toggle(o.k)">\n        {{ o.zh }}\n      </button>')
    return c
rw('src/views/MuscleView.vue', muscle)

# 7. HomeView
def home(c):
    c = c.replace("import { MUSCLE_GROUPS, byGroup, poolFor, EQUIPMENT_ZH } from '../data/catalog'",
                  "import { MUSCLE_GROUPS, byGroup, poolFor, EQUIP_LABEL } from '../data/catalog'")
    c = c.replace("settings.equipment.map((k) => EQUIPMENT_ZH[k]).join(' · ')",
                  "settings.equipment.map((k) => EQUIP_LABEL[k] || k).join(' · ')")
    return c
rw('src/views/HomeView.vue', home)

# 8. ProfileView：器材chips + 文案 + 署名
def prof(c):
    c = c.replace("import { ALL_EQUIPMENT, EQUIPMENT_ZH, getExercise, allAssetUrls } from '../data/catalog'",
                  "import { ALL_EQUIPMENT, EQUIP_LABEL, getExercise, allAssetUrls } from '../data/catalog'")
    c = c.replace("{{ EQUIPMENT_ZH[k] }}", "{{ EQUIP_LABEL[k] || k }}")
    c = c.replace('预缓存全部动作图 · 离线可用', '预缓存全部动图 · 离线可用')
    c = c.replace('约 25MB · 建议Wi-Fi · 健身房断网也能用', '约 123MB · 强烈建议Wi-Fi · 健身房断网也能用')
    c = c.replace('预缓存全部 906 张动作图（约 18MB），完成后健身房断网也能用', '预缓存全部 1324 张动图（约 123MB），完成后健身房断网也能用')
    c = c.replace('练了么 v1.0 · 线稿素材 Bryl Lim（CC BY-SA 4.0）',
                  '练了么 v2.0 · 动作演示 © Gym visual · 数据 exercises-dataset (MIT)')
    c = c.replace('''        分步骤说明：exercises-dataset (MIT)''', '''        分步骤说明：exercises-dataset (MIT) · 动图：© Gym visual''')
    c = c.replace('数据：302 动作 / 906 帧 · 代码：MIT', '数据：1324 动作 / 1324 动图')
    return c
rw('src/views/ProfileView.vue', prof)

# 9. SearchView 无需改（走 searchExercises）
print('ALL VIEWS PATCHED')
