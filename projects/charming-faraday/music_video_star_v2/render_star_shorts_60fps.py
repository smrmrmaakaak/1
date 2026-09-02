import os
import sys
import math
import random
import shutil
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_star_v2'
SHORTS_DIR = os.path.join(BASE_DIR, 'shorts')
IMG_DIR = os.path.join(SHORTS_DIR, 'images')
AUDIO_PATH = os.path.join(SHORTS_DIR, 'shorts_audio.wav')
OUTPUT_VIDEO = os.path.join(SHORTS_DIR, 'star_shorts_1080x1920_60fps.mp4')

WIDTH, HEIGHT = 1080, 1920
FPS = 60
TOTAL_DURATION = 55.50
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
CROSSFADE_DUR = 1.4

FONT_PATH = r'C:\Windows\Fonts\malgunbd.ttf'
if not os.path.exists(FONT_PATH):
    FONT_PATH = r'C:\Windows\Fonts\batang.ttc'

lyrics_font = ImageFont.truetype(FONT_PATH, 54)

# 4 Vertical Scenes Timeline
scenes = [
    { 'idx': 0, 'start': 0.0, 'end': 10.2, 'img_path': os.path.join(IMG_DIR, 'scene_01.jpg'), 'motion': 'zoom_in_grand' },
    { 'idx': 1, 'start': 10.2, 'end': 22.3, 'img_path': os.path.join(IMG_DIR, 'scene_02.jpg'), 'motion': 'pan_up' },
    { 'idx': 2, 'start': 22.3, 'end': 36.2, 'img_path': os.path.join(IMG_DIR, 'scene_03.jpg'), 'motion': 'zoom_in_slow' },
    { 'idx': 3, 'start': 36.2, 'end': 55.50, 'img_path': os.path.join(IMG_DIR, 'scene_04.jpg'), 'motion': 'zoom_in_grand' }
]

loaded_images = [Image.open(sc['img_path']).convert('RGB') for sc in scenes]

# 100% Calibrated True-Sync Shorts Lyrics (Only Actual Lyrics, No Extra Text)
lyrics_timeline = [
    (0.00, 5.66, "하늘에서 별을 따다 하늘에서 달을 따다"),
    (5.66, 8.80, "두 손에 담아줄게요"),
    (10.26, 15.10, "아름다운 그대 모습 바라보면 행복하죠"),
    (15.10, 20.40, "내 사랑"),
    (22.28, 26.90, "아름다운 날들이여 천천히 내게 와요"),
    (26.90, 32.50, "사라지지 말아요 내 품에 잠겨요"),
    (36.18, 41.28, "차가운 바람 끝에도 당신만은 따뜻해요"),
    (41.80, 48.00, "이름만 불러도 마음이 먼저 달려가요"),
    (48.38, 54.00, "어느 날 문득 돌아보면 내가 늘 여기 있을게요")
]

# Soft Particles
def make_master_sparkle(size=48):
    im = np.zeros((size, size, 4), dtype=np.float32)
    cy, cx = size / 2.0, size / 2.0
    y, x = np.mgrid[:size, :size]
    d2 = (x - cx)**2 + (y - cy)**2
    glow = np.exp(-d2 / (2 * (size * 0.20)**2))
    im[:, :, 0] = np.clip(glow * 255, 0, 255)
    im[:, :, 1] = np.clip(glow * 250, 0, 255)
    im[:, :, 2] = np.clip(glow * 220, 0, 255)
    im[:, :, 3] = np.clip(glow * 180, 0, 255)
    return Image.fromarray(im.astype(np.uint8))

master_sparkle = make_master_sparkle(48)

NUM_SPARKLES = 30
random.seed(999)
sparkles_3d = []
for _ in range(NUM_SPARKLES):
    z = random.uniform(0.4, 1.1)
    sparkles_3d.append({
        'x': random.uniform(-50, WIDTH + 50),
        'y': random.uniform(-50, HEIGHT + 50),
        'size': random.uniform(10, 26) * z,
        'speed_x': random.uniform(0.5, 1.5) * z * (30.0 / FPS),
        'speed_y': random.uniform(-1.2, -0.3) * z * (30.0 / FPS),
        'pulse_speed': random.uniform(2.0, 4.0),
        'pulse_phase': random.uniform(0, math.pi * 2)
    })

# Cinematic Soft Vignette
vignette = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
v_draw = ImageDraw.Draw(vignette)
for y in range(HEIGHT - 450, HEIGHT):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(150 * ((y - (HEIGHT - 450)) / 450.0)**1.5)))
for y in range(0, 240):
    v_draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, int(90 * ((240 - y) / 240.0)**1.5)))

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
    
    if motion == 'zoom_in_grand': scale, cx, cy = (1.0 + 0.10 * p_eased) * extra_scale, orig_w * 0.50, orig_h * (0.52 - 0.02 * p_eased)
    elif motion == 'zoom_in_slow': scale, cx, cy = (1.0 + 0.07 * p_eased) * extra_scale, orig_w * 0.50, orig_h * 0.50
    elif motion == 'pan_up': scale, cx, cy = 1.07 * extra_scale, orig_w * 0.50, orig_h * (0.54 - 0.08 * p_eased)
    else: scale, cx, cy = 1.04 * extra_scale, orig_w * 0.5, orig_h * 0.5

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

