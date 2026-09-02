import os, sys, math, random, subprocess, time, shutil
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter
import cv2

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

LOCAL_AUDIO = r"C:\Users\황태민\Documents\antigravity\calm-hertz\종이비행기_항해_완곡_음원.wav"
IMG_DIR = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능"
OUT_WORKSPACE = r"C:\Users\황태민\Documents\antigravity\calm-hertz\다래의효능_상세자막_완성영상.mp4"
OUT_KAKAO_1 = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능_상세자막_영상.mp4"
OUT_KAKAO_MAIN = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능_영상.mp4"

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TRANSITION_SEC = 0.5
TRANSITION_FRAMES = int(TRANSITION_SEC * FPS)

FONT_DOHYEON = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\DoHyeon.ttf"
FONT_JUA = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\Jua.ttf"

f_header = ImageFont.truetype(FONT_DOHYEON, 23)
f_tag = ImageFont.truetype(FONT_DOHYEON, 19)
f_card_title = ImageFont.truetype(FONT_DOHYEON, 35)
f_card_sub = ImageFont.truetype(FONT_JUA, 24)
f_item_title = ImageFont.truetype(FONT_DOHYEON, 24)
f_item_desc = ImageFont.truetype(FONT_JUA, 20)

# 21 Scenes: 100% Focused EXCLUSIVELY on Health Benefits & Nutritional Science
SCENES = [
  {
    "img": "KakaoTalk_20260829_181618045_19.jpg",
    "tag": "다래의 효능 01",
    "title": "동의보감이 인정한 토종 슈퍼푸드",
    "sub": "깊은 숲속의 신비로운 생명력을 품은 천연 보약",
    "bullets": [
      ("★ 동의보감 속 미후도(獼猴桃)", "성질이 서늘하여 몸의 열을 내리고 갈증과 번열을 즉각 해소"),
      ("★ 한국 자생 토종 과일", "오염되지 않은 깊은 산골에서 자라 유효 약리 성분이 압도적"),
      ("★ 껍질째 먹는 천연 보약", "털이 없어 껍질 속 풍부한 플라보노이드와 펙틴을 통째로 흡수")
    ],
    "dur": 9.0, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_20.jpg",
    "tag": "다래의 효능 02",
    "title": "사과의 20배! 천연 비타민 C 폭탄",
    "sub": "활력을 깨우고 지친 면역 체계를 급속 충전",
    "bullets": [
      ("● 압도적인 비타민 C 함량", "사과의 20배, 레몬의 3배 이상 풍부한 천연 유기 비타민 C"),
      ("● 체내 흡수율 극대화", "합성 비타민과 달리 천연 유기산과 결합되어 생체 이용률 최상"),
      ("● 백혈구 면역력 활성화", "외부 바이러스와 유해 세균을 물리치는 면역 방어벽 구축")
    ],
    "dur": 8.5, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_11.jpg",
    "tag": "다래의 효능 03",
    "title": "식약처 인정 면역 조절 물질 PG102",
    "sub": "과민성 면역 불균형을 바로잡는 기적의 성분",
    "bullets": [
      ("✔ 면역 밸런스 정상화", "Th1과 Th2 면역 세포의 균형을 조절하여 과민 반응 억제"),
      ("✔ 식약처 개별인정형 원료", "다래 추출물 PG102는 과학적으로 검증된 면역 기능성 물질"),
      ("✔ 자가면역 질환 완화", "체내 과도한 염증 물질 생성을 차단하여 전신 건강 증진")
    ],
    "dur": 8.5, "motion": "pan_up"
  },
  {
    "img": "KakaoTalk_20260829_181618045_16.jpg",
    "tag": "다래의 효능 04",
    "title": "지긋지긋한 알레르기 비염 & 천식 완화",
    "sub": "환절기 코막힘, 재채기, 맑은 콧물 완벽 진정",
    "bullets": [
      ("● 히스타민 분비 강력 억제", "알레르기 반응을 유발하는 IgE 항체 생성을 억제하여 비염 완화"),
      ("● 호흡기 점막 염증 진정", "기관지와 비강 점막의 붓기를 가라앉혀 편안한 호흡 유도"),
      ("● 천식 발작 빈도 감소", "기도 염증을 완화하여 만성 기침과 쌕쌕거림 개선")
    ],
    "dur": 8.5, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_10.jpg",
    "tag": "다래의 효능 05",
    "title": "아토피 피부염 & 만성 가려움증 개선",
    "sub": "피부 속 염증을 다스려 가려움 없이 편안한 피부",
    "bullets": [
      ("★ 가려움 유발 인자 차단", "혈중 염증 매개 물질을 낮춰 밤잠을 설치는 극심한 가려움 억제"),
      ("★ 피부 장벽 강화", "피부 보습막을 복원하여 외부 자극에 강한 건강한 피부 유지"),
      ("★ 소아 및 성인 아토피 완화", "부작용 없는 천연 성분으로 온 가족 피부 면역력 강화")
    ],
    "dur": 9.0, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_17.jpg",
    "tag": "다래의 효능 06",
    "title": "천연 단백질 분해 효소 액티니딘",
    "sub": "고기 먹은 후 더부룩함을 싹 없애주는 천연 소화제",
    "bullets": [
      ("● 강력한 육류 단백질 분해", "위장 내 섭취된 고기와 단백질을 미세 분자로 신속히 분해"),
      ("● 소화불량 및 복부 팽만 해소", "식후 속 쓰림, 가스 참, 더부룩함을 즉각적으로 완화"),
      ("● 위장 점막 보호", "위산 과다를 조절하고 위장벽을 보호하여 편안한 소화 환경 조성")
    ],
    "dur": 9.0, "motion": "pan_down"
  },
  {
    "img": "KakaoTalk_20260829_181618045.jpg",
    "tag": "다래의 효능 07",
    "title": "숙변 완벽 제거 & 지독한 변비 탈출",
    "sub": "장 연동 운동을 촉진하는 풍부한 천연 식이섬유",
    "bullets": [
      ("✔ 불용성 & 수용성 식이섬유", "장내 대변 부피를 늘리고 부드럽게 만들어 쾌변을 유도"),
      ("✔ 천연 펙틴(Pectin) 성분", "장벽에 쌓인 묵은 숙변과 유해 노폐물을 흡착해 배출"),
      ("✔ 장 연동 운동 촉진", "장의 자연스러운 수축 이완을 도와 약 없이도 상쾌한 아침")
    ],
    "dur": 8.5, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_01.jpg",
    "tag": "다래의 효능 08",
    "title": "장내 마이크로바이옴 & 유익균 증식",
    "sub": "면역의 핵심 70%가 모여있는 장 건강 완벽 케어",
    "bullets": [
      ("● 프리바이오틱스 역할", "비피더스균, 유산균 등 장내 유익균의 최고 영양 공급원"),
      ("● 유해균 및 장내 독소 억제", "장내 부패균 증식을 차단하여 가스 발생과 복부 팽만 예방"),
      ("● 장 면역 세포 활성화", "장 점막 면역 글로불린(IgA) 생성을 촉진해 전신 면역력 증진")
    ],
    "dur": 8.5, "motion": "pan_up"
  },
  {
    "img": "KakaoTalk_20260829_181618045_02.jpg",
    "tag": "다래의 효능 09",
    "title": "강력한 항산화 작용 & 유해 활성산소 제거",
    "sub": "세포 손상을 방어하는 천연 폴리페놀의 기적",
    "bullets": [
      ("★ 플라보노이드 & 베타카로틴", "활성산소를 완벽 중화하여 체내 산화 스트레스 제거"),
      ("★ 세포 DNA 손상 방어", "유해 산소로부터 세포막과 유전자를 보호해 돌연변이 예방"),
      ("★ 면역 세포 노화 지연", "활력 있는 젊은 면역 세포 상태를 오래도록 유지")
    ],
    "dur": 8.5, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_03.jpg",
    "tag": "다래의 효능 10",
    "title": "피부 탄력 증진 & 기미, 잡티 미백 효과",
    "sub": "피부 속부터 차오르는 맑고 투명한 동안 광채",
    "bullets": [
      ("● 콜라겐 합성 촉진", "비타민 C가 진피층 콜라겐 생성을 도와 피부 탄력 개선"),
      ("● 멜라닌 색소 억제", "기미, 주근깨, 잡티 생성을 억제하여 맑고 환한 피부톤 완성"),
      ("● 수분 보유력 강화", "피부 장벽 속 수분 증발을 막아 촉촉한 물광 피부 유지")
    ],
    "dur": 8.5, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_04.jpg",
    "tag": "다래의 효능 11",
    "title": "체내 나트륨 배출 & 혈압 강하 효과",
    "sub": "칼륨이 풍부하여 고혈압과 만성 붓기 완벽 해결",
    "bullets": [
      ("✔ 풍부한 칼륨(K) 함유", "짠 음식 섭취로 체내 쌓인 과도한 나트륨을 소변으로 배출"),
      ("✔ 혈관 이완 및 혈압 조절", "혈관 내벽의 긴장을 완화하여 수축기 혈압을 안정적으로 유지"),
      ("✔ 아침 얼굴, 손발 붓기 완화", "체액 저류 현상을 해소하여 무겁고 붓는 몸을 가볍게")
    ],
    "dur": 8.5, "motion": "pan_down"
  },
  {
    "img": "KakaoTalk_20260829_181618045_05.jpg",
    "tag": "다래의 효능 12",
    "title": "혈관 청소 & 나쁜 콜레스테롤(LDL) 억제",
    "sub": "깨끗한 피와 튼튼한 혈관으로 심근경색, 뇌졸중 예방",
    "bullets": [
      ("● 수용성 식이섬유 펙틴", "혈관 속 기름때와 나쁜 콜레스테롤(LDL)을 흡착하여 배출"),
      ("● 혈전(피떡) 생성 방지", "혈소판 응집을 억제하여 혈류 흐름을 막힘없이 원활하게"),
      ("● 동맥경화 예방", "혈관 내피세포를 건강하게 보호하여 심혈관 질환 위험 감소")
    ],
    "dur": 8.5, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_06.jpg",
    "tag": "다래의 효능 13",
    "title": "혈당 스파이크 방지 & 인슐린 감수성 개선",
    "sub": "혈당 걱정 없이 안전하게 즐기는 착한 과일",
    "bullets": [
      ("★ 낮은 당지수(Low GI)", "식후 혈당이 급격히 치솟는 혈당 스파이크를 효과적으로 예방"),
      ("★ 당 흡수 속도 지연", "식이섬유가 탄수화물 분해와 장내 포도당 흡수를 천천히 조절"),
      ("★ 췌장 베타세포 보호", "인슐린 분비 기능을 돕고 인슐린 저항성을 개선하여 대사증후군 예방")
    ],
    "dur": 8.5, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_07.jpg",
    "tag": "다래의 효능 14",
    "title": "간 기능 보호 & 빠른 숙취 해소",
    "sub": "아스파라긴산과 유기산이 알코올 독소를 신속 분해",
    "bullets": [
      ("● 아스파라긴산 풍부", "알코올 대사산물인 아세트알데히드를 빠르게 분해해 숙취 해소"),
      ("● 간세포 재생 촉진", "간 효소(AST, ALT) 수치를 안정시키고 간 손상 회복 지원"),
      ("● 피로 물질 젖산 배출", "구연산과 사과산이 체내 피로 물질을 산화 분해하여 개운한 활력")
    ],
    "dur": 8.5, "motion": "pan_up"
  },
  {
    "img": "KakaoTalk_20260829_181618045_08.jpg",
    "tag": "다래의 효능 15",
    "title": "신장 기능 강화 & 체내 요산 독소 배출",
    "sub": "이뇨 작용을 촉진하여 통풍과 신장 결석 예방",
    "bullets": [
      ("✔ 천연 이뇨 작용", "소변 배출을 원활하게 하여 체내 축적된 노폐물과 중금속 배출"),
      ("✔ 요산 수치 조절", "관절에 쌓여 통증을 유발하는 요산 결정을 배출하여 통풍 예방"),
      ("✔ 신장 결석 형성 억제", "소변의 산도를 조절하여 결석 형성을 미연에 방지")
    ],
    "dur": 8.5, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_12.jpg",
    "tag": "다래의 효능 16",
    "title": "골다공증 예방 & 뼈 건강 강화",
    "sub": "칼슘, 마그네슘, 비타민 K의 완벽한 뼈 흡수 조화",
    "bullets": [
      ("★ 칼슘과 마그네슘 황금비", "뼈의 밀도를 채우는 필수 미네랄이 이상적인 비율로 함유"),
      ("★ 비타민 K로 뼈 흡수 촉진", "칼슘이 혈액에 머물지 않고 뼈 속으로 완벽히 침착되도록 유도"),
      ("★ 성장기 발육 & 골밀도 유지", "어린이 성장 촉진과 갱년기 여성의 골다공증 예방")
    ],
    "dur": 8.5, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_13.jpg",
    "tag": "다래의 효능 17",
    "title": "침침한 눈 피로 회복 & 시력 보호",
    "sub": "루테인과 제아잔틴, 비타민 A로 맑고 선명한 눈",
    "bullets": [
      ("● 루테인 & 제아잔틴", "망막 황반 색소 밀도를 유지하여 노인성 황반변성 예방"),
      ("● 블루라이트 유해광선 차단", "스마트폰과 모니터로 지친 눈의 피로도를 신속히 회복"),
      ("● 안구 건조증 개선", "눈물막을 보호하고 각막 표면을 촉촉하고 맑게 유지")
    ],
    "dur": 8.5, "motion": "pan_down"
  },
  {
    "img": "KakaoTalk_20260829_181618045_14.jpg",
    "tag": "다래의 효능 18",
    "title": "두뇌 활성화 & 깜빡하는 기억력 감퇴 예방",
    "sub": "풍부한 엽산과 항산화제가 뇌 신경세포를 철벽 보호",
    "bullets": [
      ("✔ 고함량 엽산(Folate)", "뇌신경 전달물질 합성을 촉진하여 집중력과 기억력 향상"),
      ("✔ 뇌세포 산화 손상 방지", "유해 활성산소로부터 뇌세포를 보호하여 인지 기능 저하 예방"),
      ("✔ 수험생 & 어르신 필수 영양", "두뇌 피로를 덜어주고 치매 예방에 도움을 주는 영양 공급")
    ],
    "dur": 8.5, "motion": "zoom_out"
  },
  {
    "img": "KakaoTalk_20260829_181618045_18.jpg",
    "tag": "다래의 효능 19",
    "title": "신경 안정 & 꿀잠 유도 (불면증 완화)",
    "sub": "마그네슘과 천연 세로토닌 전구물질의 이완 효과",
    "bullets": [
      ("★ 신경 흥분 완화 (마그네슘)", "과도하게 긴장된 근육과 교감신경을 이완시켜 스트레스 해소"),
      ("★ 세로토닌 & 멜라토닌 분비 촉진", "수면 호르몬 합성을 도와 뒤척임 없는 깊은 숙면 유도"),
      ("★ 불안감 및 초조함 진정", "마음을 차분하게 가라앉혀 편안한 휴식 상태 제공")
    ],
    "dur": 9.0, "motion": "zoom_in"
  },
  {
    "img": "KakaoTalk_20260829_181618045_09.jpg",
    "tag": "다래의 효능 20",
    "title": "면역 NK세포 활성화 & 항암 면역 방어",
    "sub": "돌연변이 세포를 억제하는 자연의 강력한 방어력",
    "bullets": [
      ("● 자연살해세포(NK Cell) 자극", "암세포를 스스로 찾아 파괴하는 NK세포 활성도를 대폭 증강"),
      ("● 발암물질 니트로사민 억제", "체내 유해 질산염이 발암물질로 변하는 과정을 강력 차단"),
      ("● 전신 면역 감시 체계 강화", "외부 병원체와 변이 세포에 대한 방어 면역력 극대화")
    ],
    "dur": 14.5, "motion": "pan_left_right"
  },
  {
    "img": "KakaoTalk_20260829_181618045_15.jpg",
    "tag": "다래의 효능 21",
    "title": "사계절 온 가족의 평생 건강 지킴이",
    "sub": "자연이 선물한 기적의 토종 다래로 매일매일 건강하세요",
    "bullets": [
      ("★ 완벽한 천연 영양의 보고", "비타민, 미네랄, 파이토케미컬, 효소가 집약된 자연의 종합영양제"),
      ("★ 사계절 활력과 면역 충전", "환절기 감기부터 만성 피로까지 온 가족을 든든하게 지켜줍니다"),
      ("★ 늘 건강하시고 행복하세요!", "대자연이 빚은 귀한 토종 다래와 함께 매일 건강과 활력이 가득하세요!")
    ],
    "dur": 13.06, "motion": "zoom_out"
  }
]

