import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_star_v2'
IMG_DIR = os.path.join(BASE_DIR, 'images')
AUDIO_PATH = os.path.join(BASE_DIR, 'master_audio.wav')
OUTPUT_VIDEO = os.path.join(BASE_DIR, 'star_v2_1080p_60fps_master.mp4')

WIDTH, HEIGHT = 1920, 1080
FPS = 60  # Ultra-Smooth 60 FPS
TOTAL_DURATION = 176.50  # Exact mastered duration
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
CROSSFADE_DUR = 1.6

FONT_PATH = r'C:\Windows\Fonts\HANBatangB.ttf'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\batang.ttc'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\malgunbd.ttf'

title_font = ImageFont.truetype(FONT_PATH, 78)
title_sub_font = ImageFont.truetype(FONT_PATH, 32)
lyrics_font = ImageFont.truetype(FONT_PATH, 48)
lyrics_sub_font = ImageFont.truetype(FONT_PATH, 28)

# 8 Lyric-Synced Scenes Timeline (0.0s ~ 176.5s)
scenes = [
    { 'idx': 0, 'start': 0.0, 'end': 28.0, 'img_path': os.path.join(IMG_DIR, 'scene_01.jpg'), 'motion': 'zoom_in_grand', 'name': '은하수와 별을 따는 손' },
    { 'idx': 1, 'start': 28.0, 'end': 53.0, 'img_path': os.path.join(IMG_DIR, 'scene_02.jpg'), 'motion': 'pan_right', 'name': '봄날 벚꽃 호숫가 벤치' },
    { 'idx': 2, 'start': 53.0, 'end': 74.0, 'img_path': os.path.join(IMG_DIR, 'scene_03.jpg'), 'motion': 'pan_left', 'name': '호숫가 다리 위 램프' },
    { 'idx': 3, 'start': 74.0, 'end': 95.0, 'img_path': os.path.join(IMG_DIR, 'scene_04.jpg'), 'motion': 'zoom_in_slow', 'name': '초승달 위의 별가루' },
    { 'idx': 4, 'start': 95.0, 'end': 125.0, 'img_path': os.path.join(IMG_DIR, 'scene_05.jpg'), 'motion': 'zoom_out', 'name': '반딧불이 숲속의 포옹' },
    { 'idx': 5, 'start': 125.0, 'end': 145.0, 'img_path': os.path.join(IMG_DIR, 'scene_06.jpg'), 'motion': 'pan_up_grand', 'name': '오로라 크리스탈 다리' },
    { 'idx': 6, 'start': 145.0, 'end': 164.0, 'img_path': os.path.join(IMG_DIR, 'scene_07.jpg'), 'motion': 'zoom_in_dramatic', 'name': '보름달 은하수 배와 별 선물' },
    { 'idx': 7, 'start': 164.0, 'end': 176.50, 'img_path': os.path.join(IMG_DIR, 'scene_08.jpg'), 'motion': 'zoom_in_grand', 'name': '일출 여명과 피날레' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]

# 0.05-second True-Sync Lyrics Timeline
lyrics_timeline = [
    # Intro Hook (18.9s)
    (18.90, 24.18, "하늘에서 별을 따다 하늘에서 달을 따다", ""),
    (24.18, 27.80, "두 손에 담아줄게요", ""),
    
    # Verse 1 (28.7s)
    (28.70, 33.62, "아름다운 그대 모습 바라보면 행복하죠", ""),
    (33.62, 38.90, "내 사랑", ""),
    (40.80, 45.40, "아름다운 날들이여 천천히 내게 와요", ""),
    (45.40, 52.00, "사라지지 말아요 내 품에 잠겨요", ""),
    
    # Pre-Chorus 1 (54.7s)
    (54.70, 59.80, "차가운 바람 끝에도 당신만은 따뜻해요", ""),
    (60.62, 66.92, "이름만 불러도 마음이 먼저 달려가요", ""),
    (66.92, 73.50, "어느 날 문득 돌아보면 내가 늘 여기 있을게요", ""),
    
    # Chorus 1 (74.7s)
    (74.74, 78.76, "아름다운 날들이여 천천히 내게 와요", ""),
    (79.54, 85.50, "눈물마저 맑게 웃음으로 바꿔요", ""),
    (86.78, 91.20, "하늘에서 별을 따다 하늘에서 달을 따다", ""),
    (91.58, 95.50, "마음에 담아올게요", ""),
    (96.34, 105.78, "아름다운 날들이여 사랑스런 눈동자여 내 사랑", ""),
    
    # Verse 2 & Bridge (117.7s)
    (117.72, 125.50, "아름다운 날들이여 사랑스런 눈동자여", ""),
    (126.38, 131.32, "멀리서 헤매던 날도 이제는 안아줄게요", ""),
    (131.32, 136.06, "어둠이 길을 막아도 당신 쪽으로 갈게요", ""),
    (136.06, 144.58, "한 번 더 불러줘요 내 이름을 불러줘요", ""),
    
    # Grand Climax & Finale (146.7s ~ 172.0s)
    (146.76, 151.20, "하늘에서 별을 따다 하늘에서 달을 따다", ""),
    (151.56, 155.80, "두 손에 담아줄게요", ""),
    (156.36, 163.50, "아름다운 그대 모습 나를 숨 쉬게 하죠", ""),
    (164.50, 172.50, "영원히...", "영원히 변치 않을 나의 사랑")
]

# 60fps Golden Sparkle & Cherry Blossom Petal Particle Systems
def make_master_sparkle(size=64):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    d2 = (x - cx)**2 + (y - cy)**2
    core = np.exp(-d2 / (2 * (size * 0.06)**2))
    glow = np.exp(-d2 / (2 * (size * 0.24)**2))
    im[:, :, 0] = np.clip(core * 255 + glow * 255, 0, 255)
    im[:, :, 1] = np.clip(core * 240 + glow * 220, 0, 255)
    im[:, :, 2] = np.clip(core * 180 + glow * 130, 0, 255)
    im[:, :, 3] = np.clip(core * 255 + glow * 200, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_sparkle = make_master_sparkle(64)

def make_master_petal(size=48):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    dx = (x - cx) * 0.8 + (y - cy) * 0.5
    dy = -(x - cx) * 0.5 + (y - cy) * 0.8
    d2 = (dx / (size * 0.18))**2 + (dy / (size * 0.35))**2
    mask = np.clip(1.0 - d2, 0.0, 1.0)
    im[:, :, 0] = np.clip(mask * 255, 0, 255)
    im[:, :, 1] = np.clip(mask * 185, 0, 255)
    im[:, :, 2] = np.clip(mask * 205, 0, 255)
    im[:, :, 3] = np.clip(mask * 220, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_petal = make_master_petal(48)

NUM_SPARKLES = 65
random.seed(4242)
sparkles_3d = []
for _ in range(NUM_SPARKLES):
    z = random.uniform(0.3, 1.3)
    sparkles_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-100, HEIGHT + 100),
        'z': z,
        'size': random.uniform(14, 38) * z,
        'speed_x': random.uniform(0.8, 2.5) * z * (30.0 / FPS),
        'speed_y': random.uniform(-1.8, -0.4) * z * (30.0 / FPS),
        'pulse_speed': random.uniform(2.0, 5.0),
        'pulse_phase': random.uniform(0, math.pi * 2)
    })

