import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_paperplane_shorts'
IMG_DIR = os.path.join(BASE_DIR, 'images')
AUDIO_PATH = os.path.join(BASE_DIR, 'audio_shorts.mp3')
OUTPUT_VIDEO = os.path.join(BASE_DIR, 'paper_plane_shorts_1080x1920.mp4')

WIDTH, HEIGHT = 1080, 1920
FPS = 30
TOTAL_DURATION = 59.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
CROSSFADE_DUR = 1.5

FONT_PATH = r'C:\Windows\Fonts\HANBatangB.ttf'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\batang.ttc'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\malgunbd.ttf'

lyrics_main_font = ImageFont.truetype(FONT_PATH, 56)
lyrics_sub_font = ImageFont.truetype(FONT_PATH, 34)

scenes = [
    { 'idx': 0, 'start': 0.0, 'end': 15.0, 'img_path': os.path.join(IMG_DIR, 'shorts_scene_1.jpg'), 'motion': 'pan_up' },
    { 'idx': 1, 'start': 15.0, 'end': 28.0, 'img_path': os.path.join(IMG_DIR, 'shorts_scene_2.jpg'), 'motion': 'zoom_in' },
    { 'idx': 2, 'start': 28.0, 'end': 44.0, 'img_path': os.path.join(IMG_DIR, 'shorts_scene_3.jpg'), 'motion': 'pan_down' },
    { 'idx': 3, 'start': 44.0, 'end': 59.0, 'img_path': os.path.join(IMG_DIR, 'shorts_scene_4.jpg'), 'motion': 'zoom_in_grand' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]

# Relative timestamps for the 59s slice (Audio starts at 57.5s in original track)
lyrics_timeline = [
    # Chorus 1
    (1.00, 4.50, "날아가, 종이비행기야!", "하늘을 향해 힘차게 비상해"),
    (4.50, 7.80, "바람이 안 도와줘도", ""),
    (7.90, 12.00, "구겨진 마음도 끝내는 펼쳐져", ""),
    (12.10, 15.60, "날아가, 종이비행기야!", ""),
    (15.70, 18.80, "높이만이 답은 아냐", ""),
    (18.90, 25.00, "떨어진 자리에서 다시 보면 돼", ""),
    
    # Verse 2
    (25.70, 28.00, "친구의 눈물 한 방울에", ""),
    (28.00, 30.70, "세상은 갑자기 커지고", ""),
    (30.70, 33.70, "내가 못 가진 것보다", ""),
    (33.70, 36.70, "지켜야 할 게 더 많아져", ""),
    (36.70, 39.30, "어른들은 자꾸 말하지", ""),
    (39.30, 41.70, "참아야 큰다고", ""),
    (41.70, 44.30, "근데 가끔은 울고 나서", ""),
    (44.30, 47.10, "더 멀리 보는 법도 있어", ""),
    
    # Pre-Chorus 2 & Finale
    (47.10, 50.20, "조금 느려도 돼, 돌아가도 돼", ""),
    (50.30, 57.50, "부서진 마음도 길이 될 수 있어", "끝없이 펼쳐지는 푸른 하늘을 향해")
]

def make_master_sparkle(size=64):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    d2 = (x - cx)**2 + (y - cy)**2
    core = np.exp(-d2 / (2 * (size * 0.05)**2))
    glow = np.exp(-d2 / (2 * (size * 0.22)**2))
    im[:, :, 0] = np.clip(core * 255 + glow * 255, 0, 255)
    im[:, :, 1] = np.clip(core * 255 + glow * 225, 0, 255)
    im[:, :, 2] = np.clip(core * 220 + glow * 140, 0, 255)
    im[:, :, 3] = np.clip(core * 255 + glow * 180, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_sparkle = make_master_sparkle(64)

NUM_SPARKLES = 65
random.seed(8888)
sparkles_3d = []
for _ in range(NUM_SPARKLES):
    z = random.uniform(0.2, 1.4)
    sparkles_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-100, HEIGHT + 100),
        'z': z,
        'base_size': random.uniform(14, 34) * z,
        'speed_x': random.uniform(2.0, 5.0) * z,
        'speed_y': random.uniform(-3.5, -1.0) * z, # upward rising motion
        'pulse_speed': random.uniform(3.0, 6.0),
        'pulse_phase': random.uniform(0, math.pi * 2)
    })

