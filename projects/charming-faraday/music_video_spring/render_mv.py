import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_spring'
IMG_DIR = os.path.join(BASE_DIR, 'images')
AUDIO_PATH = os.path.join(BASE_DIR, 'audio_full.mp3')
OUTPUT_VIDEO = os.path.join(BASE_DIR, 'spring_in_hometown_mv.mp4')
OUTRO_PATH = r'G:\내 드라이브\유튜브에올린음원\아웃트로.jpg'

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_DURATION = 188.48
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
CROSSFADE_DUR = 1.8

FONT_PATH = r'C:\Windows\Fonts\HANBatangB.ttf'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\batang.ttc'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\malgunbd.ttf'

title_font = ImageFont.truetype(FONT_PATH, 68)
title_sub_font = ImageFont.truetype(FONT_PATH, 30)
lyrics_font = ImageFont.truetype(FONT_PATH, 46)
lyrics_sub_font = ImageFont.truetype(FONT_PATH, 28)

scenes = [
    { 'idx': 0, 'start': 0.0, 'end': 26.8, 'img_path': os.path.join(IMG_DIR, 'scene_1.jpg'), 'motion': 'zoom_in', 'theme': 'day' },
    { 'idx': 1, 'start': 26.8, 'end': 39.2, 'img_path': os.path.join(IMG_DIR, 'scene_2.jpg'), 'motion': 'pan_right', 'theme': 'day' },
    { 'idx': 2, 'start': 39.2, 'end': 67.0, 'img_path': os.path.join(IMG_DIR, 'scene_3.jpg'), 'motion': 'zoom_in_tilt', 'theme': 'day' },
    { 'idx': 3, 'start': 67.0, 'end': 79.7, 'img_path': os.path.join(IMG_DIR, 'scene_4.jpg'), 'motion': 'pan_left', 'theme': 'day' },
    { 'idx': 4, 'start': 79.7, 'end': 108.0, 'img_path': os.path.join(IMG_DIR, 'scene_5.jpg'), 'motion': 'zoom_out', 'theme': 'sunset' },
    { 'idx': 5, 'start': 108.0, 'end': 147.5, 'img_path': os.path.join(IMG_DIR, 'scene_6.jpg'), 'motion': 'pan_up', 'theme': 'night' },
    { 'idx': 6, 'start': 147.5, 'end': 188.48, 'img_path': os.path.join(IMG_DIR, 'scene_7.jpg'), 'motion': 'zoom_in_grand', 'theme': 'climax' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]
outro_img = Image.open(OUTRO_PATH).convert('RGB').resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC)

# Pre-roll calibrated sync for perfect perception
lyrics_timeline = [
    (12.60, 19.80, "산들바람 속에 꽃잎이 춤추고", ""),
    (19.80, 26.60, "나무 그림자 밑에 꿈이 숨쉬네", ""),
    (26.60, 29.80, "파란 하늘 아래", ""),
    (29.80, 33.10, "잔디밭에 누워", ""),
    (33.10, 39.00, "내 어린 시절이 속삭이네", ""),
    (39.00, 46.20, "고향의 봄  그리운 봄", ""),
    (47.60, 52.80, "향기로운 추억의 봄", ""),
    (52.80, 60.30, "어디에 있든 가슴에 품은", ""),
    (60.30, 66.80, "고향의 봄  나의 봄", ""),
    (66.80, 73.00, "강물 흐름 따라 이야기가 흐르고", ""),
    (73.30, 79.50, "새들의 노래에 맘이 흘러가", ""),
    (79.50, 86.50, "해질녘 빛깔이 내 맘을 적시고", ""),
    (86.50, 92.90, "시간은 멈춘 듯 따뜻하네", ""),
    (92.90, 99.90, "지나간 날들 다시 올 수 없지만", ""),
    (99.90, 106.50, "내 마음엔 언제나 살아있는 봄", ""),
    (108.10, 112.50, "그리움에 젖어 눈 감으면", ""),
    (113.90, 119.50, "고향의 봄이 날 부르네", ""),
    (120.30, 126.50, "고향의 봄  그리운 봄", ""),
    (129.30, 133.50, "향기로운 추억의 봄", ""),
    (135.40, 141.00, "어디에 있든 가슴에 품은", ""),
    (142.40, 146.50, "고향의 봄  나의 봄", ""),
    (147.30, 153.50, "고향의 봄  그리운 봄", ""),
    (155.90, 160.50, "향기로운 추억의 봄", ""),
    (162.10, 168.00, "어디에 있든 가슴에 품은", ""),
    (168.60, 174.50, "고향의 봄  나의 봄", ""),
    (175.10, 181.50, "고향의 봄  나의 봄", "영원히 가슴속에 피어나는 따스한 기억")
]

