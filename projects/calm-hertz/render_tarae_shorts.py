import os, sys, math, random, subprocess, time, shutil
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter
import cv2

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

LOCAL_AUDIO = r"C:\Users\황태민\Documents\antigravity\calm-hertz\장터의 노래.mp3"
IMG_DIR = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능"
OUT_WORKSPACE = r"C:\Users\황태민\Documents\antigravity\calm-hertz\다래의효능_쇼츠_영상.mp4"
OUT_KAKAO = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능_쇼츠_영상.mp4"

WIDTH, HEIGHT = 1080, 1920
FPS = 30
TRANSITION_SEC = 0.4
TRANSITION_FRAMES = int(TRANSITION_SEC * FPS)

FONT_DOHYEON = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\DoHyeon.ttf"
FONT_JUA = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\Jua.ttf"

f_top_badge = ImageFont.truetype(FONT_DOHYEON, 26)
f_tag = ImageFont.truetype(FONT_DOHYEON, 22)
f_card_title = ImageFont.truetype(FONT_DOHYEON, 36)
f_card_sub = ImageFont.truetype(FONT_JUA, 24)
f_item_title = ImageFont.truetype(FONT_DOHYEON, 24)
f_item_desc = ImageFont.truetype(FONT_JUA, 20)

# 12 Core High-Impact Scenes for 58s YouTube Shorts (Optimal Retention)
SHORTS_SCENES = [
    {
        "img": "KakaoTalk_20260829_181618045_19.jpg",
        "tag": "핵심 효능 01",
        "title": "동의보감이 극찬한 토종 다래",
        "sub": "조선 왕실이 사랑한 백두대간의 천연 슈퍼푸드",
        "bullets": [
            ("★ 동의보감 속 미후도", "몸의 열을 내리고 갈증을 멎게 하는 명약 기록"),
            ("★ 털 없는 껍질 구조", "껍질 속 플라보노이드와 펙틴을 통째로 섭취"),
            ("★ 100% 무농약 자생력", "깊은 산골의 정기만으로 맺힌 순수 자연산 열매")
        ],
        "dur": 4.8, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_20.jpg",
        "tag": "핵심 효능 02",
        "title": "사과의 20배! 천연 비타민 C",
        "sub": "지친 몸에 활력을 불어넣는 비타민 폭탄",
        "bullets": [
            ("● 압도적 비타민 C 함량", "사과의 20배, 레몬의 3배 이상 고농축 함유"),
            ("● 천연 유기 복합체", "합성 비타민과 달리 위장 자극 없이 완벽 흡수"),
            ("● 만성 피로 급속 해소", "피로 물질 젖산을 분해하여 에너지 즉각 충전")
        ],
        "dur": 4.8, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_11.jpg",
        "tag": "핵심 효능 03",
        "title": "식약처 인정 면역물질 PG102",
        "sub": "과민성 면역 불균형을 바로잡는 첨단 바이오 과학",
        "bullets": [
            ("● 식약처 공식 개별인정", "면역과민반응 개선 기능성 원료 인정 획득"),
            ("● IgE 알레르기 항체 억제", "체내 과도한 알레르기 반응 수치를 현저히 감소"),
            ("● 전신 염증 수치 안정화", "염증 유발 사이토카인을 억제해 면역 밸런스 회복")
        ],
        "dur": 4.8, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_16.jpg",
        "tag": "핵심 효능 04",
        "title": "비염 & 천식 호흡기 케어",
        "sub": "환절기 코막힘과 발작적 재채기 완벽 진정",
        "bullets": [
            ("● 비강 점막 염증 진정", "꽃가루, 미세먼지로 붓고 헐은 코 점막 안정"),
            ("● 히스타민 분비 차단", "콧물, 재채기를 유발하는 히스타민 방출 억제"),
            ("● 기관지 근육 이완", "기도 과민성을 낮추어 편안하고 깊은 호흡 유도")
        ],
        "dur": 4.8, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_10.jpg",
        "tag": "핵심 효능 05",
        "title": "아토피 피부염 & 가려움 해소",
        "sub": "피부 속 만성 염증을 정화하여 편안한 숙면",
        "bullets": [
            ("★ 야간 가려움 신호 차단", "밤마다 긁게 만드는 가려움 유발 펩타이드 억제"),
            ("★ 피부 지질 장벽 재건", "건조하고 갈라진 피부 유수분 보호막 복원"),
            ("★ 순수 식물성 안전 성분", "스테로이드 내성 걱정 없이 피부 속 염증 정화")
        ],
        "dur": 4.8, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_17.jpg",
        "tag": "핵심 효능 06",
        "title": "단백질 분해 효소 액티니딘",
        "sub": "고기 먹은 후 더부룩함을 싹 씻어주는 천연 소화제",
        "bullets": [
            ("● 강력한 육류 단백질 분해", "음식물 소화 시간을 단축해 속을 편안하게"),
            ("● 복부 팽만감 & 가스 해소", "식후 더부룩함과 신트림을 단시간 내에 해결"),
            ("● 위벽 자극 없는 소화", "위산 과다 없이 부드럽게 소화 흡수를 촉진")
        ],
        "dur": 4.8, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045.jpg",
        "tag": "핵심 효능 07",
        "title": "지독한 변비 탈출 & 쾌변",
        "sub": "대장 연동 운동을 살려 매일 아침 가볍게",
        "bullets": [
            ("● 수용성·불용성 식이섬유", "장내 수분을 끌어당겨 부드러운 황금변 유도"),
            ("● 천연 펙틴의 흡착 배출", "장벽 주름 속 묵은 숙변과 노폐물 완벽 배출"),
            ("● 규칙적 배변 리듬 복원", "약물 의존 없이 장 본연의 건강한 연동 운동 회복")
        ],
        "dur": 4.8, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_01.jpg",
        "tag": "핵심 효능 08",
        "title": "장내 100조 개 유익균 살리기",
        "sub": "면역의 70%를 지키는 천연 프리바이오틱스",
        "bullets": [
            ("● 유익균 폭발적 증식", "비피더스균과 유산균이 좋아하는 먹이 풍부"),
            ("● 장누수증후군 철벽 차단", "장 점막을 튼튼하게 결합하여 독소 유입 방지"),
            ("● 행복 호르몬 세로토닌", "장 건강을 개선하여 기분과 수면의 질 향상")
        ],
        "dur": 4.8, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_05.jpg",
        "tag": "핵심 효능 09",
        "title": "혈관 청소 & 콜레스테롤 억제",
        "sub": "피를 맑게 하여 심혈관 질환을 예방",
        "bullets": [
            ("● 나쁜 LDL 콜레스테롤 배출", "혈관벽 기름때를 흡착하여 체외 배출"),
            ("● 혈전(피떡) 형성 방지", "혈액의 끈적거림을 없애고 맑은 혈류 유지"),
            ("● 동맥 탄력성 복원", "혈관 노화를 막아 심근경색·뇌졸중 철벽 예방")
        ],
        "dur": 4.8, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_03.jpg",
        "tag": "핵심 효능 10",
        "title": "콜라겐 200% 합성 & 동안 피부",
        "sub": "진피층부터 차오르는 탄력과 맑은 백옥 피부",
        "bullets": [
            ("● 진피층 콜라겐 합성 촉진", "섬유아세포를 자극하여 탱탱한 피부 탄력"),
            ("● 기미·잡티 멜라닌 억제", "색소 침착을 방어하여 밝고 투명한 안색 완성"),
            ("● 천연 보습 인자 강화", "속당김 없이 하루 종일 촉촉한 물광 피부")
        ],
        "dur": 4.8, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_07.jpg",
        "tag": "핵심 효능 11",
        "title": "간 기능 재생 & 숙취 해독",
        "sub": "아스파라긴산이 알코올 독소를 신속 정화",
        "bullets": [
            ("● 아세트알데히드 초고속 분해", "음주 후 두통, 갈증, 메스꺼움 완벽 해결"),
            ("● 간 효소 수치 안정화", "피로와 음주로 지친 간세포의 염증 진정"),
            ("● 만성 간 피로 즉각 해소", "간 해독을 도와 아침에 가뿐하게 일어남")
        ],
        "dur": 4.8, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_15.jpg",
        "tag": "핵심 효능 12",
        "title": "대자연이 선사한 온 가족 보약",
        "sub": "남녀노소 누구나 매일 즐기는 활력의 샘",
        "bullets": [
            ("★ 완벽한 천연 영양 밸런스", "비타민, 미네랄, 항산화제가 총망라된 슈퍼푸드"),
            ("★ 사계절 무병장수 지킴이", "환절기 감기와 잔병치레 없는 강력한 면역 체질"),
            ("★ 늘 건강과 행복이 가득하세요!", "깊고 풍부한 토종 다래로 건강한 하루를 선물하세요!")
        ],
        "dur": 5.2, "motion": "zoom_out"
    }
]

