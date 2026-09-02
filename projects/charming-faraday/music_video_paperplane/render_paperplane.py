import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_paperplane'
IMG_DIR = os.path.join(BASE_DIR, 'images')
AUDIO_PATH = os.path.join(BASE_DIR, 'audio.wav')
OUTPUT_VIDEO = os.path.join(BASE_DIR, 'paper_plane_flight_mv.mp4')
OUTRO_PATH = r'G:\내 드라이브\유튜브에올린음원\아웃트로.jpg'

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_DURATION = 189.56
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
    { 'idx': 0, 'start': 0.0, 'end': 24.5, 'img_path': os.path.join(IMG_DIR, 'scene_1.jpg'), 'motion': 'zoom_in', 'theme': 'day' },
    { 'idx': 1, 'start': 24.5, 'end': 44.3, 'img_path': os.path.join(IMG_DIR, 'scene_2.jpg'), 'motion': 'pan_right', 'theme': 'day' },
    { 'idx': 2, 'start': 44.3, 'end': 68.9, 'img_path': os.path.join(IMG_DIR, 'scene_3.jpg'), 'motion': 'zoom_in_grand', 'theme': 'clouds' },
    { 'idx': 3, 'start': 68.9, 'end': 101.5, 'img_path': os.path.join(IMG_DIR, 'scene_4.jpg'), 'motion': 'pan_left', 'theme': 'day' },
    { 'idx': 4, 'start': 101.5, 'end': 127.3, 'img_path': os.path.join(IMG_DIR, 'scene_5.jpg'), 'motion': 'zoom_out', 'theme': 'sunset' },
    { 'idx': 5, 'start': 127.3, 'end': 139.8, 'img_path': os.path.join(IMG_DIR, 'scene_6.jpg'), 'motion': 'pan_up', 'theme': 'night' },
    { 'idx': 6, 'start': 139.8, 'end': 189.56, 'img_path': os.path.join(IMG_DIR, 'scene_7.jpg'), 'motion': 'zoom_in_grand', 'theme': 'climax' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]
outro_img = Image.open(OUTRO_PATH).convert('RGB').resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC)

# Pre-roll calibrated short-phrase timelines for Paper Plane
lyrics_timeline = [
    # Verse 1 (Vocal starts at 11.4s)
    (11.20, 14.50, "골목 끝에 남은 그림자", ""),
    (14.50, 17.70, "내 이름도 작아 보일 때", ""),
    (17.70, 21.00, "무릎에 묻은 먼지 속에", ""),
    (21.00, 24.20, "내일이 숨어 있는 걸 알아", ""),
    (24.20, 27.80, "웃으며 말했지, 넘어져도 괜찮다고", ""),
    (27.80, 33.40, "작은 발로 걷는 길이 가장 멀리 간다고", ""),
    
    # Pre-Chorus 1
    (33.50, 36.40, "조금 느려도 돼", ""),
    (36.60, 38.60, "돌아가도 돼", ""),
    (38.60, 44.10, "서두른 마음보다 정직한 한 걸음", ""),
    
    # Chorus 1
    (44.15, 48.30, "날아가, 종이비행기야!", ""),
    (48.35, 51.00, "바람이 안 도와줘도", ""),
    (51.00, 55.20, "구겨진 마음도 끝내는 펼쳐져", ""),
    (55.30, 59.10, "날아가, 종이비행기야!", ""),
    (59.10, 61.80, "높이만이 답은 아냐", ""),
    (61.80, 64.10, "떨어진 자리에서", ""),
    (64.10, 68.60, "다시 보면 돼", ""),
    
    # Verse 2
    (68.60, 71.10, "친구의 눈물 한 방울에", ""),
    (71.10, 74.10, "세상은 갑자기 커지고", ""),
    (74.10, 76.50, "내가 못 가진 것보다", ""),
    (76.50, 79.50, "지켜야 할 게 더 많아져", ""),
    (79.50, 82.30, "어른들은 자꾸 말하지", ""),
    (82.30, 84.80, "참아야 큰다고", ""),
    (84.80, 87.30, "근데 가끔은 울고 나서", ""),
    (87.30, 90.30, "더 멀리 보는 법도 있어", ""),
    
    # Pre-Chorus 2
    (90.75, 93.70, "조금 느려도 돼", ""),
    (93.75, 95.90, "돌아가도 돼", ""),
    (95.90, 98.70, "부서진 마음도", ""),
    (98.70, 101.30, "길이 될 수 있어", ""),
    
    # Chorus 2
    (101.30, 105.50, "날아가, 종이비행기야!", ""),
    (105.50, 108.20, "바람이 안 도와줘도", ""),
    (108.20, 112.60, "구겨진 마음도 끝내는 펼쳐져", ""),
    (112.60, 116.30, "날아가, 종이비행기야!", ""),
    (116.30, 119.10, "높이만이 답은 아냐", ""),
    (119.10, 121.30, "떨어진 자리에서", ""),
    (121.30, 126.70, "다시 보면 돼", ""),
    
    # Bridge
    (126.70, 129.80, "모든 별이 길은 아니야", ""),
    (129.80, 132.50, "모든 문이 집도 아니고", ""),
    (132.50, 135.70, "가장 작은 손길 하나가", ""),
    (135.70, 139.60, "어두운 밤을 바꿔", ""),
    
    # Final Chorus & Climax
    (139.60, 143.30, "날아가, 종이비행기야!", ""),
    (143.30, 146.30, "바람이 방해해도", ""),
    (146.30, 150.80, "구겨진 마음도 끝내는 펼쳐져", ""),
    (150.80, 154.50, "날아가, 종이비행기야!", ""),
    (154.50, 157.30, "높이만이 답은 아냐", ""),
    (157.30, 159.40, "떨어진 자리에서", ""),
    (159.40, 162.30, "다시 보면 돼", ""),
    
    # Outro Finale
    (162.30, 166.80, "날아가, 종이비행기야!", ""),
    (166.90, 169.90, "우린 아직 가는 중", ""),
    (169.90, 173.10, "작은 꿈의 끝에", ""),
    (173.30, 176.30, "큰 맘이 피어", "끝없이 펼쳐지는 푸른 하늘을 향해")
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

NUM_SPARKLES = 75
random.seed(9876)
sparkles_3d = []
for _ in range(NUM_SPARKLES):
    z = random.uniform(0.2, 1.4)
    sparkles_3d.append({
        'x': random.uniform(-100, WIDTH + 100),
        'y': random.uniform(-100, HEIGHT + 100),
        'z': z,
        'base_size': random.uniform(12, 32) * z,
        'speed_x': random.uniform(2.5, 5.5) * z,
        'speed_y': random.uniform(-1.0, 1.5) * z,
        'pulse_speed': random.uniform(3.0, 6.0),
        'pulse_phase': random.uniform(0, math.pi * 2)
    })

vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for y in range(HEIGHT - 280, HEIGHT):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(150 * ((y - (HEIGHT - 280)) / 280.0)**1.5)))
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
    elif motion == 'zoom_in_tilt': scale, cx, cy = (1.0 + 0.14 * p_eased) * extra_scale, orig_w * 0.5, orig_h * (0.46 + 0.08 * p_eased)
    elif motion == 'pan_left': scale, cx, cy = 1.10 * extra_scale, orig_w * (0.57 - 0.14 * p_eased), orig_h * 0.52
    elif motion == 'zoom_out': scale, cx, cy = (1.15 - 0.10 * p_eased) * extra_scale, orig_w * 0.50, orig_h * 0.50
    elif motion == 'pan_up': scale, cx, cy = 1.12 * extra_scale, orig_w * 0.50, orig_h * (0.56 - 0.12 * p_eased)
    elif motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.18 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.52 - 0.04 * p_eased)
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