print(f'Rendering Clean Premium Shorts (No Tacky UI / Perfect Sync): {TOTAL_FRAMES} frames')
proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

try:
    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / float(FPS)
        sc_idx = get_current_scene_idx(t)
        sc = scenes[sc_idx]
        t_sc = t - sc['start']
        dur_sc = sc['end'] - sc['start']
        time_to_end = sc['end'] - t
        
        # Smooth Crossfade
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

        # Head / Tail Fade
        if t < 0.5:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, smooth_step(t / 0.5))
        elif t > TOTAL_DURATION - 1.2:
            base_img = Image.blend(Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0)), base_img, max(0.0, smooth_step((TOTAL_DURATION - t) / 1.2)))

        frame_rgba = base_img.convert('RGBA')
        frame_rgba.alpha_composite(vignette)
        overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Subtle floating starlight
        for sp in sparkles_3d:
            sp['x'] = (sp['x'] + sp['speed_x']) % (WIDTH + 50)
            sp['y'] = (sp['y'] + sp['speed_y']) % (HEIGHT + 50)
            pulse = 0.6 + 0.4 * math.sin(t * sp['pulse_speed'] + sp['pulse_phase'])
            cur_sz = max(6, int(sp['size'] * pulse))
            s_sprite = master_sparkle.resize((cur_sz, cur_sz), Image.Resampling.BILINEAR)
            overlay.paste(s_sprite, (int(sp['x']), int(sp['y'])), s_sprite)

        # Clean Cinema Subtitles (Positioned at Y=1450, Pure White with Deep Soft Drop Shadow)
        for l_start, l_end, main_txt in lyrics_timeline:
            if l_start <= t <= l_end:
                dur, pos = l_end - l_start, t - l_start
                fade_p = smooth_step(pos / 0.04) if pos < 0.04 else (smooth_step(max(0.0, (dur - pos) / 0.05)) if pos > dur - 0.05 else 1.0)
                l_alpha = int(255 * fade_p)
                if l_alpha > 0 and main_txt:
                    tb = draw.textbbox((0, 0), main_txt, font=lyrics_font)
                    text_w = tb[2] - tb[0]
                    text_h = tb[3] - tb[1]
                    lx, ly = (WIDTH - text_w) // 2, 1460
                    
                    # Clean Semi-transparent Soft Blur Pill
                    pad_x, pad_y = 26, 12
                    draw.rounded_rectangle([lx - pad_x, ly - pad_y, lx + text_w + pad_x, ly + text_h + pad_y], radius=16, fill=(0, 0, 0, int(l_alpha * 0.55)))
                    
                    # Deep Crisp Drop Shadow
                    for ox in [-2, -1, 0, 1, 2]:
                        for oy in [-2, -1, 0, 1, 2, 3]:
                            if ox != 0 or oy != 0:
                                draw.text((lx + ox, ly + oy), main_txt, font=lyrics_font, fill=(0, 0, 0, int(l_alpha * 0.95)))
                    
                    # Pure Solid White Text
                    draw.text((lx, ly), main_txt, font=lyrics_font, fill=(255, 255, 255, l_alpha))
                break

        frame_rgba.alpha_composite(overlay)
        proc.stdin.write(frame_rgba.convert('RGB').tobytes())
        
        if frame_idx % 300 == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f'Shorts Progress: {(frame_idx+1)/TOTAL_FRAMES*100:5.1f}% | Time: {t:5.1f}s')

    proc.stdin.close()
    proc.wait()
    print('\n🎉 Clean YouTube Shorts 1080x1920 60FPS Successfully Rendered!')
    
    # Backup to Google Drive
    target_backup_dir = r'G:\내 드라이브\유튜브에올린음원'
    if os.path.exists(target_backup_dir):
        target_backup = os.path.join(target_backup_dir, '별을따다_쇼츠_세로형_60fps_1080p.mp4')
        shutil.copy2(OUTPUT_VIDEO, target_backup)
        print('Backed up to Google Drive successfully (Overwritten):', target_backup)

    # Copy to Desktop
    desktop_backup = os.path.expanduser(r'~\Desktop\별을따다_쇼츠_세로형_60fps.mp4')
    shutil.copy2(OUTPUT_VIDEO, desktop_backup)
    print('Copied to Desktop successfully:', desktop_backup)

except Exception as e:
    print('Shorts Render error:', e)
    if proc: proc.kill()
