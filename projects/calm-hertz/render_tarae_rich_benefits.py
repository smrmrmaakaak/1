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

f_header = ImageFont.truetype(FONT_DOHYEON, 22)
f_tag = ImageFont.truetype(FONT_DOHYEON, 18)
f_card_title = ImageFont.truetype(FONT_DOHYEON, 33)
f_card_sub = ImageFont.truetype(FONT_JUA, 22)
f_item_title = ImageFont.truetype(FONT_DOHYEON, 22)
f_item_desc = ImageFont.truetype(FONT_JUA, 18)

# 21 Rich Scenes: 5X Expanded In-Depth Health Knowledge & Scientific Facts
SCENES = [
    {
        "img": "KakaoTalk_20260829_181618045_19.jpg",
        "tag": "다래의 효능 01",
        "title": "동의보감이 인정한 신비의 명약, 토종 다래",
        "sub": "깊은 백두대간의 생명력을 품은 대한민국 대표 토종 슈퍼푸드",
        "bullets": [
            ("★ 동의보감 속 미후도(獼猴桃) 기록", "조선 왕실 의학서 『동의보감』에서 미후도로 기록하며 몸의 심한 열을 내리고 갈증을 멎게 하며 오장육부를 보하는 귀한 명약으로 다룸."),
            ("★ 오염 없는 청정 자연의 자생력", "오염되지 않은 깊은 산골 계곡부에서 오직 대자연의 이슬과 햇살로 자라나 유효 파이토케미컬 성분이 일반 재배 과일 대비 압도적 농축."),
            ("★ 껍질째 먹는 100% 전초 영양", "털이 없는 매끄러운 껍질 구조로, 껍질 직하층에 집중된 폴리페놀, 플라보노이드, 식물성 펙틴을 손실 없이 통째로 체내에 흡수."),
            ("★ 자연 숙성과 생체 이용률 극대화", "자연 후숙 과정을 거치며 천연 유기산과 효소 활성도가 극대화되어 영양소의 체내 흡수율과 생체 이용 효율이 비약적으로 상승.")
        ],
        "dur": 9.0, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_20.jpg",
        "tag": "다래의 효능 02",
        "title": "사과의 20배! 천연 비타민 C의 절대 강자",
        "sub": "지친 몸에 활력을 불어넣고 전신 면역 방어벽을 급속 충전",
        "bullets": [
            ("● 압도적인 고농축 비타민 C 함량", "100g당 비타민 C가 사과의 20배, 오렌지의 4배, 레몬의 3배 이상 풍부하여 하루 몇 알만으로 일일 권장량을 완벽히 충족."),
            ("● 천연 복합체로 흡수율 극대화", "합성 비타민과 달리 비타민 P(바이오플라보노이드) 및 유기산과 결합되어 있어 위장 장애 없이 혈액 내로 신속히 흡수."),
            ("● 백혈구 식균 작용 및 방어력 증강", "강력한 전자 공여 환원 작용을 통해 체내 침입한 바이러스와 병원성 유해균을 포식하는 면역 세포의 활성도를 대폭 증강."),
            ("● 만성 피로와 무기력증 급속 해소", "피로 유발 물질인 젖산을 빠르게 분해 배출하고 부신 피질 호르몬 생성을 도와 지친 현대인의 활력을 빠르게 되살림.")
        ],
        "dur": 8.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_11.jpg",
        "tag": "다래의 효능 03",
        "title": "식약처 인정 면역 기능성 물질 PG102",
        "sub": "과민성 면역 불균형을 바로잡는 첨단 바이오 과학의 결정체",
        "bullets": [
            ("● 식약처 개별인정형 면역 원료", "국내 명문대 연구진과 산학협력으로 효능이 규명된 다래 추출물 PG102 성분은 면역과민반응 개선 기능성 원료로 공식 등재."),
            ("● Th1과 Th2 면역 세포 밸런스 정상화", "한쪽으로 치우쳐 알레르기와 염증을 일으키는 Th2 면역 반응을 억제하고 Th1 세포와의 완벽한 균형을 유도해 체질 개선."),
            ("● 면역글로불린 IgE 생성 차단", "과도한 알레르기 반응을 유발하는 혈중 IgE 항체 수치를 현저히 감소시켜 유해 자극에 대한 신체 저항력 복원."),
            ("● 전신 만성 염증 사이토카인 완화", "체내 염증 물질인 인터루킨(IL-4, IL-5) 생성을 억제하여 전신 염증 수치를 건강하고 안정적인 상태로 회복.")
        ],
        "dur": 8.5, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_16.jpg",
        "tag": "다래의 효능 04",
        "title": "지긋지긋한 알레르기 비염 & 천식 완벽 케어",
        "sub": "환절기 코막힘, 맑은 콧물, 발작적 재채기와 호흡기 염증 진정",
        "bullets": [
            ("● 비강 점막의 과민 염증 반응 진정", "환절기 꽃가루, 미세먼지, 집먼지진드기로 인해 붓고 헐어버린 비강 점막의 모세혈관 염증을 신속하게 가라앉힘."),
            ("● 히스타민 방출의 근원적 차단", "비만세포에서 뿜어져 나와 콧물과 눈물, 연속 재채기를 일으키는 알레르기 유발 물질 히스타민의 분비를 억제."),
            ("● 기관지 기도 염증 및 평활근 이완", "기도의 과민성을 낮추고 기관지 주변 근육 경련을 완화하여 만성 기침, 쌕쌕거림, 천식성 호흡 곤란을 시원하게 개선."),
            ("● 호흡기 1차 방어 점막 면역 복원", "상기도 점막의 섬모 운동을 촉진하고 면역 점액 분비를 정상화하여 외부 오염물질 침투를 철통 방어.")
        ],
        "dur": 8.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_10.jpg",
        "tag": "다래의 효능 05",
        "title": "극심한 아토피 피부염 & 가려움증 집중 완화",
        "sub": "피부 속 만성 염증을 정화하여 밤마다 편안한 숙면 선사",
        "bullets": [
            ("★ 야간 가려움증 신경 신호 차단", "밤마다 피가 나도록 긁게 만드는 가려움 유발 신경 펩타이드 생성을 억제하여 긁지 않고 편안히 잠들 수 있도록 유도."),
            ("★ 손상된 피부 표피 지질 장벽 재건", "세라마이드 합성을 촉진하여 건조하고 갈라진 피부 표피층의 유수분 보호막을 탄탄하게 복원하고 수분 손실 방지."),
            ("★ 소아 및 성인 아토피 체질 개선", "스테로이드 부작용 걱정 없는 100% 천연 식물성 원료로서 피부 기저층의 만성 염증을 근본적으로 정화."),
            ("★ 붉은 홍조 및 접촉성 피부염 진정", "외부 마찰과 자극에 민감하게 붉어지는 피부 열감을 내리고 표피 세포의 정상적인 재생 주기를 되찾아줌.")
        ],
        "dur": 9.0, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_17.jpg",
        "tag": "다래의 효능 06",
        "title": "천연 단백질 분해 효소 액티니딘의 기적",
        "sub": "고기 먹은 후 더부룩함을 싹 씻어주는 위장 속 천연 소화제",
        "bullets": [
            ("● 강력한 육류 단백질 미세 분해", "파파야의 파파인, 파인애플의 브로멜라인보다 월등히 온화하면서도 강력한 단백질 절단력으로 위장 소화를 완벽 촉진."),
            ("● 소화기 부담 제로 및 체류 시간 단축", "소화력이 약한 어르신, 성장기 어린이, 수험생의 위장관 내 음식물 소화 시간을 절반 이하로 단축."),
            ("● 식후 복부 팽만감과 신트림 해소", "육류 섭취 후 발생하는 가스 참, 더부룩함, 헛배부름, 명치 답답함을 단시간 내에 시원하게 해결."),
            ("● 위점막 손상 없는 온화한 보호", "위벽을 자극하지 않고 음식물을 부드러운 미즙 상태로 만들어 십이지장과 소장으로의 편안한 배출 유도.")
        ],
        "dur": 9.0, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045.jpg",
        "tag": "다래의 효능 07",
        "title": "지독한 변비 탈출 & 묵은 숙변 완벽 배출",
        "sub": "장 연동 운동을 되살려 매일 아침 가볍고 상쾌한 쾌변",
        "bullets": [
            ("● 불용성 및 수용성 식이섬유의 황금비율", "장내 수분을 강력히 흡수하여 변의 부피를 키우고 부드럽게 만들어 통증 없는 부드러운 배변 유도."),
            ("● 식물성 펙틴(Pectin)의 강력한 흡착력", "장벽 주름 구석구석에 들러붙은 오래된 숙변과 독소 노폐물을 스펀지처럼 흡착하여 깔끔하게 배출."),
            ("● 대장 자율신경 연동 운동 촉진", "무기력해진 대장 평활근의 수축 이완 리듬을 정상화하여 만성 이완성 변비를 근원적으로 치료."),
            ("● 잔변감 없는 상쾌함과 치질 예방", "복압을 낮추고 항문 주위 혈관 울혈을 방지하여 치질과 결장 질환 위험을 사전에 완벽 차단.")
        ],
        "dur": 8.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_01.jpg",
        "tag": "다래의 효능 08",
        "title": "장내 100조 개 유익균을 살리는 마이크로바이옴",
        "sub": "면역의 70%를 담당하는 장 건강을 튼튼하게 지키는 천연 프리바이오틱스",
        "bullets": [
            ("● 유익균 비피더스균 증식 폭발", "장내 유익균이 가장 좋아하는 올리고당과 천연 다당류가 가득하여 유산균의 폭발적인 증식을 유도."),
            ("● 장내 부패균 및 악취 가스 억제", "유해균의 정착을 막아 음식물 부패로 인한 암모니아, 인돌, 황화수소 등 독성 가스 발생을 원천 차단."),
            ("● 단쇄지방산(SCFA) 생성 촉진", "대장 상피세포의 주 에너지원인 부티레이트 생성을 도와 장벽이 헐어 독소가 새는 장누수증후군 방지."),
            ("● 장 면역 림프조직(GALT) 활성화", "인체 면역 세포의 70%가 집중된 장 점막 면역계를 자극하여 전신 면역 방어 시스템 구축.")
        ],
        "dur": 8.5, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_02.jpg",
        "tag": "다래의 효능 09",
        "title": "유해 활성산소를 제거하는 강력한 항산화 쉴드",
        "sub": "세포 산화와 노화를 막아내는 천연 폴리페놀과 카로티노이드",
        "bullets": [
            ("★ 활성산소(ROS) 완벽 소거 작용", "호흡, 스트레스, 대사 과정에서 끊임없이 생성되어 세포를 공격하는 유해 산화 물질을 강력 무력화."),
            ("★ 세포막 불포화지방산 산패 방어", "세포막을 이루는 지질의 과산화를 억제하여 세포막 구조와 미토콘드리아 에너지 생성 능력을 보존."),
            ("★ 유전자 DNA 손상 및 돌연변이 차단", "산화 스트레스로 인한 핵산 DNA 변형을 방어하여 세포의 조기 노화와 비정상적 변이를 방지."),
            ("★ 신체 활력 지수 및 스태미나 증강", "전신 조직의 산소 이용 효율을 높여 피로에 쉽게 지치지 않는 강력한 체력과 지구력을 부여.")
        ],
        "dur": 8.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_03.jpg",
        "tag": "다래의 효능 10",
        "title": "콜라겐 합성 촉진 & 맑고 환한 동안 백옥 피부",
        "sub": "진피층부터 차오르는 탄력과 멜라닌 억제로 완성하는 피부 회춘",
        "bullets": [
            ("● 피부 진피층 콜라겐 합성 200% 촉진", "고함량 비타민 C가 섬유아세포를 활성화하여 콜라겐과 엘라스틴 합성을 증진, 깊은 주름 예방."),
            ("● 멜라닌 색소 생성 효소 억제", "티로시나아제 활성을 차단하여 기미, 주근깨, 잡티, 색소 침착을 막고 맑고 투명한 피부톤 유지."),
            ("● 천연 보습 인자(NMF) 강화", "피부 표피층의 수분 증발을 막고 수분 보유력을 높여 속당김 없이 촉촉하고 매끄러운 물광 결 완성."),
            ("● 자외선 광노화로부터 피부 보호", "햇빛 노출로 발생하는 피부 산화 열감을 진정시키고 광노화로 인한 탄력 저하를 효과적으로 방어.")
        ],
        "dur": 8.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_04.jpg",
        "tag": "다래의 효능 11",
        "title": "체내 나트륨 배출 & 혈관 이완 고혈압 완화",
        "sub": "풍부한 칼륨이 짠 음식 독소를 씻어내고 만성 부종 해결",
        "bullets": [
            ("● 풍부한 천연 칼륨(K) 함유", "한국인의 맵고 짠 식단으로 인해 체내에 축적된 과도한 나트륨을 신장을 통해 소변으로 빠르게 배출."),
            ("● 혈관벽 긴장 완화 및 혈압 강하", "혈관 평활근의 과도한 수축을 이완시켜 수축기와 이완기 혈압을 정상적이고 안정된 수치로 유지."),
            ("● 아침 얼굴 붓기와 하체 부종 개선", "세포 간질액의 불필요한 수분 정체 현상을 해소하여 무겁고 붓는 몸을 가볍고 개운하게 개선."),
            ("● 심장 펌프 기능 부담 완화", "순환 혈액량을 적정 수준으로 유지하여 심장에 가해지는 과도한 혈류 저항과 압박을 경감.")
        ],
        "dur": 8.5, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_05.jpg",
        "tag": "다래의 효능 12",
        "title": "혈관 청소 & 나쁜 콜레스테롤(LDL) 억제",
        "sub": "피를 맑게 하고 혈전을 방지하여 심근경색과 뇌졸중 철벽 예방",
        "bullets": [
            ("● 수용성 펙틴의 혈중 지질 배출", "혈관벽에 기름때를 형성하는 변성 나쁜 콜레스테롤(LDL)을 장내에서 흡착하여 체외로 배출."),
            ("● 혈전(피떡) 형성 및 혈소판 응집 억제", "혈액의 점도를 낮추고 끈적거림을 방지하여 막힘없는 원활한 모세혈관 혈류 순환 유지."),
            ("● 동맥경화 및 혈관 경화증 예방", "노화로 인해 딱딱하게 굳어가는 동맥 혈관벽의 탄력성을 복원하여 심혈관 질환 위험도를 급감."),
            ("● 좋은 HDL 콜레스테롤 활성화", "혈관 속 잉여 지방을 간으로 회수하는 청소부 역할을 강화하여 깨끗하고 건강한 혈관 환경 조성.")
        ],
        "dur": 8.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_06.jpg",
        "tag": "다래의 효능 13",
        "title": "혈당 스파이크 방지 & 인슐린 저항성 개선",
        "sub": "혈당 걱정 없이 안전하게 당 대사를 정상화하는 착한 과일",
        "bullets": [
            ("★ 낮은 당지수(Low GI) 건강 과일", "식후 포도당 흡수가 서서히 이루어져 당뇨 환자에게 치명적인 급격한 혈당 스파이크를 사전에 방지."),
            ("★ 탄수화물 분해 속도 완만 조절", "식이섬유가 소화 효소와 당분의 결합을 지연시켜 식후 인슐린 과다 분비로 인한 췌장 피로를 경감."),
            ("★ 말초 조직 인슐린 수용체 감수성 증진", "근육 세포와 간세포가 혈액 속 포도당을 에너지로 효율적으로 흡수 연소하도록 유도."),
            ("★ 당뇨 미세혈관 합병증 보호", "고혈당 상태에서 발생하는 혈관 산화 손상과 당뇨병성 신경병증을 항산화 성분이 강력 방어.")
        ],
        "dur": 8.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_07.jpg",
        "tag": "다래의 효능 14",
        "title": "지친 간 기능 재생 & 숙취 아세트알데히드 해독",
        "sub": "아스파라긴산과 천연 유기산이 알코올 독소를 신속히 정화",
        "bullets": [
            ("● 천연 아스파라긴산의 숙취 분해", "음주 후 두통, 메스꺼움, 속 쓰림을 유발하는 1급 독성 물질 아세트알데히드를 빠르게 분해 배출."),
            ("● 간 효소 수치(AST, ALT) 안정화", "과음과 피로, 스트레스로 인해 손상된 간세포의 염증을 가라앉히고 정상적인 간 기능 지표 회복."),
            ("● 인체 최강 항산화 글루타치온 생성", "간세포 내 글루타치온 합성을 촉진하여 간으로 유입되는 독성 물질과 중금속을 정밀 해독."),
            ("● 지방간 억제 및 담즙 분비 촉진", "간 내 지방 대사를 원활하게 도와 간에 중성지방이 끼는 알코올성 및 비알코올성 지방간을 억제.")
        ],
        "dur": 8.5, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_08.jpg",
        "tag": "다래의 효능 15",
        "title": "신장 여과 기능 강화 & 요산 배출 통풍 예방",
        "sub": "이뇨 작용을 촉진하여 체내 결석 형성을 막고 신장 건강 수호",
        "bullets": [
            ("● 천연 이뇨 작용으로 노폐물 배출", "신장 사구체의 여과 기능을 도와 체내 축적된 대사 찌꺼기와 수분 노폐물을 시원하게 소변으로 배출."),
            ("● 관절 찌르는 요산 결정체 배설", "퓨린 대사 이상으로 혈액 속에 쌓여 관절에 극심한 통증을 일으키는 요산 수치를 정상화하여 통풍 예방."),
            ("● 소변 산도 조절 및 신장 결석 방지", "소변의 pH 밸런스를 맞춰 옥살산칼슘 등 신장 결석과 요로 결석 결정 형성을 억제."),
            ("● 신장 세뇨관 세포 산화 손상 방어", "혈액 여과 과정에서 발생하는 산화 스트레스로부터 신장 조직을 보호해 만성 신부전 예방.")
        ],
        "dur": 8.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_12.jpg",
        "tag": "다래의 효능 16",
        "title": "칼슘·마그네슘·비타민 K의 조화로 골다공증 예방",
        "sub": "뼈 밀도를 치밀하게 채워 중장년 골절 예방과 성장기 발육 촉진",
        "bullets": [
            ("★ 칼슘과 마그네슘의 이상적 비율", "뼈의 미세 구조를 형성하는 핵심 미네랄이 최적의 비율로 함유되어 뼈의 강도와 인성을 강화."),
            ("★ 비타민 K의 오스테오칼신 활성화", "섭취한 칼슘이 혈관벽에 쌓이지 않고 뼈 조직 기질에 단단히 결합되도록 유도."),
            ("★ 골 흡수 억제 및 파골세포 조절", "노화로 인해 뼈가 녹아 빠져나가는 골 손실 속도를 늦춰 중장년 및 갱년기 골다공증 위험 급감."),
            ("★ 성장기 어린이 골격 성장 지원", "뼈의 길이 성장과 성장판 세포 분열을 도와 청소년의 튼튼한 골격 형성을 든든하게 뒷받침.")
        ],
        "dur": 8.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_13.jpg",
        "tag": "다래의 효능 17",
        "title": "침침한 눈 피로 회복 & 황반변성·시력 보호",
        "sub": "루테인, 제아잔틴, 비타민 A로 완성하는 맑고 선명한 눈",
        "bullets": [
            ("● 루테인 & 제아잔틴 황반 색소 유지", "망막 중심부 황반의 색소 밀도를 촘촘하게 유지하여 시각 해상도와 시력 저하를 효과적으로 방어."),
            ("● 전자기기 유해 블루라이트 차단", "스마트폰과 컴퓨터 모니터의 유해 파장을 필터링하여 망막 시세포의 광화학적 피로 손상을 경감."),
            ("● 안구 건조증 개선 및 각막 보호", "눈물막의 지질층을 안정화시키고 각막 표면의 산소 공급을 도와 뻑뻑하고 침침한 눈을 맑게 회복."),
            ("● 노인성 백내장 진행 억제", "수정체 단백질이 활성산소에 의해 뿌옇게 변성되는 산화 반응을 막아 맑은 시야 유지.")
        ],
        "dur": 8.5, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_14.jpg",
        "tag": "다래의 효능 18",
        "title": "두뇌 활성화 & 깜빡하는 기억력 감퇴 예방",
        "sub": "풍부한 천연 엽산과 항산화제가 뇌 신경세포를 철벽 수호",
        "bullets": [
            ("● 고함량 엽산(Folate)의 신경망 활성", "아세틸콜린 등 뇌 신경전달물질 합성을 촉진하여 뇌 신호 전달 속도와 인지 반응성 향상."),
            ("● 뇌혈관 손상 독소 호모시스테인 분해", "뇌혈관을 파괴하고 알츠하이머를 유발하는 혈중 유해 아미노산 농도를 낮추어 뇌 건강 보호."),
            ("● 뇌세포 미세혈관 혈류 공급 개선", "뇌 모세혈관을 확장하여 신선한 산소와 포도당 영양소를 뇌 구석구석 원활하게 공급."),
            ("● 수험생 학습 피로와 두뇌 회복", "장시간 두뇌 활동으로 과열된 뇌 신경의 산화 스트레스를 진정시키고 집중력 유지.")
        ],
        "dur": 8.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_18.jpg",
        "tag": "다래의 효능 19",
        "title": "긴장된 신경 안정 & 꿀잠 유도 (불면증 탈출)",
        "sub": "천연 마그네슘과 세로토닌의 힘으로 뒤척임 없는 깊은 숙면",
        "bullets": [
            ("★ 신경 흥분 완화 및 GABA 활성화", "과도하게 각성된 교감신경을 이완시키고 뇌파를 안정된 알파파로 유도하여 마음을 차분하게 진정."),
            ("★ 수면 호르몬 멜라토닌 분비 촉진", "낮 동안 세로토닌 합성을 돕고 밤이 되면 자연스럽게 수면 호르몬으로 전환시켜 깊은 잠 유도."),
            ("★ 근육 긴장 이완 및 야간 쥐내림 방지", "마그네슘이 근육 경련과 신경 떨림을 부드럽게 풀어주어 밤새 편안하고 안락한 휴식 환경 제공."),
            ("★ 만성 스트레스 및 불안감 해소", "우울감과 초조함을 부드럽게 가라앉혀 심신의 긴장을 자연스럽게 해소해주는 천연 테라피.")
        ],
        "dur": 9.0, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_09.jpg",
        "tag": "다래의 효능 20",
        "title": "인체 최강 면역 NK세포 활성화 & 항암 방어망",
        "sub": "돌연변이 세포를 스스로 찾아 파괴하는 대자연의 강력한 방어력",
        "bullets": [
            ("● 자연살해세포(NK Cell) 활성 대폭 증강", "체내에서 매일 생겨나는 변이 암세포를 스스로 식별해 파괴하는 면역 NK세포의 공격력을 극대화."),
            ("● 1급 발암물질 니트로사민 합성 억제", "식품 찌꺼기에서 생성되는 강력한 위암, 대장암 유발 인자인 니트로사민의 체내 합성을 원천 차단."),
            ("● 비정상 암세포 신생 혈관 차단", "돌연변이 세포가 영양을 공급받기 위해 주변으로 뻗어 나가는 미세혈관 생성을 강력 억제."),
            ("● 24시간 전신 면역 감시 체계 가동", "침묵하는 면역 체계를 깨워 외부 바이러스와 이상 세포의 증식을 철저하게 감시하고 격퇴.")
        ],
        "dur": 14.5, "motion": "pan_left_right"
    },
    {
        "img": "KakaoTalk_20260829_181618045_15.jpg",
        "tag": "다래의 효능 21",
        "title": "대자연이 선사한 기적의 열매, 온 가족 평생 보약",
        "sub": "사계절 내내 지치지 않는 활력과 면역을 선사하는 자연의 선물",
        "bullets": [
            ("★ 완벽한 천연 영양소의 생명체 하모니", "비타민, 미네랄, 파이토케미컬, 효소, 유기산이 총망라된 자연 그대로의 종합 천연 영양제."),
            ("★ 사계절 무병장수의 든든한 건강 동반자", "계절이 바뀔 때마다 찾아오는 환절기 잔병치레와 피로로부터 온 가족을 빈틈없이 수호."),
            ("★ 청정 숲의 순수한 생명력 그대로", "농약과 인공 비료 없이 깊은 산골의 정기만으로 맺힌 귀한 토종 열매의 은혜를 온전히 누리세요."),
            ("★ 늘 건강과 활력이 충만하시길 기원합니다!", "깊고 풍부한 맛과 놀라운 효능을 지닌 토종 다래와 함께 사랑하는 가족 모두 늘 건강하세요!")
        ],
        "dur": 13.06, "motion": "zoom_out"
    }
]

