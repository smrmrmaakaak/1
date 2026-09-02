import os, sys, math, random, subprocess, time
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter
import cv2

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

AUDIO_PATH = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\그리움의 노래(반주).mp3"
IMG_DIR = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능"
OUT_WORKSPACE = r"C:\Users\황태민\Documents\antigravity\calm-hertz\다래의효능_완성영상.mp4"
OUT_KAKAO = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능_영상.mp4"

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TRANSITION_SEC = 0.8
TRANSITION_FRAMES = int(TRANSITION_SEC * FPS)

FONT_BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
FONT_REG = r"C:\Windows\Fonts\malgun.ttf"

font_header = ImageFont.truetype(FONT_BOLD, 22)
font_badge = ImageFont.truetype(FONT_BOLD, 20)
font_title = ImageFont.truetype(FONT_BOLD, 33)
font_sub = ImageFont.truetype(FONT_REG, 23)

SCENES = [
    {
        "img": "KakaoTalk_20260829_181618045_19.jpg",
        "tag": "제철 야생 다래 수확",
        "title": "자연이 선물한 귀한 보약, 토종 야생 다래",
        "sub": "깊은 숲속의 맑은 기운을 듬뿍 머금고 자란 천연 건강 열매",
        "dur": 10.0,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_20.jpg",
        "tag": "신선한 다래 선별",
        "title": "자연 그대로의 싱그러움과 생명력",
        "sub": "탱글탱글 윤기가 흐르는 토종 다래의 탐스러운 자태",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_11.jpg",
        "tag": "깨끗한 전처리 과정",
        "title": "정성을 담은 다래 손질과 세척",
        "sub": "흐르는 맑은 물에 깨끗이 씻어 물기를 뽀송뽀송하게 말려줍니다",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_16.jpg",
        "tag": "특상급 토종 다래",
        "title": "맛과 영양이 응축된 천연 비타민의 보고",
        "sub": "달콤새콤한 풍미와 부드러운 과육 속에 가득한 풍부한 영양",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_10.jpg",
        "tag": "다래의 효능 01",
        "title": "면역력 강화 & 천연 비타민 충전",
        "sub": "비타민 C가 사과의 20배, 레몬의 3배 이상 풍부하여 활력 증진에 탁월",
        "dur": 10.0,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_17.jpg",
        "tag": "다래의 효능 02",
        "title": "만성 염증 완화 & 알레르기 개선",
        "sub": "천연 면역 조절 물질(PG102)이 체내 염증을 억제하고 기관지 건강 지원",
        "dur": 10.0,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045.jpg",
        "tag": "다래의 효능 03",
        "title": "장 건강 & 소화 촉진 (변비 해소)",
        "sub": "천연 단백질 분해 효소 '액티니딘'과 풍부한 식이섬유가 위장을 편안하게",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_01.jpg",
        "tag": "다래의 효능 04",
        "title": "강력한 항산화 & 노화 방지",
        "sub": "베타카로틴과 폴리페놀이 활성산소를 억제하여 피부 탄력과 피로 회복",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_02.jpg",
        "tag": "다래의 효능 05",
        "title": "혈관 건강 & 체내 독소 배출",
        "sub": "칼륨과 엽산, 풍부한 유기산이 혈압 안정과 체내 노폐물 배출 촉진",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_03.jpg",
        "tag": "다래청 담그기 01",
        "title": "다래와 설탕의 1:1 황금비율",
        "sub": "소독한 유리병에 싱싱한 다래와 설탕을 동일한 무게(1:1)로 준비합니다",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_04.jpg",
        "tag": "다래청 담그기 02",
        "title": "켜켜이 정성껏 채워넣기",
        "sub": "다래 한 층, 설탕 한 층을 번갈아 가며 빈틈없이 차곡차곡 채웁니다",
        "dur": 9.5,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_05.jpg",
        "tag": "다래청 담그기 03",
        "title": "설탕과 과즙의 조화로운 어우러짐",
        "sub": "하얀 설탕이 사르르 녹아내리며 다래 본연의 진한 엑기스가 우러납니다",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_06.jpg",
        "tag": "다래청 담그기 04",
        "title": "삼투압으로 농축되는 천연 영양",
        "sub": "설탕이 녹으며 다래의 비타민과 유효 성분이 천연 효소액으로 완성",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_07.jpg",
        "tag": "다래청 담그기 05",
        "title": "공기 접촉 완벽 차단하기",
        "sub": "과육이 공기 중에 노출되지 않도록 골고루 설탕을 덮어주는 것이 비결",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_08.jpg",
        "tag": "다래청 담그기 06",
        "title": "안심 보관을 위한 설탕 덮개",
        "sub": "맨 위쪽은 설탕을 소복이 두텁게 얹어 곰팡이와 변질을 완벽 방지",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_12.jpg",
        "tag": "다래청 담그기 07",
        "title": "가족 건강을 기원하는 따뜻한 정성",
        "sub": "사계절 건강을 지켜줄 든든한 상비 보약으로 정성을 다해 채웁니다",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_13.jpg",
        "tag": "다래청 담그기 08",
        "title": "소복한 눈꽃처럼 깔끔한 마무리",
        "sub": "병 입구를 청결하게 닦고 뚜껑을 닫아 위생적인 밀폐를 준비합니다",
        "dur": 9.5,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_14.jpg",
        "tag": "다래청 담그기 09",
        "title": "완벽한 밀봉과 숙성 관리",
        "sub": "설탕이 완전히 녹을 때까지 2~3일에 한 번씩 저어주면 풍미가 배가됩니다",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_18.jpg",
        "tag": "100일의 숙성",
        "title": "100일간의 정성과 기다림의 시간",
        "sub": "직사광선을 피해 서늘하고 통풍이 잘되는 그늘에서 천천히 자연 발효",
        "dur": 10.0,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_09.jpg",
        "tag": "명품 다래청 완성",
        "title": "정성 가득 담긴 건강 명품 다래청 완성!",
        "sub": "100일 후 원액을 걸러 따뜻한 다래차나 시원한 에이드로 건강하게 즐기세요",
        "dur": 16.0,
        "motion": "pan_left_right"
    },
    {
        "img": "KakaoTalk_20260829_181618045_15.jpg",
        "tag": "건강과 행복 기원",
        "title": "자연이 빚은 귀한 선물, 늘 건강하세요",
        "sub": "향긋하고 달콤한 토종 다래청과 함께 온 가족 모두 건강하고 행복하세요!",
        "dur": 14.06,
        "motion": "zoom_out"
    }
]

