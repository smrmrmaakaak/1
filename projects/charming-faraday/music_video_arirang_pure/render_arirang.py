import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_arirang_pure'
IMG_DIR = os.path.join(BASE_DIR, 'images')
AUDIO_PATH = os.path.join(BASE_DIR, 'audio.wav')
OUTPUT_VIDEO = os.path.join(BASE_DIR, 'arirang_pure_heart_1080p_mv.mp4')
OUTRO_PATH = os.path.join(BASE_DIR, 'outro.jpg')

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_DURATION = 209.84  # Exact duration of Arirang
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
CROSSFADE_DUR = 1.8

FONT_PATH = r'C:\Windows\Fonts\HANBatangB.ttf'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\batang.ttc'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\malgunbd.ttf'

title_font = ImageFont.truetype(FONT_PATH, 72)
title_sub_font = ImageFont.truetype(FONT_PATH, 30)
lyrics_font = ImageFont.truetype(FONT_PATH, 48)
lyrics_sub_font = ImageFont.truetype(FONT_PATH, 28)

scenes = [
    { 'idx': 0, 'start': 0.0, 'end': 35.0, 'img_path': os.path.join(IMG_DIR, 'scene_1.jpg'), 'motion': 'zoom_in', 'theme': 'dawn' },
    { 'idx': 1, 'start': 35.0, 'end': 54.0, 'img_path': os.path.join(IMG_DIR, 'scene_2.jpg'), 'motion': 'pan_right', 'theme': 'nature' },
    { 'idx': 2, 'start': 54.0, 'end': 89.0, 'img_path': os.path.join(IMG_DIR, 'scene_3.jpg'), 'motion': 'zoom_in_grand', 'theme': 'dragon' },
    { 'idx': 3, 'start': 89.0, 'end': 151.0, 'img_path': os.path.join(IMG_DIR, 'scene_4.jpg'), 'motion': 'pan_left', 'theme': 'palace' },
    { 'idx': 4, 'start': 151.0, 'end': 168.0, 'img_path': os.path.join(IMG_DIR, 'scene_5.jpg'), 'motion': 'zoom_out', 'theme': 'pure_lotus' },
    { 'idx': 5, 'start': 168.0, 'end': 192.0, 'img_path': os.path.join(IMG_DIR, 'scene_6.jpg'), 'motion': 'pan_up', 'theme': 'lanterns' },
    { 'idx': 6, 'start': 192.0, 'end': 209.84, 'img_path': os.path.join(IMG_DIR, 'scene_7.jpg'), 'motion': 'zoom_in_grand', 'theme': 'sunrise' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]
outro_img = Image.open(OUTRO_PATH).convert('RGB').resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC) if os.path.exists(OUTRO_PATH) else Image.new('RGB', (WIDTH, HEIGHT), (10, 15, 30))

# 0.05-second True Calibrated Lyrics Timeline
lyrics_timeline = [
    # Verse 1 (Intro vocal begins at 28.5s)
    (28.50, 34.50, "봄눈 같은 새벽빛에", ""),
    (35.30, 40.50, "흰 종이만 가만히 펴두고", ""),
    (41.50, 46.80, "먹물 한 방울 떨구듯이", ""),
    (47.70, 53.50, "그대 이름 마음에 찍네", ""),
    
    # Chorus 1 (Anthem buildup 54.1s)
    (54.10, 59.90, "순수한 마음 아리랑 아리랑", "아리랑 아리랑"),
    (60.00, 67.20, "흔들려도 흐려지지 말아라", ""),
    (68.10, 74.20, "바람 같은 세월 속에 맑은 숨 하나 지켜가자", ""),
    (74.70, 79.20, "내 어리신 마음 아리랑 아리랑", ""),
    (79.50, 87.50, "그댈 향해 곧게 뻗어가리라", ""),
    
    # Verse 2 (91.7s)
    (91.70, 96.50, "빛바랜 책장 넘기다가", ""),
    (97.60, 103.50, "옛 글 속에 숨은 나를 보고", ""),
    (104.40, 109.80, "소리 내어 웃다 문득", ""),
    (110.70, 116.50, "그대 생각에 고개 숙이네", ""),
    
    # Chorus 2 (117.5s)
    (117.50, 123.00, "순수한 마음 아리랑 아리랑", "아리랑 아리랑"),
    (124.10, 130.50, "흔들려도 흐려지지 말아라", ""),
    (131.40, 137.50, "바람 같은 세월 속에 맑은 숨 하나 지켜가자", ""),
    (138.00, 142.50, "내 어리신 마음 아리랑 아리랑", ""),
    (142.90, 150.50, "그댈 향해 곧게 뻗어가리라", ""),
    
    # Bridge (151.4s: Pure transparent heart)
    (151.40, 158.20, "욕심 한 줌 떨구고 체면 한 겹 벗겨내면", ""),
    (158.50, 166.50, "남는 것은 부끄러운 투명한 나의 속마음", ""),
    
    # Grand Climax & Finale Chorus (168.0s ~ 200.0s)
    (168.00, 173.00, "순수한 마음 아리랑 아리랑", ""),
    (173.70, 180.00, "그대 앞에 감추지 못하리", ""),
    (181.10, 187.50, "어지러운 세상 위에 조용히 피는 한 송이처럼", ""),
    (187.60, 192.50, "내 어리신 마음 아리랑 아리랑", ""),
    (192.50, 200.50, "끝내 그대 곁을 지켜가리라", "영원토록 변치 않을 우리 사랑 아리랑")
]