# Vertical Vignette
vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for y in range(HEIGHT - 450, HEIGHT):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(180 * ((y - (HEIGHT - 450)) / 450.0)**1.5)))
for y in range(0, 180):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(80 * ((180 - y) / 180.0)**1.5)))

def smooth_step(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3.0 - 2.0 * x)

def render_scene_base(scene_idx, t_scene, dur_scene, extra_scale=1.0):
    sc = scenes[scene_idx]
    orig_img = loaded_images[scene_idx]
    orig_w, orig_h = orig_img.size
    p = max(0.0, min(1.0, t_scene / max(0.001, dur_scene)))
    p_eased = 0.5 - 0.5 * math.cos(p * math.pi)
    motion = sc['motion']
    
    if motion == 'pan_up': scale, cx, cy = 1.12 * extra_scale, orig_w * 0.5, orig_h * (0.60 - 0.15 * p_eased)
    elif motion == 'zoom_in': scale, cx, cy = (1.0 + 0.14 * p_eased) * extra_scale, orig_w * 0.5, orig_h * (0.50 - 0.05 * p_eased)
    elif motion == 'pan_down': scale, cx, cy = 1.12 * extra_scale, orig_w * 0.5, orig_h * (0.42 + 0.14 * p_eased)
    elif motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.18 * p_eased) * extra_scale, orig_w * 0.5, orig_h * (0.55 - 0.10 * p_eased)
    else: scale, cx, cy = 1.05 * extra_scale, orig_w * 0.5, orig_h * 0.5

    crop_w = orig_w / scale
    crop_h = orig_h / scale
    left = max(0, min(orig_w - crop_w, cx - crop_w / 2))
    top = max(0, min(orig_h - crop_h, cy - crop_h / 2))
    cropped = orig_img.crop((left, top, left + crop_w, top + crop_h))
    return cropped.resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC)

def get_current_scene_idx(t):
    for i, sc in enumerate(scenes):
        if sc['start'] <= t < sc['end']: return i
    return len(scenes) - 1

ffmpeg_cmd = [
    'ffmpeg', '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}', '-pix_fmt', 'rgb24', '-r', str(FPS),
    '-i', '-', '-i', AUDIO_PATH,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k',
    OUTPUT_VIDEO
]

print(f'Starting Paper Plane Vertical Shorts (Clean Top) Rendering: {TOTAL_FRAMES} frames ({TOTAL_DURATION:.2f}s)')
proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