# Recalibrate duration to match audio length ~212.56s
AUDIO_LEN = 212.559979
total_dur = sum(s["dur"] for s in SCENES)
for s in SCENES:
    s["dur"] = (s["dur"] / total_dur) * AUDIO_LEN

print(f"Total video duration: {AUDIO_LEN:.2f}s ({len(SCENES)} scenes)")

print("Pre-processing scene assets...")
scene_assets = []

for idx, sc in enumerate(SCENES):
    raw_path = os.path.join(IMG_DIR, sc["img"])
    im_raw = Image.open(raw_path)
    im = ImageOps.exif_transpose(im_raw).convert("RGBA")
    
    is_landscape = (im.width > im.height)
    
    # 1. Base Blurred Background (Full HD)
    iw, ih = im.size
    target_ratio = WIDTH / HEIGHT
    if iw / ih > target_ratio:
        nw = int(ih * target_ratio)
        left = (iw - nw) // 2
        bg_crop = im.crop((left, 0, left + nw, ih))
    else:
        nh = int(iw / target_ratio)
        top = (ih - nh) // 2
        bg_crop = im.crop((0, top, iw, top + nh))
    
    bg_blurred = bg_crop.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
    bg_blurred = bg_blurred.filter(ImageFilter.GaussianBlur(radius=38))
    dark_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (12, 22, 16, 145))
    bg_blurred = Image.alpha_composite(bg_blurred, dark_overlay)
    
    # 2. UI Overlays (Header + Subtitle Card)
    ui_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    ui_draw = ImageDraw.Draw(ui_overlay)
    
    # Top-Left Header Badge
    hdr_text = "자연이 빚은 보약  |  토종 야생 다래의 효능"
    hdr_bbox = font_header.getbbox(hdr_text)
    hdr_w = (hdr_bbox[2] - hdr_bbox[0]) + 38
    hdr_h = 44
    ui_draw.rounded_rectangle([(50, 36), (50 + hdr_w, 36 + hdr_h)], radius=22, fill=(15, 25, 20, 190), outline=(163, 230, 53, 140), width=2)
    ui_draw.text((69, 44), hdr_text, font=font_header, fill=(240, 253, 244, 255))
    
    # Top-Right BGM Badge
    bgm_text = "음악: 그리움의 노래 (연주곡)"
    bgm_bbox = font_header.getbbox(bgm_text)
    bgm_w = (bgm_bbox[2] - bgm_bbox[0]) + 38
    bgm_x = WIDTH - 50 - bgm_w
    ui_draw.rounded_rectangle([(bgm_x, 36), (bgm_x + bgm_w, 36 + hdr_h)], radius=22, fill=(15, 25, 20, 190), outline=(250, 204, 21, 140), width=2)
    ui_draw.text((bgm_x + 19, 44), bgm_text, font=font_header, fill=(254, 240, 138, 255))
    
    # Bottom Caption Card
    card_w = 1580
    card_h = 146
    card_x = (WIDTH - card_w) // 2
    card_y = HEIGHT - card_h - 38
    
    ui_draw.rounded_rectangle([(card_x, card_y), (card_x + card_w, card_y + card_h)], radius=24, fill=(10, 20, 15, 215), outline=(163, 230, 53, 150), width=2)
    
    # Tag Badge
    tag_text = sc["tag"]
    tag_bbox = font_badge.getbbox(tag_text)
    tag_w = (tag_bbox[2] - tag_bbox[0]) + 26
    tag_h = 32
    tag_x = card_x + 35
    tag_y = card_y + 18
    ui_draw.rounded_rectangle([(tag_x, tag_y), (tag_x + tag_w, tag_y + tag_h)], radius=16, fill=(163, 230, 53, 240))
    ui_draw.text((tag_x + 13, tag_y + 4), tag_text, font=font_badge, fill=(15, 23, 42, 255))
    
    # Title
    title_text = sc["title"]
    ui_draw.text((tag_x + tag_w + 20, card_y + 14), title_text, font=font_title, fill=(255, 255, 255, 255))
    
    # Subtitle
    sub_text = sc["sub"]
    ui_draw.text((card_x + 35, card_y + 74), sub_text, font=font_sub, fill=(226, 232, 240, 255))
    
    # Pre-composite UI onto background for vertical scenes
    if not is_landscape:
        bg_with_ui = Image.alpha_composite(bg_blurred, ui_overlay)
        base_bgr = cv2.cvtColor(np.array(bg_with_ui), cv2.COLOR_RGBA2BGR)
        
        # Prepare Foreground with rounded mask & shadow
        fg_h = 750
        fg_w = int(im.width * (fg_h / im.height))
        fg_img = im.resize((fg_w, fg_h), Image.Resampling.BILINEAR)
        
        radius = 22
        mask = Image.new('L', (fg_w, fg_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, fill=255)
        
        spad = 30
        shadow = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([(spad, spad), (fg_w + spad, fg_h + spad)], radius=radius, fill=(0, 0, 0, 160))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=18))
        
        b_img = Image.new('RGBA', (fg_w, fg_h), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(b_img)
        b_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, outline=(255, 255, 255, 70), width=2)
        
        fg_comp = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
        fg_comp.paste(shadow, (0, 0), shadow)
        fg_comp.paste(fg_img, (spad, spad), mask)
        fg_comp.paste(b_img, (spad, spad), b_img)
        
        fg_comp_np = np.array(fg_comp)
        fg_bgr = cv2.cvtColor(fg_comp_np[:, :, :3], cv2.COLOR_RGB2BGR)
        fg_alpha = (fg_comp_np[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
        
        scene_assets.append({
            "is_landscape": False,
            "base_bgr": base_bgr,
            "fg_bgr": fg_bgr,
            "fg_alpha": fg_alpha,
            "num_frames": int(round(sc["dur"] * FPS)),
            "motion": sc["motion"],
            "spad": spad
        })
    else:
        # Landscape full frame
        scale = max(WIDTH / iw, HEIGHT / ih)
        nw, nh = int(iw * scale), int(ih * scale)
        fg_scaled = im.resize((nw, nh), Image.Resampling.BILINEAR)
        fg_np = np.array(fg_scaled)
        
        # UI overlay pre-rendered
        ui_np = np.array(ui_overlay)
        ui_alpha = (ui_np[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
        ui_bgr = cv2.cvtColor(ui_np[:, :, :3], cv2.COLOR_RGB2BGR)
        
        scene_assets.append({
            "is_landscape": True,
            "fg_rgba": fg_np,
            "ui_bgr": ui_bgr,
            "ui_alpha": ui_alpha,
            "num_frames": int(round(sc["dur"] * FPS)),
            "motion": sc["motion"]
        })

print(f"Prepared {len(scene_assets)} scene assets.")

# Pre-generate floating particles
NUM_PARTICLES = 35
particles = []
for _ in range(NUM_PARTICLES):
    particles.append({
        "x": random.uniform(50, WIDTH - 50),
        "y": random.uniform(0, HEIGHT),
        "r": random.randint(2, 5),
        "vy": random.uniform(0.5, 1.3),
        "color": (random.randint(140, 190), random.randint(220, 255), random.randint(140, 200))
    })

def render_frame_fast(asset, progress, global_f):
    if not asset["is_landscape"]:
        frame = asset["base_bgr"].copy()
        
        motion = asset["motion"]
        if motion == "zoom_in":
            scale = 1.0 + 0.05 * progress
            y_shift = int((progress - 0.5) * -10)
        elif motion == "zoom_out":
            scale = 1.05 - 0.05 * progress
            y_shift = int((progress - 0.5) * 10)
        elif motion == "pan_up":
            scale = 1.025
            y_shift = int((0.5 - progress) * 20)
        else: # pan_down
            scale = 1.025
            y_shift = int((progress - 0.5) * 20)
            
        fg_bgr = asset["fg_bgr"]
        fg_alpha = asset["fg_alpha"]
        fh, fw = fg_bgr.shape[:2]
        
        cur_w = int(fw * scale)
        cur_h = int(fh * scale)
        
        fg_s = cv2.resize(fg_bgr, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
        alpha_s = cv2.resize(fg_alpha, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)[:, :, np.newaxis]
        
        target_x = (WIDTH - cur_w) // 2
        target_y = 110 + y_shift - asset["spad"]
        
        x1 = max(0, target_x)
        y1 = max(0, target_y)
        x2 = min(WIDTH, target_x + cur_w)
        y2 = min(HEIGHT, target_y + cur_h)
        
        src_x1 = x1 - target_x
        src_y1 = y1 - target_y
        src_x2 = src_x1 + (x2 - x1)
        src_y2 = src_y1 + (y2 - y1)
        
        if x2 > x1 and y2 > y1:
            roi = frame[y1:y2, x1:x2].astype(np.float32)
            fg_crop = fg_s[src_y1:src_y2, src_x1:src_x2].astype(np.float32)
            a_crop = alpha_s[src_y1:src_y2, src_x1:src_x2]
            blended = (roi * (1.0 - a_crop) + fg_crop * a_crop)
            frame[y1:y2, x1:x2] = blended.astype(np.uint8)
    else:
        # Landscape
        fg_rgba = asset["fg_rgba"]
        fh, fw = fg_rgba.shape[:2]
        max_shift = fw - WIDTH
        shift_x = int(progress * max_shift)
        frame_rgb = fg_rgba[:HEIGHT, shift_x:shift_x + WIDTH, :3]
        frame = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
        
        # Vignette at bottom
        vignette = np.linspace(0, 140, 220, dtype=np.float32)[:, np.newaxis, np.newaxis]
        roi_bottom = frame[HEIGHT - 220:HEIGHT, :].astype(np.float32)
        frame[HEIGHT - 220:HEIGHT, :] = np.clip(roi_bottom - vignette, 0, 255).astype(np.uint8)
        
        # UI overlay
        ui_bgr = asset["ui_bgr"]
        ui_alpha = asset["ui_alpha"]
        frame = (frame.astype(np.float32) * (1.0 - ui_alpha) + ui_bgr.astype(np.float32) * ui_alpha).astype(np.uint8)

    # Particle dots
    for p in particles:
        px = int((p["x"] + math.sin(global_f * 0.03 + p["r"]) * 18) % WIDTH)
        py = int((p["y"] - global_f * p["vy"]) % HEIGHT)
        cv2.circle(frame, (px, py), p["r"], p["color"], -1)
        
    return frame

print("Setting up FFmpeg rendering process...")
ffmpeg_cmd = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}',
    '-pix_fmt', 'bgr24',
    '-r', str(FPS),
    '-i', '-',
    '-i', AUDIO_PATH,
    '-filter_complex', '[1:a]afade=t=in:st=0:d=1.5,afade=t=out:st=208.5:d=4.0[a]',
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '320k',
    '-shortest',
    OUT_WORKSPACE
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

total_frames = sum(s["num_frames"] for s in scene_assets)
print(f"Total video frames: {total_frames} ({total_frames / FPS:.2f}s)")

t0 = time.time()
global_f = 0

for s_idx, asset in enumerate(scene_assets):
    n_frames = asset["num_frames"]
    next_asset = scene_assets[s_idx + 1] if s_idx + 1 < len(scene_assets) else None
    
    for f in range(n_frames):
        prog = f / max(1, n_frames - 1)
        cur_frame = render_frame_fast(asset, prog, global_f)
        
        frames_left = n_frames - f
        if frames_left <= TRANSITION_FRAMES and next_asset is not None:
            t_prog = 1.0 - (frames_left / TRANSITION_FRAMES)
            next_frame = render_frame_fast(next_asset, 0.0, global_f)
            final_frame = cv2.addWeighted(cur_frame, 1.0 - t_prog, next_frame, t_prog, 0)
        else:
            final_frame = cur_frame
            
        proc.stdin.write(final_frame.tobytes())
        global_f += 1
        
        if global_f % 300 == 0 or global_f == total_frames:
            el = time.time() - t0
            cur_fps = global_f / max(0.1, el)
            pct = (global_f / total_frames) * 100
            eta = (total_frames - global_f) / cur_fps
            print(f"  [Rendering] {global_f}/{total_frames} ({pct:.1f}%) | Speed: {cur_fps:.1f} FPS | ETA: {eta:.1f}s")

proc.stdin.close()
proc.wait()

print(f"Encoding complete in {time.time() - t0:.2f}s!")

# Copy to KakaoTalk folder
import shutil
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO)
print(f"Saved: {OUT_WORKSPACE}")
print(f"Saved: {OUT_KAKAO}")