NUM_PETALS = 45
petals_3d = []
for _ in range(NUM_PETALS):
    z = random.uniform(0.3, 1.2)
    petals_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-100, HEIGHT + 100),
        'z': z,
        'size': random.uniform(16, 34) * z,
        'speed_x': random.uniform(1.2, 3.2) * z * (30.0 / FPS),
        'speed_y': random.uniform(0.6, 1.8) * z * (30.0 / FPS),
        'rot': random.uniform(0, 360),
        'rot_speed': random.uniform(-2.0, 2.0) * (30.0 / FPS),
        'wave_speed': random.uniform(1.5, 3.5),
        'wave_phase': random.uniform(0, math.pi * 2)
    })

# Cinematic Vignette
vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for y in range(HEIGHT - 280, HEIGHT):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(155 * ((y - (HEIGHT - 280)) / 280.0)**1.5)))
for y in range(0, 160):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(90 * ((160 - y) / 160.0)**1.5)))

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
    
    if motion == 'zoom_in': scale, cx, cy = (1.0 + 0.12 * p_eased) * extra_scale, orig_w * 0.5, orig_h * 0.5
    elif motion == 'zoom_in_slow': scale, cx, cy = (1.0 + 0.08 * p_eased) * extra_scale, orig_w * 0.5, orig_h * 0.5
    elif motion == 'pan_right': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.43 + 0.14 * p_eased), orig_h * 0.50
    elif motion == 'pan_left': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.57 - 0.14 * p_eased), orig_h * 0.52
    elif motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.16 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.52 - 0.04 * p_eased)
    elif motion == 'zoom_in_dramatic': scale, cx, cy = (1.0 + 0.15 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.48 + 0.04 * p_eased)
    elif motion == 'zoom_out': scale, cx, cy = (1.14 - 0.10 * p_eased) * extra_scale, orig_w * 0.50, orig_h * 0.50
    elif motion == 'pan_up_grand': scale, cx, cy = 1.14 * extra_scale, orig_w * 0.50, orig_h * (0.58 - 0.16 * p_eased)
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
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k',
    OUTPUT_VIDEO
]