try:
    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        sc_idx = get_current_scene_idx(t)
        sc = scenes[sc_idx]
        t_sc = t - sc['start']
        dur_sc = sc['end'] - sc['start']
        time_to_end = sc['end'] - t
        
        # Single-pass Clean Crossfade
        if time_to_end < CROSSFADE_DUR and sc_idx < len(scenes) - 1:
            raw_p = 1.0 - (time_to_end / CROSSFADE_DUR)
            fade_factor = smooth_step(raw_p)
            curr_img = render_scene_base(sc_idx, t_sc, dur_sc, extra_scale=1.0 + 0.03 * fade_factor)
            next_sc = scenes[sc_idx + 1]
            next_dur = next_sc['end'] - next_sc['start']
            next_img = render_scene_base(sc_idx + 1, (CROSSFADE_DUR - time_to_end), next_dur, extra_scale=0.98 + 0.02 * fade_factor)
            base_img = Image.blend(curr_img, next_img, fade_factor)
        else:
            base_img = render_scene_base(sc_idx, t_sc, dur_sc)

        # Head / Tail Black Fade
        if t < 0.8:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, smooth_step(t / 0.8))
        elif t > TOTAL_DURATION - 1.2:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, max(0.0, smooth_step((TOTAL_DURATION - t) / 1.2)))

        frame_rgba = base_img.convert('RGBA')
        frame_rgba.alpha_composite(vignette)
        
        overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Rising Particles
        for sp in sparkles_3d:
            sp['x'] = (sp['x'] + sp['speed_x']) % (WIDTH + 120)
            sp['y'] = (sp['y'] + sp['speed_y']) % (HEIGHT + 120)
            pulse = (math.sin(t * sp['pulse_speed'] + sp['pulse_phase']) + 1.0) * 0.5
            if pulse > 0.1:
                cur_sz = max(4, int(sp['base_size'] * (0.6 + 0.5 * pulse)))
                sp_sprite = master_sparkle.resize((cur_sz, cur_sz), Image.Resampling.BILINEAR)
                cur_alpha = int(240 * (pulse**1.2))
                if cur_alpha < 255:
                    arr = np.array(sp_sprite)
                    arr[:, :, 3] = (arr[:, :, 3].astype(np.float32) * (cur_alpha / 255.0)).astype(np.uint8)
                    sp_sprite = Image.fromarray(arr)
                overlay.paste(sp_sprite, (int(sp['x'] - cur_sz//2), int(sp['y'] - cur_sz//2)), sp_sprite)

        # Bottom Real-time Gold Progress Bar
        bar_p = min(1.0, max(0.0, t / TOTAL_DURATION))
        bar_w = int(WIDTH * bar_p)
        draw.rectangle([0, HEIGHT - 14, WIDTH, HEIGHT], fill=(0, 0, 0, 160))
        for x in range(bar_w):
            grad_r = int(251 - (x / float(WIDTH)) * 40)
            grad_g = int(191 + (x / float(WIDTH)) * 25)
            grad_b = int(36 + (x / float(WIDTH)) * 180)
            draw.line([(x, HEIGHT - 14), (x, HEIGHT)], fill=(grad_r, grad_g, grad_b, 255))

        # Shorts Subtitles (Large 56pt font, bottom centered at y=1620)
        for l_start, l_end, main_txt, sub_txt in lyrics_timeline:
            if l_start <= t <= l_end:
                dur, pos = l_end - l_start, t - l_start
                if pos < 0.05: fade_p = smooth_step(pos / 0.05)
                elif pos > dur - 0.06: fade_p = smooth_step(max(0.0, (dur - pos) / 0.06))
                else: fade_p = 1.0
                l_alpha = int(255 * fade_p)
                if l_alpha > 0 and main_txt:
                    tb = draw.textbbox((0, 0), main_txt, font=lyrics_main_font)
                    lx, ly = (WIDTH - (tb[2]-tb[0])) // 2, (1620 if not sub_txt else 1580)
                    
                    # Heavy Drop Shadow / Stroke for readability
                    for ox, oy in [(-3,-3), (3,3), (0,4), (4,0), (-4,0), (0,-4), (-2,2), (2,-2)]:
                        draw.text((lx + ox, ly + oy), main_txt, font=lyrics_main_font, fill=(0, 0, 0, int(l_alpha * 0.95)))
                    draw.text((lx, ly), main_txt, font=lyrics_main_font, fill=(255, 255, 255, l_alpha))
                    
                    if sub_txt:
                        s_tb = draw.textbbox((0, 0), sub_txt, font=lyrics_sub_font)
                        slx, sly = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ly + 68
                        for ox, oy in [(-2,-2), (2,2), (0,3), (3,0)]:
                            draw.text((slx + ox, sly + oy), sub_txt, font=lyrics_sub_font, fill=(0, 0, 0, int(l_alpha * 0.9)))
                        draw.text((slx, sly), sub_txt, font=lyrics_sub_font, fill=(251, 191, 36, int(l_alpha * 0.95)))
                break

        frame_rgba.alpha_composite(overlay)
        proc.stdin.write(frame_rgba.convert('RGB').tobytes())
        
        if frame_idx % 150 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:5.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 Paper Plane Shorts (Clean Top) Successfully Rendered!')
    
    target_backup = r'G:\내 드라이브\유튜브에올린음원\종이비행기_항해_리믹스4_쇼츠_1080x1920.mp4'
    shutil.copy2(OUTPUT_VIDEO, target_backup)
    print('Backed up to Google Drive successfully:', target_backup)

except Exception as e:
    print('Render error:', e)
    if proc: proc.kill()