AUDIO_LEN = 189.56
total_dur = sum(s["dur"] for s in SCENES)
for s in SCENES:
    s["dur"] = (s["dur"] / total_dur) * AUDIO_LEN

print(f"Total video duration: {AUDIO_LEN:.2f}s ({len(SCENES)} scenes)")

# Text word-wrapping helper
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

print("Pre-rendering rich scenes with clean luxury glassmorphism (No Neon)...")
scene_assets = []

rc_x, rc_y, rc_w, rc_h = 870, 85, 1000, 895
strip_box_x = rc_x + 35
strip_box_y = rc_y + 155
strip_box_w = rc_w - 70
strip_box_h = rc_h - 180

for idx, sc in enumerate(SCENES):
    raw_path = os.path.join(IMG_DIR, sc["img"])
    im_raw = Image.open(raw_path)
    im = ImageOps.exif_transpose(im_raw).convert("RGBA")
    
    # 1. Base Blurred Background (Deep Luxury Dark Tone)
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
    bg_blurred = bg_blurred.filter(ImageFilter.GaussianBlur(radius=40))
    dark_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (6, 12, 9, 185))
    bg_blurred = Image.alpha_composite(bg_blurred, dark_overlay)
    
    # 2. Left Photo Stage (Rounded Card + Soft Shadow + Subtle White Border)
    left_center_x = 435
    fg_h = 880
    fg_w = int(im.width * (fg_h / im.height))
    fg_img = im.resize((fg_w, fg_h), Image.Resampling.BILINEAR)
    
    radius = 24
    mask = Image.new('L', (fg_w, fg_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, fill=255)
    
    spad = 30
    shadow = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([(spad, spad), (fg_w + spad, fg_h + spad)], radius=radius, fill=(0, 0, 0, 200))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=22))
    
    b_img = Image.new('RGBA', (fg_w, fg_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(b_img)
    b_draw.rounded_rectangle([(0, 0), (fg_w, fg_h)], radius=radius, outline=(255, 255, 255, 45), width=1)
    
    fg_comp = Image.new('RGBA', (fg_w + spad * 2, fg_h + spad * 2), (0, 0, 0, 0))
    fg_comp.paste(shadow, (0, 0), shadow)
    fg_comp.paste(fg_img, (spad, spad), mask)
    fg_comp.paste(b_img, (spad, spad), b_img)
    
    fg_comp_np = np.array(fg_comp)
    fg_bgr = cv2.cvtColor(fg_comp_np[:, :, :3], cv2.COLOR_RGB2BGR)
    fg_alpha = (fg_comp_np[:, :, 3] / 255.0).astype(np.float32)[:, :, np.newaxis]
    
    # 3. Right Card Base (Sleek Dark Glassmorphism, NO NEON)
    rc_base = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    rc_draw = ImageDraw.Draw(rc_base)
    
    # Subtle delicate white border (1px, 28 alpha)
    rc_draw.rounded_rectangle([(rc_x, rc_y), (rc_x + rc_w, rc_y + rc_h)], radius=26, fill=(12, 17, 14, 238), outline=(255, 255, 255, 30), width=1)
    
    # Category Tag Pill Badge (Warm Amber/Gold)
    tag_text = sc["tag"]
    tag_bbox = f_tag.getbbox(tag_text)
    tag_w = (tag_bbox[2] - tag_bbox[0]) + 26
    tag_h = 34
    rc_draw.rounded_rectangle([(rc_x + 35, rc_y + 28), (rc_x + 35 + tag_w, rc_y + 28 + tag_h)], radius=17, fill=(245, 158, 11, 230))
    rc_draw.text((rc_x + 48, rc_y + 34), tag_text, font=f_tag, fill=(15, 23, 18, 255))
    
    # Main Headline (Pure crisp white)
    rc_draw.text((rc_x + 35 + tag_w + 16, rc_y + 27), sc["title"], font=f_card_title, fill=(255, 255, 255, 255))
    
    # Divider (Subtle luxury hairline)
    rc_draw.line([(rc_x + 35, rc_y + 78), (rc_x + rc_w - 35, rc_y + 78)], fill=(255, 255, 255, 30), width=1)
    
    # Subtitle (Soft platinum slate)
    rc_draw.text((rc_x + 35, rc_y + 92), sc["sub"], font=f_card_sub, fill=(203, 213, 225, 255))
    
    # Header & BGM Badges (Sleek dark frosted pills, NO NEON)
    hdr_text = "자연이 빚은 보약  |  토종 야생 다래의 21대 핵심 효능"
    hdr_bbox = f_header.getbbox(hdr_text)
    hdr_w = (hdr_bbox[2] - hdr_bbox[0]) + 36
    hdr_h = 42
    rc_draw.rounded_rectangle([(50, 26), (50 + hdr_w, 26 + hdr_h)], radius=21, fill=(12, 17, 14, 210), outline=(255, 255, 255, 35), width=1)
    rc_draw.text((68, 34), hdr_text, font=f_header, fill=(248, 250, 252, 255))
    
    bgm_text = "음악: 종이비행기 항해"
    bgm_bbox = f_header.getbbox(bgm_text)
    bgm_w = (bgm_bbox[2] - bgm_bbox[0]) + 36
    bgm_x = WIDTH - 50 - bgm_w
    rc_draw.rounded_rectangle([(bgm_x, 26), (bgm_x + bgm_w, 26 + hdr_h)], radius=21, fill=(12, 17, 14, 210), outline=(255, 255, 255, 35), width=1)
    rc_draw.text((bgm_x + 18, 34), bgm_text, font=f_header, fill=(253, 224, 71, 255))
    
    static_frame_rgba = Image.alpha_composite(bg_blurred, rc_base)
    static_frame_bgr = cv2.cvtColor(np.array(static_frame_rgba), cv2.COLOR_RGBA2BGR)
    
    # 4. Pre-render 5X Expanded Subtitle Strip
    bullets = sc["bullets"]
    strip_w = strip_box_w
    
    # Calculate card heights with text wrapping
    card_items = []
    max_desc_w = strip_w - 48
    
    total_content_h = 0
    for b_title, b_desc in bullets:
        desc_lines = wrap_korean_text(b_desc, f_item_desc, max_desc_w)
        # Card height calculation: pad_top(14) + title(26) + gap(8) + lines*(24) + pad_bot(14)
        c_h = 14 + 26 + 8 + len(desc_lines) * 26 + 14
        card_items.append({
            "title": b_title,
            "lines": desc_lines,
            "height": c_h
        })
        total_content_h += c_h + 18
        
    pad_top = 15
    pad_bot = 160
    total_strip_h = max(strip_box_h + 350, pad_top + total_content_h + pad_bot)
    
    strip_img = Image.new('RGB', (strip_w, total_strip_h), (12, 17, 14))
    st_draw = ImageDraw.Draw(strip_img)
    
    cur_y = pad_top
    for ci in card_items:
        ch = ci["height"]
        # Sleek dark moss container with subtle 1px border
        st_draw.rounded_rectangle([(0, cur_y), (strip_w, cur_y + ch)], radius=16, fill=(20, 28, 23), outline=(255, 255, 255, 22), width=1)
        # Title in warm gold
        st_draw.text((24, cur_y + 14), ci["title"], font=f_item_title, fill=(253, 224, 71))
        # Wrapped lines in clean white
        line_y = cur_y + 48
        for l in ci["lines"]:
            st_draw.text((24, line_y), l, font=f_item_desc, fill=(241, 245, 249))
            line_y += 26
        cur_y += ch + 18
        
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

print(f"Prepared {len(scene_assets)} rich scene assets.")

# =========================================================================
# HIGH QUALITY BOKEH & LUMINOUS PARTICLE SYSTEM
# =========================================================================
print("Generating high quality cinematic bokeh & glowing orb sprites...")

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

# Sprite cache
SPRITES = [
    # Gold Bokeh (Large, Mid, Small)
    make_bokeh_sprite(55, (253, 230, 138), 0.22),
    make_bokeh_sprite(35, (253, 224, 71), 0.35),
    make_bokeh_sprite(18, (254, 240, 138), 0.55),
    # Emerald Mint Glow (Large, Mid, Small)
    make_bokeh_sprite(45, (167, 243, 208), 0.20),
    make_bokeh_sprite(28, (110, 231, 183), 0.38),
    make_bokeh_sprite(14, (209, 250, 229), 0.60),
    # Sparkling Diamond Dust
    make_bokeh_sprite(8, (255, 255, 255), 0.85),
    make_bokeh_sprite(5, (255, 255, 240), 0.90)
]

# 45 Particles with 3D Depth & Organic Drifting
random.seed(42)
PARTICLES = []
for i in range(45):
    # Depth layer: 0 (deep background), 1 (midground), 2 (foreground bokeh)
    layer = random.choices([0, 1, 2], weights=[0.45, 0.35, 0.20])[0]
    
    if layer == 0:
        s_idx = random.choice([6, 7]) # Diamond dust
        vy = random.uniform(0.8, 1.6)
        amp = random.uniform(10, 20)
        freq = random.uniform(0.02, 0.04)
    elif layer == 1:
        s_idx = random.choice([2, 5]) # Mid orbs
        vy = random.uniform(0.5, 1.1)
        amp = random.uniform(20, 35)
        freq = random.uniform(0.015, 0.03)
    else:
        s_idx = random.choice([0, 1, 3, 4]) # Large bokeh
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
    target_y = 85 + y_shift - asset["spad"]
    
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

    # 2. Right Card: Upward Scrolling 5X Detailed Subtitles Animation
    scroll_y = int(progress * asset["max_scroll"])
    strip_bgr = asset["strip_bgr"]
    
    # Direct fast slice copy into right content container
    frame[strip_box_y : strip_box_y + strip_box_h, strip_box_x : strip_box_x + strip_box_w] = strip_bgr[scroll_y : scroll_y + strip_box_h, :]

    # 3. High Quality Floating Bokeh & Glowing Particles
    for p in PARTICLES:
        px = int(p["x"] + math.sin(global_f * p["freq"] + p["phase"]) * p["amp"]) % WIDTH
        py = int(p["y"] - global_f * p["vy"]) % HEIGHT
        
        s_bgr, s_alpha, sz = SPRITES[p["s_idx"]]
        half_sz = sz // 2
        
        # Soft breathing opacity
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
            print(f"  [Rendering] {global_f}/{total_frames} ({pct:.1f}%) | Speed: {cur_fps:.1f} FPS | ETA: {eta:.1f}s")

proc.stdin.close()
proc.wait()

print(f"Encoding complete in {time.time() - t0:.2f}s!")

# Copy to KakaoTalk folder
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO_1)
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO_MAIN)
print(f"Saved: {OUT_WORKSPACE}")
print(f"Saved: {OUT_KAKAO_1}")
print(f"Saved: {OUT_KAKAO_MAIN}")