SHORTS_LEN = 58.0  # Perfect 58s YouTube Shorts
total_dur = sum(s["dur"] for s in SHORTS_SCENES)
for s in SHORTS_SCENES:
    s["dur"] = (s["dur"] / total_dur) * SHORTS_LEN

print(f"Total Shorts duration: {SHORTS_LEN:.2f}s ({len(SHORTS_SCENES)} scenes)")

def wrap_korean_text(text, font, max_w):
    words = text.split(' ')
    lines = []
    cur = ''
    for w in words:
        test = (cur + ' ' + w).strip()
        bbox = font.getbbox(test)
        if (bbox[2] - bbox[0]) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

print("Pre-rendering vertical Shorts assets (1080x1920)...")
scene_assets = []

# Upper photo bounds: y = 130 to y = 980 (h=850)
photo_stage_y = 130
photo_stage_h = 850
photo_center_x = WIDTH // 2

# Lower card bounds: y = 1005 to y = 1845 (h=840)
card_x = 55
card_y = 1005
card_w = WIDTH - 110  # 970px
card_h = 840

strip_box_x = card_x + 35
strip_box_y = card_y + 155
strip_box_w = card_w - 70  # 900px
strip_box_h = card_h - 180  # 660px

for idx, sc in enumerate(SHORTS_SCENES):
    raw_path = os.path.join(IMG_DIR, sc["img"])
    im_raw = Image.open(raw_path)
    im = ImageOps.exif_transpose(im_raw).convert("RGBA")
    
    # 1. Base Vertical Blurred Background
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
    bg_blurred = bg_blurred.filter(ImageFilter.GaussianBlur(radius=45))
    dark_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (6, 12, 9, 210))
    bg_blurred = Image.alpha_composite(bg_blurred, dark_overlay)
    
    # 2. Top Header Pill Badge
    top_badge_text = "★ 자연이 빚은 보약 | 토종 다래의 효능"
    tb_bbox = f_top_badge.getbbox(top_badge_text)
    tb_w = (tb_bbox[2] - tb_bbox[0]) + 44
    tb_h = 52
    tb_x = (WIDTH - tb_w) // 2
    tb_y = 48
    
    rc_top = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    tb_draw = ImageDraw.Draw(rc_top)
    tb_draw.rounded_rectangle([(tb_x, tb_y), (tb_x + tb_w, tb_y + tb_h)], radius=26, fill=(12, 17, 14, 230), outline=(255, 255, 255, 45), width=1)
    tb_draw.text((tb_x + 22, tb_y + 11), top_badge_text, font=f_top_badge, fill=(253, 224, 71, 255))
    
    # 3. Upper Photo Card Stage
    fg_h = photo_stage_h
    fg_w = int(im.width * (fg_h / im.height))
    if fg_w > WIDTH - 120:
        fg_w = WIDTH - 120
        fg_h = int(im.height * (fg_w / im.width))
        
    fg_img = im.resize((fg_w, fg_h), Image.Resampling.BILINEAR)
    
    radius = 28
    mask = Image.new('L', (fg_w, fg_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, fill=255)
    
    spad = 30
    shadow = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([(spad, spad), (fg_w + spad, fg_h + spad)], radius=radius, fill=(0, 0, 0, 220))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=25))
    
    b_img = Image.new('RGBA', (fg_w, fg_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(b_img)
    b_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, outline=(255, 255, 255, 50), width=1)
    
    fg_comp = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
    fg_comp.paste(shadow, (0, 0), shadow)
    fg_comp.paste(fg_img, (spad, spad), mask)
    fg_comp.paste(b_img, (spad, spad), b_img)
    
    fg_comp_np = np.array(fg_comp)
    fg_bgr = cv2.cvtColor(fg_comp_np[:, :, :3], cv2.COLOR_RGB2BGR)
    fg_alpha = (fg_comp_np[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
    
    # 4. Lower Frosted Glass Card Base
    rc_draw = ImageDraw.Draw(rc_top)
    rc_draw.rounded_rectangle([(card_x, card_y), (card_x + card_w, card_y + card_h)], radius=30, fill=(12, 17, 14, 240), outline=(255, 255, 255, 35), width=1)
    
    # Category Tag Badge
    tag_text = sc["tag"]
    tag_bbox = f_tag.getbbox(tag_text)
    tag_w = (tag_bbox[2] - tag_bbox[0]) + 28
    tag_h = 38
    rc_draw.rounded_rectangle([(card_x + 35, card_y + 26), (card_x + 35 + tag_w, card_y + 26 + tag_h)], radius=19, fill=(245, 158, 11, 235))
    rc_draw.text((card_x + 49, card_y + 32), tag_text, font=f_tag, fill=(15, 23, 18, 255))
    
    # Main Headline
    rc_draw.text((card_x + 35 + tag_w + 16, card_y + 24), sc["title"], font=f_card_title, fill=(255, 255, 255, 255))
    
    # Divider Line
    rc_draw.line([(card_x + 35, card_y + 78), (card_x + card_w - 35, card_y + 78)], fill=(255, 255, 255, 35), width=1)
    
    # Subtitle
    rc_draw.text((card_x + 35, card_y + 94), sc["sub"], font=f_card_sub, fill=(203, 213, 225, 255))
    
    static_frame_rgba = Image.alpha_composite(bg_blurred, rc_top)
    static_frame_bgr = cv2.cvtColor(np.array(static_frame_rgba), cv2.COLOR_RGBA2BGR)
    
    # 5. Pre-render Scrolling Subtitle Cards
    bullets = sc["bullets"]
    strip_w = strip_box_w
    max_desc_w = strip_w - 48
    
    card_items = []
    total_content_h = 0
    for b_title, b_desc in bullets:
        desc_lines = wrap_korean_text(b_desc, f_item_desc, max_desc_w)
        c_h = 12 + 28 + 6 + len(desc_lines) * 26 + 12
        card_items.append({
            "title": b_title,
            "lines": desc_lines,
            "height": c_h
        })
        total_content_h += c_h + 14
        
    pad_top = 10
    pad_bot = 120
    total_strip_h = max(strip_box_h + 260, pad_top + total_content_h + pad_bot)
    
    strip_img = Image.new('RGB', (strip_w, total_strip_h), (12, 17, 14))
    st_draw = ImageDraw.Draw(strip_img)
    
    cur_y = pad_top
    for ci in card_items:
        ch = ci["height"]
        st_draw.rounded_rectangle([(0, cur_y), (strip_w, cur_y + ch)], radius=16, fill=(20, 28, 23), outline=(255, 255, 255, 25), width=1)
        st_draw.text((24, cur_y + 12), ci["title"], font=f_item_title, fill=(253, 224, 71))
        line_y = cur_y + 44
        for l in ci["lines"]:
            st_draw.text((24, line_y), l, font=f_item_desc, fill=(241, 245, 249))
            line_y += 26
        cur_y += ch + 14
        
    strip_bgr = cv2.cvtColor(np.array(strip_img), cv2.COLOR_RGB2BGR)
    
    max_scroll = total_strip_h - strip_box_h
    if max_scroll < 0:
        max_scroll = 0
        
    scene_assets.append({
        "static_bgr": static_frame_bgr,
        "fg_bgr": fg_bgr,
        "fg_alpha": fg_alpha,
        "fg_x": photo_center_x - fg_w // 2,
        "fg_y_center": photo_stage_y + (photo_stage_h - fg_h) // 2,
        "spad": spad,
        "strip_bgr": strip_bgr,
        "max_scroll": max_scroll,
        "num_frames": int(round(sc["dur"] * FPS)),
        "motion": sc["motion"]
    })

print(f"Prepared {len(scene_assets)} Shorts scene assets.")

# =========================================================================
# 3D FLOATING BOKEH SPRITES (VERTICAL FORMAT)
# =========================================================================
print("Generating 3D floating bokeh & particles for vertical canvas...")

def make_bokeh_sprite(radius, color, alpha_center=0.45):
    size = radius * 4
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2
    r_outer = radius * 2
    
    for r in range(r_outer, 0, -2):
        f = 1.0 - (r / r_outer)
        cur_alpha = int(alpha_center * 255 * (f ** 2.2))
        draw.ellipse([(center - r, center - r), (center + r, center + r)], fill=(color[0], color[1], color[2], cur_alpha))
        
    img = img.filter(ImageFilter.GaussianBlur(radius=max(1.0, radius * 0.35)))
    arr = np.array(img)
    bgr = cv2.cvtColor(arr[:, :, :3], cv2.COLOR_RGB2BGR)
    alpha = (arr[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
    return bgr, alpha, size

SPRITES = [
    make_bokeh_sprite(45, (253, 230, 138), 0.22),
    make_bokeh_sprite(30, (253, 224, 71), 0.35),
    make_bokeh_sprite(16, (254, 240, 138), 0.55),
    make_bokeh_sprite(38, (167, 243, 208), 0.20),
    make_bokeh_sprite(22, (110, 231, 183), 0.38),
    make_bokeh_sprite(12, (209, 250, 229), 0.60),
    make_bokeh_sprite(7, (255, 255, 255), 0.85),
    make_bokeh_sprite(4, (255, 255, 240), 0.90)
]

random.seed(42)
PARTICLES = []
for i in range(40):
    layer = random.choices([0, 1, 2], weights=[0.45, 0.35, 0.20])[0]
    
    if layer == 0:
        s_idx = random.choice([6, 7])
        vy = random.uniform(0.8, 1.6)
        amp = random.uniform(10, 20)
        freq = random.uniform(0.02, 0.04)
    elif layer == 1:
        s_idx = random.choice([2, 5])
        vy = random.uniform(0.5, 1.1)
        amp = random.uniform(20, 35)
        freq = random.uniform(0.015, 0.03)
    else:
        s_idx = random.choice([0, 1, 3, 4])
        vy = random.uniform(0.3, 0.7)
        amp = random.uniform(30, 50)
        freq = random.uniform(0.01, 0.02)
        
    PARTICLES.append({
        "x": random.uniform(0, WIDTH),
        "y": random.uniform(0, HEIGHT),
        "s_idx": s_idx,
        "vy": vy,
        "amp": amp,
        "freq": freq,
        "phase": random.uniform(0, math.pi * 2),
        "pulse_speed": random.uniform(0.04, 0.08)
    })

def render_shorts_frame(asset, progress, global_f, overall_progress):
    frame = asset["static_bgr"].copy()
    
    # 1. Upper Photo Ken Burns Motion
    motion = asset["motion"]
    if motion == "zoom_in":
        scale = 1.0 + 0.04 * progress
        y_shift = int((progress - 0.5) * -6)
    elif motion == "zoom_out":
        scale = 1.04 - 0.04 * progress
        y_shift = int((progress - 0.5) * 6)
    elif motion == "pan_up":
        scale = 1.02
        y_shift = int((0.5 - progress) * 12)
    else: # pan_down
        scale = 1.02
        y_shift = int((progress - 0.5) * 12)
        
    fg_bgr = asset["fg_bgr"]
    fg_alpha = asset["fg_alpha"]
    fh, fw = fg_bgr.shape[:2]
    
    cur_w = int(fw * scale)
    cur_h = int(fh * scale)
    
    fg_s = cv2.resize(fg_bgr, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
    alpha_s = cv2.resize(fg_alpha, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)[:, :, np.newaxis]
    
    target_x = asset["fg_x"] - (cur_w - fw) // 2
    target_y = asset["fg_y_center"] + y_shift - asset["spad"]
    
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
        frame[y1:y2, x1:x2] = (roi * (1.0 - a_crop) + fg_crop * a_crop).astype(np.uint8)

    # 2. Lower Card: Upward Scrolling Subtitles Animation
    scroll_y = int(progress * asset["max_scroll"])
    strip_bgr = asset["strip_bgr"]
    
    frame[strip_box_y : strip_box_y + strip_box_h, strip_box_x : strip_box_x + strip_box_w] = strip_bgr[scroll_y : scroll_y + strip_box_h, :]

    # 3. High Quality Floating Bokeh Particles
    for p in PARTICLES:
        px = int(p["x"] + math.sin(global_f * p["freq"] + p["phase"]) * p["amp"]) % WIDTH
        py = int(p["y"] - global_f * p["vy"]) % HEIGHT
        
        s_bgr, s_alpha, sz = SPRITES[p["s_idx"]]
        half_sz = sz // 2
        
        pulse = 0.8 + 0.2 * math.sin(global_f * p["pulse_speed"] + p["phase"])
        
        bx1 = px - half_sz
        by1 = py - half_sz
        bx2 = bx1 + sz
        by2 = by1 + sz
        
        rx1 = max(0, bx1)
        ry1 = max(0, by1)
        rx2 = min(WIDTH, bx2)
        ry2 = min(HEIGHT, by2)
        
        if rx2 > rx1 and ry2 > ry1:
            sx1 = rx1 - bx1
            sy1 = ry1 - by1
            sx2 = sx1 + (rx2 - rx1)
            sy2 = sy1 + (ry2 - ry1)
            
            roi_p = frame[ry1:ry2, rx1:rx2].astype(np.float32)
            sprite_crop = s_bgr[sy1:sy2, sx1:sx2].astype(np.float32)
            alpha_crop = s_alpha[sy1:sy2, sx1:sx2] * pulse
            
            frame[ry1:ry2, rx1:rx2] = (roi_p * (1.0 - alpha_crop) + sprite_crop * alpha_crop).astype(np.uint8)

    # 4. Live Bottom Gold Progress Bar (Shorts Retention Booster)
    bar_y = 1880
    bar_h = 8
    bar_w = int(WIDTH * overall_progress)
    cv2.rectangle(frame, (0, bar_y), (WIDTH, bar_y + bar_h), (30, 40, 35), -1)
    if bar_w > 0:
        cv2.rectangle(frame, (0, bar_y), (bar_w, bar_y + bar_h), (71, 224, 253), -1)  # BGR for Gold/Yellow
        
    return frame

print("Setting up FFmpeg rendering process for Shorts master video...")
total_frames = sum(s["num_frames"] for s in scene_assets)

ffmpeg_cmd = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}',
    '-pix_fmt', 'bgr24',
    '-r', str(FPS),
    '-i', '-',
    '-ss', '0',
    '-t', str(SHORTS_LEN),
    '-i', LOCAL_AUDIO,
    '-filter_complex', f'[1:a]afade=t=in:st=0:d=1.0,afade=t=out:st={SHORTS_LEN - 2.5}:d=2.5[a]',
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
print(f"Total Shorts frames: {total_frames} ({total_frames / FPS:.2f}s)")

t0 = time.time()
global_f = 0

for s_idx, asset in enumerate(scene_assets):
    n_frames = asset["num_frames"]
    next_asset = scene_assets[s_idx + 1] if s_idx + 1 < len(scene_assets) else None
    
    for f in range(n_frames):
        prog = f / max(1, n_frames - 1)
        overall_prog = global_f / max(1, total_frames - 1)
        cur_frame = render_shorts_frame(asset, prog, global_f, overall_prog)
        
        frames_left = n_frames - f
        if frames_left <= TRANSITION_FRAMES and next_asset is not None:
            t_prog = 1.0 - (frames_left / TRANSITION_FRAMES)
            next_frame = render_shorts_frame(next_asset, 0.0, global_f, overall_prog)
            final_frame = cv2.addWeighted(cur_frame, 1.0 - t_prog, next_frame, t_prog, 0)
        else:
            final_frame = cur_frame
            
        proc.stdin.write(final_frame.tobytes())
        global_f += 1
        
        if global_f % 200 == 0 or global_f == total_frames:
            el = time.time() - t0
            cur_fps = global_f / max(0.1, el)
            pct = (global_f / total_frames) * 100
            eta = (total_frames - global_f) / cur_fps
            print(f"  [Shorts Rendering] {global_f}/{total_frames} ({pct:.1f}%) | Speed: {cur_fps:.1f} FPS | ETA: {eta:.1f}s")

proc.stdin.close()
proc.wait()

print(f"Shorts encoding complete in {time.time() - t0:.2f}s!")

# Copy to KakaoTalk folder
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO)
print(f"Saved: {OUT_WORKSPACE}")
print(f"Saved: {OUT_KAKAO}")