# Cherry Blossom & Golden Sparkle Particle System
def make_master_petal(size=48):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    # Elliptical rotated petal shape
    dx = (x - cx) * 0.8 + (y - cy) * 0.5
    dy = -(x - cx) * 0.5 + (y - cy) * 0.8
    d2 = (dx / (size * 0.18))**2 + (dy / (size * 0.35))**2
    mask = np.clip(1.0 - d2, 0.0, 1.0)
    im[:, :, 0] = np.clip(mask * 255, 0, 255)
    im[:, :, 1] = np.clip(mask * 180, 0, 255)
    im[:, :, 2] = np.clip(mask * 200, 0, 255)
    im[:, :, 3] = np.clip(mask * 220, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_petal = make_master_petal(48)

def make_master_sparkle(size=64):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    d2 = (x - cx)**2 + (y - cy)**2
    core = np.exp(-d2 / (2 * (size * 0.05)**2))
    glow = np.exp(-d2 / (2 * (size * 0.22)**2))
    im[:, :, 0] = np.clip(core * 255 + glow * 255, 0, 255)
    im[:, :, 1] = np.clip(core * 255 + glow * 220, 0, 255)
    im[:, :, 2] = np.clip(core * 220 + glow * 130, 0, 255)
    im[:, :, 3] = np.clip(core * 255 + glow * 180, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_sparkle = make_master_sparkle(64)

NUM_PETALS = 60
random.seed(7777)
petals_3d = []
for _ in range(NUM_PETALS):
    z = random.uniform(0.3, 1.3)
    petals_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-100, HEIGHT + 100),
        'z': z,
        'size': random.uniform(16, 36) * z,
        'speed_x': random.uniform(1.5, 4.5) * z,
        'speed_y': random.uniform(0.8, 2.5) * z,
        'rot': random.uniform(0, 360),
        'rot_speed': random.uniform(-3.0, 3.0),
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
    elif motion == 'pan_right': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.43 + 0.14 * p_eased), orig_h * 0.50
    elif motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.18 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.52 - 0.04 * p_eased)
    elif motion == 'pan_left': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.57 - 0.14 * p_eased), orig_h * 0.52
    elif motion == 'zoom_out': scale, cx, cy = (1.15 - 0.10 * p_eased) * extra_scale, orig_w * 0.50, orig_h * 0.50
    elif motion == 'pan_up': scale, cx, cy = 1.12 * extra_scale, orig_w * 0.50, orig_h * (0.56 - 0.12 * p_eased)
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

print(f'Starting Pure Heart Arirang 1080p MV Rendering: {TOTAL_FRAMES} frames ({TOTAL_DURATION:.2f}s)')
proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

OUTRO_START = 201.0  # 201.0s -> 209.84s (8.8s Outro card display)

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

        # Outro Card Blend at 201.0s
        if t >= OUTRO_START:
            o_fade = smooth_step(min(1.0, (t - OUTRO_START) / 1.5))
            base_img = Image.blend(base_img, outro_img, o_fade)

        # Head / Tail Black Fade
        if t < 1.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, smooth_step(t / 1.5))
        elif t > TOTAL_DURATION - 1.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, max(0.0, smooth_step((TOTAL_DURATION - t) / 1.5)))

        frame_rgba = base_img.convert('RGBA')

        if t < OUTRO_START + 0.6:
            frame_rgba.alpha_composite(vignette)
            overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)

            # Fluttering Blossom Petals & Light Motes
            for pt in petals_3d:
                pt['x'] = (pt['x'] + pt['speed_x']) % (WIDTH + 100)
                pt['y'] = (pt['y'] + pt['speed_y'] + math.sin(t * pt['wave_speed'] + pt['wave_phase']) * 0.8) % (HEIGHT + 100)
                pt['rot'] += pt['rot_speed']
                
                cur_sz = int(pt['size'])
                p_sprite = master_petal.resize((cur_sz, cur_sz), Image.Resampling.BILINEAR).rotate(pt['rot'], expand=False)
                overlay.paste(p_sprite, (int(pt['x']), int(pt['y'])), p_sprite)

            # Title Card (0.8s ~ 26.0s: Intro Prelude)
            if 0.8 <= t <= 26.0:
                t_rel = t - 0.8
                t_alpha = int(255 * smooth_step(t_rel / 1.5)) if t_rel < 1.5 else (int(255 * smooth_step(max(0.0, (25.2 - t_rel) / 2.0))) if t_rel > 23.2 else 255)
                if t_alpha > 0:
                    t_text = "순 수 한   마 음   아 리 랑"
                    st_text = "Modern Korean Fusion Anthem  •  143.6 BPM Full Version"
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
        if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:6.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 Pure Heart Arirang 1080p MV Successfully Rendered!')
    
    # Backup to local and G: drive if exists
    target_backup_dir = r'G:\내 드라이브\유튜브에올린음원'
    if os.path.exists(target_backup_dir):
        target_backup = os.path.join(target_backup_dir, '순수한마음_아리랑_시네마틱_뮤직비디오_1080p.mp4')
        shutil.copy2(OUTPUT_VIDEO, target_backup)
        print('Backed up to Google Drive successfully:', target_backup)

except Exception as e:
    print('Render error:', e)
    if proc: proc.kill()