print(f'Starting "별을 따다" 1080p 60FPS Master MV Rendering: {TOTAL_FRAMES} frames ({TOTAL_DURATION:.2f}s)')
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
            curr_img = render_scene_base(sc_idx, t_sc, dur_sc, extra_scale=1.0 + 0.02 * fade_factor)
            next_sc = scenes[sc_idx + 1]
            next_dur = next_sc['end'] - next_sc['start']
            next_img = render_scene_base(sc_idx + 1, (CROSSFADE_DUR - time_to_end), next_dur, extra_scale=0.98 + 0.02 * fade_factor)
            base_img = Image.blend(curr_img, next_img, fade_factor)
        else:
            base_img = render_scene_base(sc_idx, t_sc, dur_sc)

        # Head / Tail Black Fade
        if t < 1.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, smooth_step(t / 1.5))
        elif t > TOTAL_DURATION - 2.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, max(0.0, smooth_step((TOTAL_DURATION - t) / 2.5)))

        frame_rgba = base_img.convert('RGBA')
        frame_rgba.alpha_composite(vignette)
        overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # 60fps Floating Golden Sparkles (Cosmic Stars)
        for sp in sparkles_3d:
            sp['x'] = (sp['x'] + sp['speed_x']) % (WIDTH + 100)
            sp['y'] = (sp['y'] + sp['speed_y']) % (HEIGHT + 100)
            pulse = 0.6 + 0.4 * math.sin(t * sp['pulse_speed'] + sp['pulse_phase'])
            cur_sz = max(8, int(sp['size'] * pulse))
            s_sprite = master_sparkle.resize((cur_sz, cur_sz), Image.Resampling.BILINEAR)
            overlay.paste(s_sprite, (int(sp['x']), int(sp['y'])), s_sprite)

        # 60fps Fluttering Blossom Petals
        for pt in petals_3d:
            pt['x'] = (pt['x'] + pt['speed_x']) % (WIDTH + 100)
            pt['y'] = (pt['y'] + pt['speed_y'] + math.sin(t * pt['wave_speed'] + pt['wave_phase']) * 0.6) % (HEIGHT + 100)
            pt['rot'] += pt['rot_speed']
            cur_sz = int(pt['size'])
            p_sprite = master_petal.resize((cur_sz, cur_sz), Image.Resampling.BILINEAR).rotate(pt['rot'], expand=False)
            overlay.paste(p_sprite, (int(pt['x']), int(pt['y'])), p_sprite)

        # Title Card (0.8s ~ 17.5s: Intro Hook Prelude)
        if 0.8 <= t <= 17.5:
            t_rel = t - 0.8
            t_alpha = int(255 * smooth_step(t_rel / 1.5)) if t_rel < 1.5 else (int(255 * smooth_step(max(0.0, (16.7 - t_rel) / 1.8))) if t_rel > 14.9 else 255)
            if t_alpha > 0:
                t_text = "별  을    따  다"
                st_text = "Celestial Romance Ballad  •  60 FPS Ultra-Master Ver."
                tb = draw.textbbox((0, 0), t_text, font=title_font)
                tx, ty = (WIDTH - (tb[2]-tb[0])) // 2, 440
                s_tb = draw.textbbox((0, 0), st_text, font=title_sub_font)
                sx, sy = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ty + (tb[3]-tb[1]) + 35
                draw.text((tx + 2, ty + 2), t_text, font=title_font, fill=(0, 0, 0, int(t_alpha * 0.85)))
                draw.text((tx, ty), t_text, font=title_font, fill=(255, 255, 255, t_alpha))
                draw.text((sx + 1, sy + 1), st_text, font=title_sub_font, fill=(0, 0, 0, int(t_alpha * 0.75)))
                draw.text((sx, sy), st_text, font=title_sub_font, fill=(254, 240, 138, int(t_alpha * 0.95)))

        # Instant Subtitle Display
        for l_start, l_end, main_txt, sub_txt in lyrics_timeline:
            if l_start <= t <= l_end:
                dur, pos = l_end - l_start, t - l_start
                if pos < 0.05: fade_p = smooth_step(pos / 0.05)
                elif pos > dur - 0.06: fade_p = smooth_step(max(0.0, (dur - pos) / 0.06))
                else: fade_p = 1.0
                l_alpha = int(255 * fade_p)
                if l_alpha > 0 and main_txt:
                    tb = draw.textbbox((0, 0), main_txt, font=lyrics_font)
                    lx, ly = (WIDTH - (tb[2]-tb[0])) // 2, (940 if not sub_txt else 915)
                    for ox, oy in [(-2,-2), (2,2), (0,3), (3,0), (-3,0), (0,-3)]:
                        draw.text((lx + ox, ly + oy), main_txt, font=lyrics_font, fill=(0, 0, 0, int(l_alpha * 0.9)))
                    draw.text((lx, ly), main_txt, font=lyrics_font, fill=(255, 255, 255, l_alpha))
                    if sub_txt:
                        s_tb = draw.textbbox((0, 0), sub_txt, font=lyrics_sub_font)
                        slx, sly = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ly + 48
                        for ox, oy in [(-1,-1), (1,1), (0,2)]:
                            draw.text((slx + ox, sly + oy), sub_txt, font=lyrics_sub_font, fill=(0, 0, 0, int(l_alpha * 0.8)))
                        draw.text((slx, sly), sub_txt, font=lyrics_sub_font, fill=(254, 240, 138, int(l_alpha * 0.95)))
                break

        frame_rgba.alpha_composite(overlay)
        proc.stdin.write(frame_rgba.convert('RGB').tobytes())
        
        if frame_idx % 600 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:6.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 "별을 따다" 1080p 60FPS Master MV Successfully Rendered!')
    
    # Backup to Google Drive
    target_backup_dir = r'G:\내 드라이브\유튜브에올린음원'
    if os.path.exists(target_backup_dir):
        target_backup = os.path.join(target_backup_dir, '별을따다_시네마틱_뮤직비디오_60fps_1080p.mp4')
        shutil.copy2(OUTPUT_VIDEO, target_backup)
        print('Backed up to Google Drive successfully:', target_backup)

except Exception as e:
    print('Render error:', e)
    if proc: proc.kill()