def make_master_petal(size=128):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2.0, size / 2.0
    r = size * 0.42
    points = []
    for deg in range(0, 360, 3):
        rad = math.radians(deg)
        notch = 1.0 - 0.22 * math.sin(math.radians((deg - 70) / 40.0 * 180)) if 70 <= deg <= 110 else 1.0
        taper = 0.45 + 0.55 * math.cos(math.radians((deg - 270) / 50.0 * 90)) if 220 <= deg <= 320 else 1.0
        pr = r * notch * taper
        points.append((cx + pr * math.cos(rad), cy - pr * math.sin(rad) * 1.15))
    draw.polygon(points, fill=(255, 255, 255, 255))
    arr = np.array(img, dtype=np.float32)
    y, x = np.mgrid[:size, :size]
    dist = np.clip((y - (cy - r * 0.5)) / (r * 1.6), 0.0, 1.0)
    mask = arr[:, :, 3] > 0
    arr[mask, 0] = 255
    arr[mask, 1] = 192 + 58 * (1.0 - dist[mask])
    arr[mask, 2] = 208 + 42 * (1.0 - dist[mask])
    arr[mask, 3] = 230 * (0.85 + 0.15 * dist[mask])
    return Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=0.6))

def make_master_firefly(size=128):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    d2 = (x - cx)**2 + (y - cy)**2
    core = np.exp(-d2 / (2 * (size * 0.035)**2))
    inner = np.exp(-d2 / (2 * (size * 0.12)**2))
    outer = np.exp(-d2 / (2 * (size * 0.28)**2))
    im[:, :, 0] = np.clip(core * 255 + inner * 215 + outer * 160, 0, 255)
    im[:, :, 1] = np.clip(core * 255 + inner * 255 + outer * 230, 0, 255)
    im[:, :, 2] = np.clip(core * 200 + inner * 110 + outer * 60, 0, 255)
    im[:, :, 3] = np.clip(core * 255 + inner * 200 + outer * 95, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_petal = make_master_petal(128)
master_firefly = make_master_firefly(128)

random.seed(12345)
petals_3d = []
for _ in range(65):
    z = random.uniform(0.15, 1.3)
    petals_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-200, HEIGHT + 100),
        'z': z,
        'base_size': random.uniform(22, 38) * z,
        'speed_x': random.uniform(1.5, 3.5) * (0.6 + 0.6 * z),
        'speed_y': random.uniform(0.9, 2.4) * (0.6 + 0.6 * z),
        'rot_x': random.uniform(0, 360), 'rot_y': random.uniform(0, 360), 'rot_z': random.uniform(0, 360),
        'd_rot_x': random.uniform(1.5, 4.0), 'd_rot_y': random.uniform(2.0, 5.5), 'd_rot_z': random.uniform(1.0, 3.0),
        'blur_dof': 2.0 if z > 1.15 else (1.2 if z < 0.25 else 0.0)
    })

fireflies = []
for _ in range(45):
    fireflies.append({
        'x': random.uniform(0, WIDTH), 'y': random.uniform(100, HEIGHT - 50),
        'base_size': random.uniform(16, 42), 'pulse_speed': random.uniform(2.0, 4.5),
        'pulse_phase': random.uniform(0, math.pi * 2), 'drift_speed_x': random.uniform(-0.6, 0.6),
        'drift_speed_y': random.uniform(-0.4, 0.4), 'sin_freq': random.uniform(0.5, 1.5), 'sin_amp': random.uniform(20, 60)
    })

vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for y in range(HEIGHT - 280, HEIGHT):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(145 * ((y - (HEIGHT - 280)) / 280.0)**1.5)))
for y in range(0, 160):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(85 * ((160 - y) / 160.0)**1.5)))

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
    elif motion == 'zoom_in_tilt': scale, cx, cy = (1.0 + 0.14 * p_eased) * extra_scale, orig_w * 0.5, orig_h * (0.46 + 0.08 * p_eased)
    elif motion == 'pan_left': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.57 - 0.14 * p_eased), orig_h * 0.52
    elif motion == 'zoom_out': scale, cx, cy = (1.15 - 0.10 * p_eased) * extra_scale, orig_w * 0.50, orig_h * 0.50
    elif motion == 'pan_up': scale, cx, cy = 1.12 * extra_scale, orig_w * 0.50, orig_h * (0.56 - 0.12 * p_eased)
    elif motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.16 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.52 - 0.04 * p_eased)
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

print(f'Starting Spring MV Pre-Roll Exact Sync Rendering: {TOTAL_FRAMES} frames')
proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

OUTRO_START = 182.5

try:
    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        sc_idx = get_current_scene_idx(t)
        sc = scenes[sc_idx]
        t_sc = t - sc['start']
        dur_sc = sc['end'] - sc['start']
        time_to_end = sc['end'] - t
        
        # Single-pass Crossfade
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

        # Outro Card Fade In at 182.5s
        if t >= OUTRO_START:
            o_fade = smooth_step(min(1.0, (t - OUTRO_START) / 1.5))
            base_img = Image.blend(base_img, outro_img, o_fade)

        # Head / Tail Black Fade
        if t < 1.8:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, smooth_step(t / 1.8))
        elif t > TOTAL_DURATION - 1.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, max(0.0, smooth_step((TOTAL_DURATION - t) / 1.5)))

        frame_rgba = base_img.convert('RGBA')
        
        if t < OUTRO_START + 0.8:
            frame_rgba.alpha_composite(vignette)
            overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            is_night = (sc['theme'] == 'night')
            is_sunset = (sc['theme'] == 'sunset')
            
            if is_night:
                for f in fireflies:
                    fx = (f['x'] + f['drift_speed_x'] * (frame_idx % 2000) + math.sin(t * f['sin_freq']) * f['sin_amp']) % (WIDTH + 60) - 30
                    fy = (f['y'] + f['drift_speed_y'] * (frame_idx % 2000) + math.cos(t * f['sin_freq'] * 0.7) * (f['sin_amp'] * 0.5)) % (HEIGHT + 60) - 30
                    pulse = (math.sin(t * f['pulse_speed'] + f['pulse_phase']) + 1.0) * 0.5
                    if pulse > 0.08:
                        cur_size = int(f['base_size'] * (0.7 + 0.6 * pulse))
                        ff_sprite = master_firefly.resize((cur_size, cur_size), Image.Resampling.BILINEAR)
                        overlay.paste(ff_sprite, (int(fx - cur_size//2), int(fy - cur_size//2)), ff_sprite)
            else:
                wind_wave = math.sin(t * 1.2) * 1.5
                for p in petals_3d:
                    p['x'] = (p['x'] + p['speed_x'] + wind_wave) % (WIDTH + 140)
                    p['y'] = (p['y'] + p['speed_y']) % (HEIGHT + 140)
                    p['rot_x'] = (p['rot_x'] + p['d_rot_x']) % 360
                    p['rot_y'] = (p['rot_y'] + p['d_rot_y']) % 360
                    p['rot_z'] = (p['rot_z'] + p['d_rot_z']) % 360
                    w_proj = max(4, int(p['base_size'] * (0.25 + 0.75 * abs(math.cos(math.radians(p['rot_y']))))))
                    h_proj = max(4, int(p['base_size'] * (0.25 + 0.75 * abs(math.cos(math.radians(p['rot_x']))))))
                    p_scaled = master_petal.resize((w_proj, h_proj), Image.Resampling.BILINEAR).rotate(p['rot_z'], expand=True, resample=Image.Resampling.BILINEAR)
                    if p['blur_dof'] > 0: p_scaled = p_scaled.filter(ImageFilter.GaussianBlur(radius=p['blur_dof']))
                    if is_sunset:
                        p_arr = np.array(p_scaled, dtype=np.float32)
                        p_arr[:, :, 1] = np.clip(p_arr[:, :, 1] * 0.88, 0, 255)
                        p_arr[:, :, 2] = np.clip(p_arr[:, :, 2] * 0.75, 0, 255)
                        p_scaled = Image.fromarray(p_arr.astype(np.uint8))
                    overlay.paste(p_scaled, (int(p['x'] - 70), int(p['y'] - 70)), p_scaled)

            # Title Card
            if 0.8 <= t <= 10.5:
                t_rel = t - 0.8
                t_alpha = int(255 * smooth_step(t_rel / 1.5)) if t_rel < 1.5 else (int(255 * smooth_step(max(0.0, (9.7 - t_rel) / 1.8))) if t_rel > 7.7 else 255)
                if t_alpha > 0:
                    t_text = "고  향  의    봄"
                    st_text = "Acoustic Ballad  •  Nostalgic Melody"
                    tb = draw.textbbox((0, 0), t_text, font=title_font)
                    tx, ty = (WIDTH - (tb[2]-tb[0])) // 2, 440
                    s_tb = draw.textbbox((0, 0), st_text, font=title_sub_font)
                    sx, sy = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ty + (tb[3]-tb[1]) + 35
                    draw.text((tx + 2, ty + 2), t_text, font=title_font, fill=(0, 0, 0, int(t_alpha * 0.75)))
                    draw.text((tx, ty), t_text, font=title_font, fill=(255, 255, 255, t_alpha))
                    draw.text((sx + 1, sy + 1), st_text, font=title_sub_font, fill=(0, 0, 0, int(t_alpha * 0.65)))
                    draw.text((sx, sy), st_text, font=title_sub_font, fill=(240, 235, 220, int(t_alpha * 0.9)))

            # Instant Lyrics Display
            for l_start, l_end, main_txt, sub_txt in lyrics_timeline:
                if l_start <= t <= l_end:
                    dur, pos = l_end - l_start, t - l_start
                    if pos < 0.08: fade_p = smooth_step(pos / 0.08)
                    elif pos > dur - 0.10: fade_p = smooth_step(max(0.0, (dur - pos) / 0.10))
                    else: fade_p = 1.0
                    l_alpha = int(255 * fade_p)
                    if l_alpha > 0 and main_txt:
                        tb = draw.textbbox((0, 0), main_txt, font=lyrics_font)
                        lx, ly = (WIDTH - (tb[2]-tb[0])) // 2, (940 if not sub_txt else 915)
                        for ox, oy in [(-2,-2), (2,2), (0,3), (3,0), (-3,0), (0,-3)]:
                            draw.text((lx + ox, ly + oy), main_txt, font=lyrics_font, fill=(0, 0, 0, int(l_alpha * 0.85)))
                        draw.text((lx, ly), main_txt, font=lyrics_font, fill=(255, 253, 245, l_alpha))
                        if sub_txt:
                            s_tb = draw.textbbox((0, 0), sub_txt, font=lyrics_sub_font)
                            slx, sly = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ly + 46
                            for ox, oy in [(-1,-1), (1,1), (0,2)]:
                                draw.text((slx + ox, sly + oy), sub_txt, font=lyrics_sub_font, fill=(0, 0, 0, int(l_alpha * 0.75)))
                            draw.text((slx, sly), sub_txt, font=lyrics_sub_font, fill=(230, 225, 215, int(l_alpha * 0.9)))
                    break

            frame_rgba.alpha_composite(overlay)

        proc.stdin.write(frame_rgba.convert('RGB').tobytes())
        if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:6.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 Spring MV (Pre-Roll Synced) Successfully Rendered!')
    shutil.copy2(OUTPUT_VIDEO, r'G:\내 드라이브\유튜브에올린음원\고향의봄_시네마틱_뮤직비디오_1080p.mp4')
    print('Updated Google Drive Backup successfully!')

except Exception as e:
    print('Render error:', e)
    if proc: proc.kill()