AUDIO_LEN = 189.56
total_dur = sum(s["dur"] for s in SCENES)
for s in SCENES:
  s["dur"] = (s["dur"] / total_dur) * AUDIO_LEN

print(f"Total video duration: {AUDIO_LEN:.2f}s ({len(SCENES)} scenes)")

print("Pre-rendering scene assets with ultra-fast frame buffer...")
scene_assets = []

rc_x, rc_y, rc_w, rc_h = 880, 90, 990, 880
strip_box_x = rc_x + 35
strip_box_y = rc_y + 145
strip_box_w = rc_w - 70
strip_box_h = rc_h - 170

for idx, sc in enumerate(SCENES):
  raw_path = os.path.join(IMG_DIR, sc["img"])
  im_raw = Image.open(raw_path)
  im = ImageOps.exif_transpose(im_raw).convert("RGBA")
  
  # 1. Base Blurred Background
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
  bg_blurred = bg_blurred.filter(ImageFilter.GaussianBlur(radius=36))
  dark_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (8, 16, 12, 165))
  bg_blurred = Image.alpha_composite(bg_blurred, dark_overlay)
  
  # 2. Left Photo Stage (Rounded Card + Shadow)
  left_center_x = 440
  fg_h = 870
  fg_w = int(im.width * (fg_h / im.height))
  fg_img = im.resize((fg_w, fg_h), Image.Resampling.BILINEAR)
  
  radius = 24
  mask = Image.new('L', (fg_w, fg_h), 0)
  mask_draw = ImageDraw.Draw(mask)
  mask_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, fill=255)
  
  spad = 30
  shadow = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
  s_draw = ImageDraw.Draw(shadow)
  s_draw.rounded_rectangle([(spad, spad), (fg_w + spad, fg_h + spad)], radius=radius, fill=(0, 0, 0, 180))
  shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20))
  
  b_img = Image.new('RGBA', (fg_w, fg_h), (0, 0, 0, 0))
  b_draw = ImageDraw.Draw(b_img)
  b_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, outline=(255, 255, 255, 80), width=2)
  
  fg_comp = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
  fg_comp.paste(shadow, (0, 0), shadow)
  fg_comp.paste(fg_img, (spad, spad), mask)
  fg_comp.paste(b_img, (spad, spad), b_img)
  
  fg_comp_np = np.array(fg_comp)
  fg_bgr = cv2.cvtColor(fg_comp_np[:, :, :3], cv2.COLOR_RGB2BGR)
  fg_alpha = (fg_comp_np[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
  
  # 3. Right Card Base
  rc_base = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
  rc_draw = ImageDraw.Draw(rc_base)
  
  rc_draw.rounded_rectangle([(rc_x, rc_y), (rc_x + rc_w, rc_y + rc_h)], radius=28, fill=(12, 22, 16, 230), outline=(163, 230, 53, 160), width=2)
  
  # Tag Badge
  tag_text = sc["tag"]
  tag_bbox = f_tag.getbbox(tag_text)
  tag_w = (tag_bbox[2] - tag_bbox[0]) + 28
  tag_h = 36
  rc_draw.rounded_rectangle([(rc_x + 35, rc_y + 30), (rc_x + 35 + tag_w, rc_y + 30 + tag_h)], radius=18, fill=(163, 230, 53, 255))
  rc_draw.text((rc_x + 49, rc_y + 36), tag_text, font=f_tag, fill=(10, 20, 15, 255))
  
  # Title
  rc_draw.text((rc_x + 35 + tag_w + 16, rc_y + 28), sc["title"], font=f_card_title, fill=(254, 240, 138, 255))
  
  # Divider
  rc_draw.line([(rc_x + 35, rc_y + 80), (rc_x + rc_w - 35, rc_y + 80)], fill=(163, 230, 53, 100), width=1)
  
  # Subtitle
  rc_draw.text((rc_x + 35, rc_y + 94), sc["sub"], font=f_card_sub, fill=(241, 245, 249, 255))
  
  # Header & BGM Badges
  hdr_text = "자연이 빚은 보약 | 토종 야생 다래의 놀라운 효능"
  hdr_bbox = f_header.getbbox(hdr_text)
  hdr_w = (hdr_bbox[2] - hdr_bbox[0]) + 38
  hdr_h = 44
  rc_draw.rounded_rectangle([(50, 28), (50 + hdr_w, 28 + hdr_h)], radius=22, fill=(15, 25, 20, 195), outline=(163, 230, 53, 150), width=2)
  rc_draw.text((69, 36), hdr_text, font=f_header, fill=(240, 253, 244, 255))
  
  bgm_text = "음악: 종이비행기 항해"
  bgm_bbox = f_header.getbbox(bgm_text)
  bgm_w = (bgm_bbox[2] - bgm_bbox[0]) + 38
  bgm_x = WIDTH - 50 - bgm_w
  rc_draw.rounded_rectangle([(bgm_x, 28), (bgm_x + bgm_w, 28 + hdr_h)], radius=22, fill=(15, 25, 20, 195), outline=(250, 204, 21, 150), width=2)
  rc_draw.text((bgm_x + 19, 36), bgm_text, font=f_header, fill=(254, 240, 138, 255))
  
  static_frame_rgba = Image.alpha_composite(bg_blurred, rc_base)
  static_frame_bgr = cv2.cvtColor(np.array(static_frame_rgba), cv2.COLOR_RGBA2BGR)
  
  # 4. Pre-render Tall Scrolling Content Strip (Ensuring total height >= strip_box_h + 240)
  bullets = sc["bullets"]
  num_b = len(bullets)
  strip_w = strip_box_w
  box_h = 108 if num_b <= 3 else 92
  gap = 22 if num_b <= 3 else 16
  
  pad_top = 50
  pad_bot = 120
  content_calc_h = pad_top + num_b * (box_h + gap) + pad_bot
  total_strip_h = max(strip_box_h + 240, content_calc_h)
  
  strip_img = Image.new('RGB', (strip_w, total_strip_h), (12, 22, 16))
  st_draw = ImageDraw.Draw(strip_img)
  
  cur_y = pad_top
  for b_title, b_desc in bullets:
    st_draw.rounded_rectangle([(0, cur_y), (strip_w, cur_y + box_h)], radius=18, fill=(22, 38, 28), outline=(163, 230, 53), width=1)
    st_draw.text((24, cur_y + 14), b_title, font=f_item_title, fill=(250, 204, 21))
    st_draw.text((24, cur_y + 54 if box_h == 108 else cur_y + 48), b_desc, font=f_item_desc, fill=(226, 232, 240))
    cur_y += box_h + gap
    
  strip_bgr = cv2.cvtColor(np.array(strip_img), cv2.COLOR_RGB2BGR)
  
  max_scroll = total_strip_h - strip_box_h
  if max_scroll < 0:
    max_scroll = 0
    
  scene_assets.append({
    "static_bgr": static_frame_bgr,
    "fg_bgr": fg_bgr,
    "fg_alpha": fg_alpha,
    "fg_x": left_center_x - fg_w // 2,
    "spad": spad,
    "strip_bgr": strip_bgr,
    "max_scroll": max_scroll,
    "num_frames": int(round(sc["dur"] * FPS)),
    "motion": sc["motion"]
  })

print(f"Prepared {len(scene_assets)} scene assets.")

# Floating particles
NUM_PARTICLES = 30
particles = []
for _ in range(NUM_PARTICLES):
  particles.append({
    "x": random.uniform(50, WIDTH - 50),
    "y": random.uniform(0, HEIGHT),
    "r": random.randint(2, 5),
    "vy": random.uniform(0.6, 1.4),
    "color": (random.randint(140, 190), random.randint(220, 255), random.randint(140, 200))
  })

def render_dynamic_frame(asset, progress, global_f):
  frame = asset["static_bgr"].copy()
  
  # 1. Left Photo with Ken Burns Motion
  motion = asset["motion"]
  if motion == "zoom_in":
    scale = 1.0 + 0.045 * progress
    y_shift = int((progress - 0.5) * -8)
  elif motion == "zoom_out":
    scale = 1.045 - 0.045 * progress
    y_shift = int((progress - 0.5) * 8)
  elif motion == "pan_up":
    scale = 1.02
    y_shift = int((0.5 - progress) * 16)
  else: # pan_down
    scale = 1.02
    y_shift = int((progress - 0.5) * 16)
    
  fg_bgr = asset["fg_bgr"]
  fg_alpha = asset["fg_alpha"]
  fh, fw = fg_bgr.shape[:2]
  
  cur_w = int(fw * scale)
  cur_h = int(fh * scale)
  
  fg_s = cv2.resize(fg_bgr, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)
  alpha_s = cv2.resize(fg_alpha, (cur_w, cur_h), interpolation=cv2.INTER_LINEAR)[:, :, np.newaxis]
  
  target_x = asset["fg_x"] - (cur_w - fw) // 2
  target_y = 90 + y_shift - asset["spad"]
  
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

  # 2. Right Card: Upward Scrolling Subtitles Animation (Instant direct slice assignment!)
  scroll_y = int(progress * asset["max_scroll"])
  strip_bgr = asset["strip_bgr"]
  
  frame[strip_box_y : strip_box_y + strip_box_h, strip_box_x : strip_box_x + strip_box_w] = strip_bgr[scroll_y : scroll_y + strip_box_h, :]

  # 3. Particle effects
  for p in particles:
    px = int((p["x"] + math.sin(global_f * 0.03 + p["r"]) * 16) % WIDTH)
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
  '-i', LOCAL_AUDIO,
  '-filter_complex', '[1:a]afade=t=in:st=0:d=1.0,afade=t=out:st=186.0:d=3.5[a]',
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
    cur_frame = render_dynamic_frame(asset, prog, global_f)
    
    frames_left = n_frames - f
    if frames_left <= TRANSITION_FRAMES and next_asset is not None:
      t_prog = 1.0 - (frames_left / TRANSITION_FRAMES)
      next_frame = render_dynamic_frame(next_asset, 0.0, global_f)
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
      print(f" [Rendering] {global_f}/{total_frames} ({pct:.1f}%) | Speed: {cur_fps:.1f} FPS | ETA: {eta:.1f}s")

proc.stdin.close()
proc.wait()

print(f"Encoding complete in {time.time() - t0:.2f}s!")

# Copy to KakaoTalk folder
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO_1)
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO_MAIN)
print(f"Saved: {OUT_WORKSPACE}")
print(f"Saved: {OUT_KAKAO_1}")
print(f"Saved: {OUT_KAKAO_MAIN}")
