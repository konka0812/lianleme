# -*- coding: utf-8 -*-
from pathlib import Path
p = Path('src/views/ExerciseDetailView.vue')
lines = p.read_text(encoding='utf-8').split('\n')
out = [l for l in lines if '450:' not in l]
p.write_text('\n'.join(out), encoding='utf-8')
print('chips line removed:', '450:' not in '\n'.join(out))