print(f'Starting Paper Plane Pre-Roll Exact Sync Rendering: {TOTAL_FRAMES} frames ({TOTAL_DURATION:.2f}s)')
proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

OUTRO_START = 181.5

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

        # Outro Card Blend at 181.5s
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

            # Particles
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

            # Title Card (0.8s ~ 10.5s)
            if 0.8 <= t <= 10.5:
                t_rel = t - 0.8
                t_alpha = int(255 * smooth_step(t_rel / 1.5)) if t_rel < 1.5 else (int(255 * smooth_step(max(0.0, (9.7 - t_rel) / 1.8))) if t_rel > 7.7 else 255)
                if t_alpha > 0:
                    t_text = "종 이 비 행 기   항 해"
                    st_text = "Upbeat Anime OST  •  170 BPM Energetic Pop-Rock"
                    tb = draw.textbbox((0, 0), t_text, font=title_font)
                    tx, ty = (WIDTH - (tb[2]-tb[0])) // 2, 440
                    s_tb = draw.textbbox((0, 0), st_text, font=title_sub_font)
                    sx, sy = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ty + (tb[3]-tb[1]) + 35
                    draw.text((tx + 2, ty + 2), t_text, font=title_font, fill=(0, 0, 0, int(t_alpha * 0.8)))
                    draw.text((tx, ty), t_text, font=title_font, fill=(255, 255, 255, t_alpha))
                    draw.text((sx + 1, sy + 1), st_text, font=title_sub_font, fill=(0, 0, 0, int(t_alpha * 0.7)))
                    draw.text((sx, sy), st_text, font=title_sub_font, fill=(220, 245, 255, int(t_alpha * 0.95)))

            # Instant Display with Pre-roll lead
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
                        draw.text((lx, ly), main_txt, font=lyrics_font, fill=(255, 255, 255, l_alpha))
                        if sub_txt:
                            s_tb = draw.textbbox((0, 0), sub_txt, font=lyrics_sub_font)
                            slx, sly = (WIDTH - (s_tb[2]-s_tb[0])) // 2, ly + 48
                            for ox, oy in [(-1,-1), (1,1), (0,2)]:
                                draw.text((slx + ox, sly + oy), sub_txt, font=lyrics_sub_font, fill=(0, 0, 0, int(l_alpha * 0.75)))
                            draw.text((slx, sly), sub_txt, font=lyrics_sub_font, fill=(210, 235, 255, int(l_alpha * 0.9)))
                    break

            frame_rgba.alpha_composite(overlay)

        proc.stdin.write(frame_rgba.convert('RGB').tobytes())
        if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:6.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 Paper Plane MV (Pre-Roll Synced) Successfully Rendered!')
    
    target_backup = r'G:\내 드라이브\유튜브에올린음원\종이비행기_항해_시네마틱_뮤직비디오_1080p.mp4'
    shutil.copy2(OUTPUT_VIDEO, target_backup)
    print('Backed up to Google Drive successfully:', target_backup)

except Exception as e:
    print('Render error:', e)
    if proc: proc.kill()
