import os, sys, math, random, subprocess
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter
import cv2

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

AUDIO_PATH = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\그리움의 노래(반주).mp3"
IMG_DIR = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능\다래의효능"
OUTPUT_DIR_1 = r"C:\Users\황태민\Documents\카카오톡 받은 파일\다래의효능"
OUTPUT_DIR_2 = r"C:\Users\황태민\Documents\antigravity\calm-hertz"
OUTPUT_MP4 = os.path.join(OUTPUT_DIR_2, "다래의효능_완성영상.mp4")
FINAL_COPY = os.path.join(OUTPUT_DIR_1, "다래의효능_영상.mp4")

# Total duration ~212.56s
FPS = 30
WIDTH = 1920
HEIGHT = 1080

# Load fonts
FONT_BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
FONT_REG = r"C:\Windows\Fonts\malgun.ttf"

# Storyline scenes with corresponding images and captions
SCENES = [
    {
        "img": "KakaoTalk_20260829_181618045_19.jpg",
        "title": "🌿 자연이 선물한 귀한 보약, 토종 야생 다래",
        "sub": "깊은 숲속의 맑은 기운을 듬뿍 머금고 자란 천연 건강 열매",
        "tag": "제철 야생 다래 수확",
        "dur": 10.0,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_20.jpg",
        "title": "🍏 자연 그대로의 싱그러움과 생명력",
        "sub": "탱글탱글 윤기가 흐르는 토종 다래의 탐스러운 자태",
        "tag": "신선한 다래 선별",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_11.jpg",
        "title": "✨ 정성을 담은 다래 손질과 세척",
        "sub": "흐르는 맑은 물에 깨끗이 씻어 물기를 뽀송뽀송하게 말려줍니다",
        "tag": "깨끗한 전처리 과정",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_16.jpg",
        "title": "💚 맛과 영양이 응축된 천연 비타민의 보고",
        "sub": "달콤새콤한 풍미와 부드러운 과육 속에 가득한 건강 성분",
        "tag": "특상급 토종 다래",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_10.jpg",
        "title": "🛡️ 다래의 효능 ① 면역력 강화 & 활력 충전",
        "sub": "비타민 C가 사과의 20배, 레몬의 3배 이상 풍부하여 면역 증진에 탁월",
        "tag": "면역력 강화",
        "dur": 10.0,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_17.jpg",
        "title": "🌿 다래의 효능 ② 만성 염증 완화 & 알레르기 개선",
        "sub": "천연 면역 조절 물질(PG102)이 체내 염증 억제 및 비염/아토피 완화",
        "tag": "항염 & 알레르기 개선",
        "dur": 10.0,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045.jpg",
        "title": "🍃 다래의 효능 ③ 장 건강 & 변비 해소",
        "sub": "천연 단백질 분해 효소 '액티니딘'과 풍부한 식이섬유로 소화 촉진",
        "tag": "장 건강 & 소화 촉진",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_01.jpg",
        "title": "✨ 다래의 효능 ④ 강력한 항산화 & 노화 방지",
        "sub": "베타카로틴과 폴리페놀이 활성산소를 제거하여 피부 탄력과 피로 회복",
        "tag": "항산화 & 피로 회복",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_02.jpg",
        "title": "💧 다래의 효능 ⑤ 혈관 건강 & 노폐물 배출",
        "sub": "칼륨과 엽산, 유기산이 풍부하여 혈압 조절과 독소 배출을 지원",
        "tag": "혈관 건강 & 해독",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_03.jpg",
        "title": "🍯 다래청 담그기 ① 다래와 설탕 1:1 황금비율",
        "sub": "소독한 유리병에 싱싱한 다래와 백설탕을 동일한 무게(1:1)로 준비",
        "tag": "황금 비율 1:1",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_04.jpg",
        "title": "🍯 다래청 담그기 ② 켜켜이 정성껏 채우기",
        "sub": "다래 한 층, 설탕 한 층을 번갈아 가며 빈틈없이 차곡차곡 채웁니다",
        "tag": "정성 가득 채우기",
        "dur": 9.5,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_05.jpg",
        "title": "🍯 다래청 담그기 ③ 당도와 과즙의 어우러짐",
        "sub": "하얀 설탕이 사르르 녹아내리며 다래 본연의 진한 엑기스가 우러납니다",
        "tag": "자연 과즙 추출",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_06.jpg",
        "title": "🍯 다래청 담그기 ④ 삼투압으로 농축되는 영양",
        "sub": "설탕이 녹으며 다래의 비타민과 유효 성분이 천연 효소액으로 완성",
        "tag": "영양 성분 응축",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_07.jpg",
        "title": "🍯 다래청 담그기 ⑤ 공기 접촉 완벽 차단",
        "sub": "과육이 공기 중에 노출되지 않도록 골고루 설탕을 덮어주는 것이 중요",
        "tag": "위생적인 공기 차단",
        "dur": 9.5,
        "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_08.jpg",
        "title": "🍯 다래청 담그기 ⑥ 곰팡이 예방 설탕 덮개",
        "sub": "맨 위쪽은 설탕을 소복이 두텁게 얹어 변질을 완벽하게 방지합니다",
        "tag": "안심 보관 팁",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_12.jpg",
        "title": "🍯 다래청 담그기 ⑦ 마지막 한 톨까지 가득",
        "sub": "온 가족의 사계절 건강을 바라는 따뜻한 마음을 아낌없이 담아냅니다",
        "tag": "마음 담은 정성",
        "dur": 9.5,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_13.jpg",
        "title": "🍯 다래청 담그기 ⑧ 소복한 설탕 눈꽃 완성",
        "sub": "병 입구를 청결하게 닦고 뚜껑을 닫아 위생적인 밀폐를 준비합니다",
        "tag": "깔끔한 마무리",
        "dur": 9.5,
        "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_14.jpg",
        "title": "🍯 다래청 담그기 ⑨ 완벽한 밀봉과 보관",
        "sub": "설탕이 완전히 녹을 때까지 2~3일에 한 번씩 저어주면 풍미가 더욱 깊어집니다",
        "tag": "발효 관리 비결",
        "dur": 9.5,
        "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_18.jpg",
        "title": "⏳ 100일간의 정성과 기다림의 시간",
        "sub": "직사광선을 피해 서늘하고 통풍이 잘되는 그늘에서 천천히 발효·숙성",
        "tag": "100일의 숙성",
        "dur": 10.0,
        "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_09.jpg",
        "title": "✨ 정성 가득 담긴 건강 명품 다래청 완성!",
        "sub": "100일 후 다래 원액을 걸러 따뜻한 다래차나 시원한 에이드로 건강하게 즐기세요",
        "tag": "명품 다래청 완성",
        "dur": 16.0,
        "motion": "pan_left_right"
    },
    {
        "img": "KakaoTalk_20260829_181618045_15.jpg",
        "title": "🌿 자연이 빚어낸 건강한 선물, 늘 건강하세요",
        "sub": "달콤하고 향긋한 토종 다래청과 함께 온 가족 모두 행복한 날 가득하세요!",
        "tag": "건강과 행복을 기원합니다",
        "dur": 13.56,
        "motion": "zoom_out"
    }
]

print(f"Total scenes: {len(SCENES)}")
total_calc_dur = sum(s['dur'] for s in SCENES)
print(f"Total planned duration: {total_calc_dur:.2f}s")
