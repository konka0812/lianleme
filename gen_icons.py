# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
from pathlib import Path

def make_icon(size, out, maskable=False):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # dark rounded square
    d.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill=(14, 16, 19, 255))
    # lime dumbbell, centered; maskable needs 20% safe zone
    pad = 0.30 if maskable else 0.24
    cy = size / 2
    bar_h = size * 0.075
    bar_w = size * (1 - 2 * pad - 0.10)
    x0 = size * (pad + 0.05)
    d.rounded_rectangle([x0, cy - bar_h / 2, x0 + bar_w, cy + bar_h / 2], radius=bar_h / 2, fill=(198, 242, 78, 255))
    plate_w = size * 0.075
    plate_h = size * 0.34
    inner = size * 0.035
    for sx in (x0 + inner, x0 + bar_w - plate_w - inner):
        d.rounded_rectangle([sx, cy - plate_h / 2, sx + plate_w, cy + plate_h / 2], radius=plate_w / 2.2, fill=(198, 242, 78, 255))
        d.rounded_rectangle([sx + plate_w * 0.28, cy - plate_h * 0.36, sx + plate_w * 0.28 + plate_w * 0.72, cy + plate_h * 0.36], radius=plate_w / 2.8, fill=(14, 16, 19, 255))
        d.rounded_rectangle([sx + plate_w * 0.42, cy - plate_h * 0.36, sx + plate_w * 0.42 + plate_w * 0.72, cy + plate_h * 0.36], radius=plate_w / 2.8, fill=(198, 242, 78, 255))
    im.save(out)
    print('saved', out, im.size)

out = Path('public')
make_icon(512, out / 'icon-512.png')
make_icon(192, out / 'icon-192.png')
make_icon(512, out / 'icon-maskable-512.png', maskable=True)
