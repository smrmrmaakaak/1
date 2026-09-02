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
TRANSITION_SEC = 0.45
TRANSITION_FRAMES = int(TRANSITION_SEC * FPS)

FONT_DOHYEON = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\DoHyeon.ttf"
FONT_JUA = r"C:\Users\황태민\Documents\antigravity\calm-hertz\fonts\Jua.ttf"

f_top_badge = ImageFont.truetype(FONT_DOHYEON, 26)
f_tag = ImageFont.truetype(FONT_DOHYEON, 20)
f_card_title = ImageFont.truetype(FONT_DOHYEON, 34)
f_card_sub = ImageFont.truetype(FONT_JUA, 22)
f_item_title = ImageFont.truetype(FONT_DOHYEON, 21)
f_item_desc = ImageFont.truetype(FONT_JUA, 17)

# 21 Scenes: Exactly 8 Detailed Knowledge Cards per Scene (Total 168 Cards)
SCENES = [
    {
        "img": "KakaoTalk_20260829_181618045_19.jpg",
        "tag": "다래의 효능 01",
        "title": "동의보감이 극찬한 신비의 명약, 토종 다래",
        "sub": "깊은 백두대간의 생명력을 품은 대한민국 대표 토종 슈퍼푸드",
        "bullets": [
            ("★ 동의보감 속 미후도(獼猴桃) 기록", "조선 왕실 의학서 『동의보감』에서 미후도로 기록하며 몸의 심한 열을 내리고 갈증을 멎게 하는 명약으로 다룸."),
            ("★ 본초강목 속 약리 효능 입증", "명나라 약학서 『본초강목』에서 중초를 조화롭게 하고 오장육부를 보하며 관절통과 결석을 치료한다고 기록."),
            ("★ 오염 없는 백두대간의 자생력", "오염되지 않은 깊은 산림 계곡부에서 오직 대자연의 이슬과 햇살만으로 자생하여 유효 약리 성분이 농축."),
            ("★ 털이 없는 매끄러운 껍질 구조", "일반 키위와 달리 껍질에 털이 없어 껍질 직하층의 플라보노이드와 펙틴을 손실 없이 통째로 섭취."),
            ("★ 조선 왕실의 귀한 진상품", "가을철 궁중에 진상되던 귀한 자생 과실로서 왕실 가족의 원기 회복과 면역 증진에 적극 활용."),
            ("★ 100% 무농약 자연산 슈퍼푸드", "인위적인 화학 비료와 농약 없이 자연 생태계의 자정작용 속에서 자라난 순수 자연산 열매."),
            ("★ 천연 발효와 생체 이용률 상승", "후숙과 발효를 거치며 유기산과 효소 활성도가 극대화되어 체내 흡수율이 비약적으로 상승."),
            ("★ 사계절 보약으로 전해진 민간 비방", "민간에서 환절기 감기와 기력 저하를 다스리는 으뜸 상비 과실로 오래도록 애용.")
        ],
        "dur": 7.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_20.jpg",
        "tag": "다래의 효능 02",
        "title": "사과의 20배! 천연 비타민 C의 절대 강자",
        "sub": "지친 몸에 활력을 불어넣고 전신 면역 방어벽을 급속 충전",
        "bullets": [
            ("● 압도적인 고농축 비타민 C 함량", "100g당 최대 300mg의 비타민 C를 함유하여 사과의 20배, 레몬의 3배, 오렌지의 4배 이상 농축."),
            ("● 천연 유기 비타민 복합체 구조", "합성 비타민과 달리 비타민 P(바이오플라보노이드)와 유기산이 결합되어 생체 이용률 최상."),
            ("● 위장 자극 없는 부드러운 흡수", "천연 과육의 완충 작용으로 속 쓰림이나 위산 과다 없이 혈액 속으로 빠르게 흡수."),
            ("● 백혈구 식균 작용 및 방어력 증강", "강력한 환원력으로 체내 침입한 바이러스와 병원균을 포식하는 면역 세포의 기능을 극대화."),
            ("● 만성 피로와 무기력증 급속 해소", "체내 피로 물질인 젖산을 산화 분해하고 에너지 대사를 촉진하여 활력을 즉각 되살림."),
            ("● 부신 피로 회복과 항스트레스", "스트레스 호르몬 코르티솔의 과다 분비를 정상화하여 신체 저항력과 멘탈 안정감 부여."),
            ("● 철분 흡수율 비약적 촉진", "비타민 C가 음식물 속 비헴철을 2가 철 이온으로 환원시켜 빈혈 예방 및 혈색 개선."),
            ("● 신체 조직의 콜라겐 합성 지원", "뼈, 연골, 혈관벽, 피부를 구성하는 핵심 단백질인 콜라겐의 가교 결합을 촉진.")
        ],
        "dur": 7.2, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_11.jpg",
        "tag": "다래의 효능 03",
        "title": "식약처 인정 면역 기능성 물질 PG102",
        "sub": "과민성 면역 불균형을 바로잡는 첨단 바이오 과학의 결정체",
        "bullets": [
            ("● 국내 최초 식약처 개별인정 획득", "명문대 연구진의 오랜 연구로 규명된 다래 추출물 PG102 성분은 면역과민반응 개선 기능성 공식 인정."),
            ("● Th1과 Th2 면역 밸런스 정상화", "한쪽으로 치우쳐 알레르기와 염증을 일으키는 Th2 면역 반응을 억제하고 이상적인 면역 균형 복원."),
            ("● 면역글로불린 IgE 생성 억제", "과도한 알레르기 반응을 유발하는 혈중 IgE 항체 수치를 현저히 감소시켜 유해 자극 저항력 복원."),
            ("● 염증 유발 사이토카인 분비 차단", "체내 염증 신호 물질인 인터루킨(IL-4, IL-5, IL-13) 생성을 억제하여 전신 염증 수치 안정화."),
            ("● 비만세포 탈과립 방지", "알레르기 발작을 일으키는 비만세포의 막을 안정화하여 염증 매개 물질의 분출을 사전 차단."),
            ("● 자가면역 질환 완화 지원", "면역계가 자신의 신체 조직을 공격하는 과민 반응을 조절하여 관절과 피부 건강 유지."),
            ("● 안전성이 입증된 천연 추출물", "내성이나 부작용 걱정 없이 장기 섭취가 가능한 100% 식물성 안전 원료."),
            ("● 체질 개선을 통한 근본 치료", "일시적인 증상 완화가 아닌 면역 체계의 근본적인 밸런스를 조율하는 체질 개선 효과.")
        ],
        "dur": 7.2, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_16.jpg",
        "tag": "다래의 효능 04",
        "title": "지긋지긋한 알레르기 비염 & 천식 완벽 케어",
        "sub": "환절기 코막힘, 맑은 콧물, 발작적 재채기와 호흡기 염증 진정",
        "bullets": [
            ("● 비강 점막의 과민 염증 반응 진정", "꽃가루, 미세먼지, 집먼지진드기로 인해 붓고 헐어버린 비강 점막의 모세혈관 염증을 신속 진정."),
            ("● 히스타민 방출의 근원적 차단", "콧물, 눈물, 발작적 연속 재채기를 유발하는 히스타민의 체내 방출을 근본적으로 억제."),
            ("● 기관지 기도 평활근 경련 이완", "기도의 과민성을 낮추고 기관지 근육을 이완시켜 만성 기침과 천식성 호흡 곤란을 시원하게 개선."),
            ("● 호흡기 1차 점막 섬모 운동 촉진", "기관지 점막의 섬모 운동성을 높여 외부 오염물질과 가래를 신속히 체외로 배출."),
            ("● 환절기 코막힘 및 답답함 해소", "콧속 비강 부종을 가라앉혀 수면 중 입호흡을 방지하고 깊고 편안한 호흡 유도."),
            ("● 만성 인후통 및 목 칼칼함 완화", "목의 열감을 내리고 기관지 건조감을 해소하여 목소리를 맑고 편안하게 유지."),
            ("● 폐 기능 활성화와 산소 공급", "폐포의 가스 교환 능력을 도와 전신 세포로의 산소 공급 효율을 극대화."),
            ("● 알레르기 계절 체질 강화", "환절기마다 반복되는 비염 증상의 재발 빈도와 중증도를 대폭 경감.")
        ],
        "dur": 7.2, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_10.jpg",
        "tag": "다래의 효능 05",
        "title": "극심한 아토피 피부염 & 가려움증 집중 완화",
        "sub": "피부 속 만성 염증을 정화하여 밤마다 편안한 숙면 선사",
        "bullets": [
            ("★ 야간 가려움증 신경 신호 차단", "밤마다 피가 나도록 긁게 만드는 가려움 유발 신경 펩타이드 생성을 억제해 숙면 보장."),
            ("★ 손상된 피부 표피 지질 장벽 재건", "세라마이드 합성을 도와 건조하고 갈라진 피부 표피층의 유수분 보호막을 탄탄하게 복원."),
            ("★ 소아 및 성인 아토피 체질 개선", "스테로이드 내성 걱정 없는 천연 식물성 성분으로 피부 기저층의 만성 염증을 정화."),
            ("★ 붉은 홍조 및 피부 열감 진정", "외부 마찰과 자극에 민감하게 달아오르는 피부 혈관을 안정시키고 정상 피부톤 회복."),
            ("★ 접촉성 피부염 및 두드러기 완화", "금속, 합성섬유, 화학물질로 인한 급성 피부 트러블과 팽진 증상을 신속 가라앉힘."),
            ("★ 표피 세포의 정상 각질화 주기", "건조증으로 인해 하얗게 일어나는 각질 탈락을 정상화하여 매끄러운 살결 유지."),
            ("★ 피부 보습막 형성 및 수분 유지", "피부 속 깊은 곳의 수분 증발을 차단하여 당김 없이 촉촉하고 부드러운 피부결 형성."),
            ("★ 상처 치유 및 흉터 색소 침착 예방", "긁어서 생긴 미세 상처의 상피 세포 재생을 촉진하고 거뭇한 색소 침착 방지.")
        ],
        "dur": 7.5, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_17.jpg",
        "tag": "다래의 효능 06",
        "title": "천연 단백질 분해 효소 액티니딘의 기적",
        "sub": "고기 먹은 후 더부룩함을 싹 씻어주는 위장 속 천연 소화제",
        "bullets": [
            ("● 강력한 육류 단백질 미세 분해", "파파야의 파파인, 파인애플의 브로멜라인보다 월등히 온화하면서도 강력한 펩타이드 결합 절단력."),
            ("● 위장 내 음식물 체류 시간 단축", "소화력이 약한 노약자, 어린이, 수험생의 위장관 내 음식물 소화 시간을 절반 이하로 단축."),
            ("● 식후 복부 팽만감과 신트림 해소", "고기나 고단백 식사 후 발생하는 가스 참, 더부룩함, 헛배부름을 단시간 내에 해결."),
            ("● 위벽 자극 없는 부드러운 소화", "위산 과다 없이 음식물을 부드러운 미즙 상태로 만들어 소장으로의 편안한 이동 유도."),
            ("● 펩신 효소 활성화 보조", "위액 속 단백질 분해 효소의 활성을 극대화하여 난소화성 단백질까지 완벽 분해."),
            ("● 식체 및 급체 증상 천연 응급 처방", "과식으로 인해 명치가 꽉 막히고 답답할 때 속을 시원하게 뚫어주는 천연 소화액."),
            ("● 십이지장 췌장 효소 부담 경감", "췌장에서 분비되는 소화 효소의 소모를 줄여 췌장 건강과 대사 기능 보존."),
            ("● 아미노산 흡수 효율 극대화", "단백질을 미세 아미노산 단위로 쪼개어 근육 생성과 면역 항체 합성에 즉각 활용.")
        ],
        "dur": 7.5, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045.jpg",
        "tag": "다래의 효능 07",
        "title": "지독한 변비 탈출 & 묵은 숙변 완벽 배출",
        "sub": "장 연동 운동을 되살려 매일 아침 가볍고 상쾌한 쾌변",
        "bullets": [
            ("● 수용성 및 불용성 식이섬유의 조화", "장내 수분을 강력히 끌어당겨 대변의 부피를 키우고 부드러운 젤 형태로 만들어 쾌변 유도."),
            ("● 천연 식물성 펙틴의 흡착 배출", "장벽 주름 구석구석에 달라붙은 오래된 묵은 숙변과 부패 찌꺼기를 흡착하여 배출."),
            ("● 대장 자율신경 연동 운동 강화", "무력해진 대장 평활근의 자연스러운 수축 이완 리듬을 되살려 만성 이완성 변비 치료."),
            ("● 배변 후 잔변감 없는 상쾌함", "대장 하부 압력을 낮추고 항문 주위 혈관 울혈을 방지하여 치질과 치핵 예방."),
            ("● 굳은 변으로 인한 항문 열상 방지", "대변의 수분 함량을 최적화하여 배변 시 통증과 출혈 위험을 완벽히 차단."),
            ("● 장내 유독 가스 발생 및 복통 완화", "장내 음식물의 이상 발효를 막아 배에 가스가 차서 생기는 콕콕 쑤시는 복통 해결."),
            ("● 규칙적인 아침 배변 습관 형성", "장의 생체 리듬을 정상화하여 매일 아침 일정한 시간에 상쾌한 배변 유도."),
            ("● 약물성 하제 의존도 탈피", "자극성 변비약에 내성이 생긴 장을 천연 식이섬유의 힘으로 자연스럽게 회복.")
        ],
        "dur": 7.2, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_01.jpg",
        "tag": "다래의 효능 08",
        "title": "장내 100조 개 유익균을 살리는 마이크로바이옴",
        "sub": "면역의 70%를 담당하는 장 건강을 튼튼하게 지키는 천연 프리바이오틱스",
        "bullets": [
            ("● 비피더스균 유산균 증식 촉진", "장내 유익균이 가장 선호하는 올리고당과 천연 다당류가 풍부하여 유익균 폭발적 증식."),
            ("● 장내 부패균 및 악취 가스 억제", "클로스트리디움 등 유해 부패균의 정착을 막아 암모니아, 인돌 등 유독 가스 차단."),
            ("● 단쇄지방산(SCFA) 생성 촉진", "대장 상피세포의 주 에너지원인 부티레이트 생성을 늘려 튼튼한 장벽 방어선 구축."),
            ("● 장누수증후군(Leaky Gut) 예방", "장 점막 결합 단백질을 강화하여 독소가 혈관으로 새어나가는 장 누수 차단."),
            ("● 장 림프조직(GALT) 면역 활성", "인체 면역 세포의 70%가 집중된 장 점막 면역계를 활성화하여 전신 방어벽 확립."),
            ("● 세로토닌 합성으로 장-뇌 축 건강", "행복 호르몬 세로토닌의 90%가 만들어지는 장 환경을 건강하게 조성해 기분 개선."),
            ("● 과민성 대장 증후군 증상 완화", "설사와 변비가 반복되는 과민성 대장의 신경 과민을 가라앉히고 장내 평온 유지."),
            ("● 영양소 소장 흡수율 극대화", "융모의 미세 구조를 건강하게 유지하여 비타민과 미네랄의 흡수 효율을 비약적 향상.")
        ],
        "dur": 7.2, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_02.jpg",
        "tag": "다래의 효능 09",
        "title": "유해 활성산소를 제거하는 강력한 항산화 쉴드",
        "sub": "세포 산화와 노화를 막아내는 천연 폴리페놀과 카로티노이드",
        "bullets": [
            ("★ 활성산소(ROS) 완벽 소거 작용", "호흡, 스트레스, 대사 과정에서 끊임없이 발생하는 유해 산화 물질을 강력 무력화."),
            ("★ 세포막 불포화지방산 산패 방어", "세포를 둘러싼 지질의 과산화를 억제하여 세포 구조와 미토콘드리아 기능을 보존."),
            ("★ 유전자 DNA 손상 및 돌연변이 차단", "산화 스트레스로 인한 유전자 변형을 방어하여 세포의 조기 노화와 변이 방지."),
            ("★ 플라보노이드의 강력한 전자 공여", "비타민 C와 시너지 효과를 내어 체내 항산화 효소(SOD, 카탈라아제) 활성 증강."),
            ("★ 신체 활력 지수 및 스태미나 증강", "신체 조직의 산소 이용 효율을 높여 피로에 쉽게 지치지 않는 강력한 지구력 부여."),
            ("★ 뇌와 심장 모세혈관 산화 방지", "산화 손상에 취약한 미세 모세혈관 내피세포를 보호하여 말초 순환 개선."),
            ("★ 만성 퇴행성 질환 위험 경감", "전신 세포의 만성적인 산화 손상을 방지하여 노화로 인한 퇴행성 질환 예방."),
            ("★ 세포 자멸사(Apoptosis) 정상 제어", "이상 변형된 세포의 사멸 주기를 정상화하여 건강한 세포 집단 유지.")
        ],
        "dur": 7.2, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_03.jpg",
        "tag": "다래의 효능 10",
        "title": "콜라겐 합성 & 맑고 환한 동안 백옥 피부",
        "sub": "진피층부터 차오르는 탄력과 멜라닌 억제로 완성하는 피부 회춘",
        "bullets": [
            ("● 진피층 콜라겐 합성 200% 촉진", "비타민 C가 섬유아세포를 자극하여 콜라겐과 엘라스틴 합성을 증진, 깊은 주름 예방."),
            ("● 멜라닌 색소 생성 효소 억제", "티로시나아제 활성을 차단하여 기미, 주근깨, 잡티, 색소 침착을 막고 맑은 피부톤 유지."),
            ("● 천연 보습 인자(NMF) 수분 강화", "표피층의 수분 증발을 막고 수분 보유력을 높여 속당김 없이 촉촉한 물광 피부 완성."),
            ("● 자외선 광노화로부터 피부 보호", "햇빛 노출로 발생하는 피부 산화 열감을 진정시키고 광노화 탄력 저하를 방어."),
            ("● 피부 모공 수축 및 탄력 개선", "진피 기저막의 결합 조직을 강화하여 늘어진 모공을 조여주고 매끄러운 피부결 형성."),
            ("● 피부 신진대사 턴오버 주기 정상화", "노화로 둔화된 피부 재생 주기를 28일로 되돌려 묵은 각질 없이 투명한 안색."),
            ("● 여드름 흉터 및 붉은 자국 완화", "염증 후 색소 침착을 방지하고 손상된 피부 상피의 빠른 재생 유도."),
            ("● 항염증 작용으로 피부 트러블 억제", "과도한 피지 분비를 조절하고 모공 속 세균 증식을 막아 뾰루지 예방.")
        ],
        "dur": 7.2, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_04.jpg",
        "tag": "다래의 효능 11",
        "title": "체내 나트륨 배출 & 혈관 이완 고혈압 완화",
        "sub": "풍부한 칼륨이 짠 음식 독소를 씻어내고 만성 부종 해결",
        "bullets": [
            ("● 풍부한 천연 칼륨(K) 함유", "맵고 짠 식단으로 인해 체내에 축적된 과도한 나트륨을 신장을 통해 소변으로 빠르게 배출."),
            ("● 혈관 평활근 이완 및 혈압 강하", "혈관벽을 수축시키는 요인을 차단하고 혈관을 부드럽게 이완시켜 혈압 안정화."),
            ("● 아침 얼굴 붓기와 하체 부종 개선", "세포 간질액의 불필요한 수분 정체 현상을 해소하여 무겁고 붓는 몸을 가볍게."),
            ("● 심장 펌프 기능 부담 완화", "순환 혈액량을 적정 수준으로 조절하여 심장에 가해지는 과도한 혈류 저항 경감."),
            ("● 혈관 내피세포 산화 질소(NO) 생성 촉진", "혈관 확장 물질인 산화질소의 분비를 도와 혈액 흐름을 막힘없이 개선."),
            ("● 뇌혈관 고혈압성 손상 방어", "뇌로 가는 혈류 압력을 조절하여 고혈압으로 인한 뇌혈관 파열 및 뇌졸중 위험 차단."),
            ("● 전해질 균형 정상화", "칼륨, 나트륨, 마그네슘의 체내 농도를 최적의 상태로 맞춰 신경과 근육의 정상 기능 유지."),
            ("● 만성 신장 부담 경감", "혈압 상승으로 인한 신장 모세혈관 손상을 막아 신장 사구체 여과율 보존.")
        ],
        "dur": 7.2, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_05.jpg",
        "tag": "다래의 효능 12",
        "title": "혈관 속 기름때 청소 & 나쁜 콜레스테롤(LDL) 억제",
        "sub": "피를 맑게 하고 혈전을 방지하여 심근경색과 뇌졸중 철벽 예방",
        "bullets": [
            ("● 수용성 펙틴의 혈중 지질 배출", "혈관벽에 기름때를 형성하는 나쁜 콜레스테롤(LDL)을 장내에서 흡착하여 체외 배출."),
            ("● 혈전(피떡) 형성 및 혈소판 응집 억제", "혈액 점도를 낮추고 끈적거림을 방지하여 막힘없는 원활한 혈류 순환 유지."),
            ("● 동맥경화 및 혈관 경화증 예방", "나이가 들며 딱딱하게 굳어가는 동맥 혈관벽의 탄력성을 복원하여 심혈관 위험 급감."),
            ("● 좋은 HDL 콜레스테롤 활성화", "혈관 속 잉여 지방을 간으로 회수하는 청소부 역할을 강화하여 깨끗한 혈관 환경 조성."),
            ("● 중성지방(Triglyceride) 수치 개선", "간에서 합성되는 여분의 중성지방 생성을 억제하여 맑고 깨끗한 혈액 유지."),
            ("● 관상동맥 협착 및 협심증 방지", "심장 근육에 산소를 공급하는 관상동맥의 미세 플라크 형성을 철벽 차단."),
            ("● 손발 저림 및 수족냉증 완화", "말초 혈관 끝까지 따뜻한 혈액이 원활히 공급되도록 도와 손발 시림 해소."),
            ("● 혈관 내피 염증 반응 억제", "혈관 내벽을 헐게 만드는 C-반응성 단백질(CRP) 수치를 낮추어 혈관 수명 연장.")
        ],
        "dur": 7.2, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_06.jpg",
        "tag": "다래의 효능 13",
        "title": "혈당 스파이크 방지 & 인슐린 저항성 개선",
        "sub": "혈당 걱정 없이 안전하게 당 대사를 정상화하는 착한 과일",
        "bullets": [
            ("★ 낮은 당지수(Low GI) 건강 과일", "식후 포도당 흡수가 서서히 이루어져 당뇨 환자에게 치명적인 혈당 스파이크를 방지."),
            ("★ 탄수화물 분해 효소 활성 지연", "알파-글루코시다아제 효소 작용을 완만하게 조절하여 식후 혈당 급상승을 억제."),
            ("★ 췌장 베타세포 인슐린 분비 부담 경감", "급격한 인슐린 분비 충격을 줄여 인슐린을 만드는 췌장의 피로도를 덜어줌."),
            ("★ 말초 근육 인슐린 수용체 감수성 증진", "근육과 간세포가 혈액 속 포도당을 에너지로 신속히 흡수 연소하도록 유도."),
            ("★ 당화혈색소(HbA1c) 수치 안정화", "혈액 속 단백질과 당이 결합하는 비가역적 당화 반응을 억제하여 혈당 관리 지원."),
            ("★ 당뇨병성 미세혈관 합병증 보호", "고혈당으로 인해 발생하는 망막증, 신증 등 미세혈관 손상을 항산화 성분이 방어."),
            ("★ 식후 급격한 식곤증 및 피로 예방", "혈당의 롤러코스터 현상을 막아 식사 후 쏟아지는 극심한 졸음과 피로 해소."),
            ("★ 복부 비만과 내장지방 축적 차단", "남는 당분이 지방으로 변환되어 간과 복부에 쌓이는 대사증후군 경로 차단.")
        ],
        "dur": 7.2, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_07.jpg",
        "tag": "다래의 효능 14",
        "title": "지친 간 기능 재생 & 숙취 아세트알데히드 해독",
        "sub": "아스파라긴산과 천연 유기산이 알코올 독소를 신속히 정화",
        "bullets": [
            ("● 천연 아스파라긴산의 숙취 분해", "음주 후 두통, 메스꺼움, 갈증을 유발하는 1급 독성 아세트알데히드를 빠르게 분해 배출."),
            ("● 간 효소 수치(AST, ALT) 안정화", "과음, 과로, 스트레스로 손상된 간세포의 염증을 가라앉히고 정상 간 지표 회복."),
            ("● 인체 최강 항산화 글루타치온 생성 지원", "간세포 내 글루타치온 합성을 촉진하여 간으로 유입되는 독성 물질 정밀 해독."),
            ("● 지방간 억제 및 담즙 분비 촉진", "간 내 지방 대사를 원활하게 도와 간에 중성지방이 끼는 알코올성 및 비알코올성 지방간 억제."),
            ("● 음주 후 위장 쓰림 및 탈수 예방", "알코올로 인해 손상된 위 점막을 보호하고 수분과 전해질을 신속히 재공급."),
            ("● 간문맥 혈류 순환 개선", "간으로 유입되는 혈액 순환을 촉진하여 간 대사 노폐물의 정체를 방지."),
            ("● 만성 간 피로 및 무기력증 해소", "간 기능 저하로 인해 신체에 쌓인 만성 독소를 정화하여 가벼운 몸 컨디션 회복."),
            ("● 간세포 단백질 합성 및 재생 촉진", "손상된 간 조직의 단백질 대사를 정상화하여 건강한 간세포 재생 가속.")
        ],
        "dur": 7.2, "motion": "pan_up"
    },
    {
        "img": "KakaoTalk_20260829_181618045_08.jpg",
        "tag": "다래의 효능 15",
        "title": "신장 여과 기능 강화 & 요산 배출 통풍 예방",
        "sub": "이뇨 작용을 촉진하여 체내 결석 형성을 막고 신장 건강 수호",
        "bullets": [
            ("● 천연 이뇨 작용으로 노폐물 배출", "신장 사구체의 여과 기능을 도와 체내 축적된 대사 찌꺼기와 수분 노폐물을 시원하게 배출."),
            ("● 관절 찌르는 요산 결정체 배설", "퓨린 대사 이상으로 혈액 속에 쌓여 관절에 극심한 통증을 주는 요산 수치 정상화."),
            ("● 소변 산도 조절 및 결석 형성 방지", "소변의 pH 밸런스를 맞춰 옥살산칼슘 등 신장 결석과 요로 결석 결정 생성을 억제."),
            ("● 신장 세뇨관 세포 산화 손상 방어", "혈액 여과 과정에서 발생하는 산화 스트레스로부터 신장 조직을 보호해 만성 신부전 예방."),
            ("● 신장성 만성 부종 및 단백뇨 개선", "사구체 기저막의 투과성을 안정시켜 불필요한 단백질 누출을 막고 부종 완화."),
            ("● 방광 및 요로 감염 억제", "소변 배출량을 늘리고 요로 점막에 세균이 부착하는 것을 막아 방광염 예방."),
            ("● 신장 혈류량 공급 정상화", "신장으로 들어가는 모세혈관의 혈류를 원활히 하여 신장 조직의 산소 결핍 방지."),
            ("● 전신 수분 대사 밸런스 유지", "체내 세포 외액과 내액의 수분 균형을 최적화하여 붓기 없는 가벼운 신체 유지.")
        ],
        "dur": 7.2, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_12.jpg",
        "tag": "다래의 효능 16",
        "title": "칼슘·마그네슘·비타민 K의 조화로 골다공증 예방",
        "sub": "뼈 밀도를 치밀하게 채워 중장년 골절 예방과 성장기 발육 촉진",
        "bullets": [
            ("★ 칼슘과 마그네슘의 이상적 비율", "뼈의 미세 구조를 형성하는 핵심 미네랄이 최적의 비율로 함유되어 뼈의 강도 강화."),
            ("★ 비타민 K의 오스테오칼신 활성화", "섭취한 칼슘이 혈관벽에 쌓이지 않고 뼈 조직 기질에 단단히 결합되도록 유도."),
            ("★ 골 흡수 억제 및 파골세포 조절", "노화로 인해 뼈가 녹아 빠져나가는 골 손실 속도를 늦춰 중장년층 골절 위험 급감."),
            ("★ 성장기 어린이 골격 성장 지원", "뼈의 길이 성장과 성장판 세포 분열을 도와 청소년의 튼튼한 골격 형성을 든든히 뒷받침."),
            ("★ 관절 연골 기질 보호", "프로테오글리칸 합성을 도와 관절 연골의 마모를 방지하고 관절염 통증 완화."),
            ("★ 치아 법랑질 치밀도 강화", "치아를 둘러싼 무기질 층을 단단하게 유지하여 충치와 잇몸 치주 질환 예방."),
            ("★ 갱년기 여성 호르몬 변화 골 손실 방어", "에스트로겐 감소로 인해 급격히 진행되는 여성 골밀도 저하를 효과적으로 억제."),
            ("★ 근육과 인대 지지력 향상", "뼈 주변을 감싸는 근육과 인대의 수축력을 높여 관절에 가해지는 충격을 분산.")
        ],
        "dur": 7.2, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_13.jpg",
        "tag": "다래의 효능 17",
        "title": "침침한 눈 피로 회복 & 황반변성·시력 보호",
        "sub": "루테인, 제아잔틴, 비타민 A로 완성하는 맑고 선명한 눈",
        "bullets": [
            ("● 루테인 & 제아잔틴 황반 색소 유지", "망막 중심부 황반의 색소 밀도를 촘촘하게 유지하여 시각 해상도와 시력 저하 방어."),
            ("● 전자기기 유해 블루라이트 차단", "스마트폰과 컴퓨터 모니터의 유해 파장을 필터링하여 망막 시세포의 광화학 손상 경감."),
            ("● 안구 건조증 개선 및 각막 보호", "눈물막의 지질층을 안정화시키고 각막 표면의 산소 공급을 도와 뻑뻑한 눈을 맑게 개선."),
            ("● 노인성 백내장 진행 억제", "수정체 단백질이 활성산소에 의해 뿌옇게 변성되는 산화 반응을 막아 맑은 시야 유지."),
            ("● 야맹증 개선 및 암순응 촉진", "어두운 곳에서 시각 적응 능력을 높여주는 로돕신 색소의 재합성을 촉진."),
            ("● 망막 모세혈관 혈류 공급 원활", "눈 뒷부분의 미세 모세혈관 혈류를 원활히 하여 시신경 세포의 영양 공급 강화."),
            ("● 눈의 조절력 피로와 눈부심 완화", "장시간 근거리 작업으로 긴장된 모양체 근육의 피로를 풀어주어 눈의 초점 조절력 회복."),
            ("● 녹내장 안압 상승 완화 지원", "안구 내 방수 순환을 원활히 돕고 시신경 섬유의 산화 손상을 억제.")
        ],
        "dur": 7.2, "motion": "pan_down"
    },
    {
        "img": "KakaoTalk_20260829_181618045_14.jpg",
        "tag": "다래의 효능 18",
        "title": "두뇌 활성화 & 깜빡하는 기억력 감퇴 예방",
        "sub": "풍부한 천연 엽산과 항산화제가 뇌 신경세포를 철벽 수호",
        "bullets": [
            ("● 고함량 엽산(Folate)의 신경망 활성", "아세틸콜린 등 뇌 신경전달물질 합성을 촉진하여 뇌 신호 전달 속도와 인지력 향상."),
            ("● 뇌혈관 손상 독소 호모시스테인 분해", "뇌혈관을 파괴하고 알츠하이머를 유발하는 혈중 유해 아미노산 농도를 낮추어 뇌 보호."),
            ("● 뇌세포 미세혈관 혈류 공급 개선", "뇌 모세혈관을 확장하여 신선한 산소와 포도당 영양소를 뇌 구석구석 원활하게 공급."),
            ("● 수험생 학습 피로와 두뇌 회복", "장시간 두뇌 활동으로 과열된 뇌 신경의 산화 스트레스를 진정시키고 집중력 유지."),
            ("● 뇌 신경세포 시냅스 가소성 증강", "신경세포 간의 연결 회로를 유연하게 유지하여 새로운 정보 학습 및 기억 저장력 강화."),
            ("● 뇌신경 영양 인자(BDNF) 분비 촉진", "뇌세포의 생존과 성장을 돕는 신경 영양 인자의 생성을 유도하여 뇌 노화 지연."),
            ("● 건망증 및 브레인 포그(Brain Fog) 해소", "머리가 멍하고 안개가 낀 듯 답답한 두뇌 피로를 맑고 명쾌하게 개선."),
            ("● 노인성 인지 기능 저하 및 치매 예방", "베타 아밀로이드 단백질의 뇌 축적을 억제하여 건강한 노년기 두뇌 수명 유지.")
        ],
        "dur": 7.2, "motion": "zoom_out"
    },
    {
        "img": "KakaoTalk_20260829_181618045_18.jpg",
        "tag": "다래의 효능 19",
        "title": "긴장된 신경 안정 & 꿀잠 유도 (불면증 탈출)",
        "sub": "천연 마그네슘과 세로토닌의 힘으로 뒤척임 없는 깊은 숙면",
        "bullets": [
            ("★ 신경 흥분 완화 및 GABA 활성화", "과도하게 각성된 교감신경을 이완시키고 뇌파를 안정된 알파파로 유도하여 마음 진정."),
            ("★ 수면 호르몬 멜라토닌 분비 촉진", "낮 동안 세로토닌 합성을 돕고 밤이 되면 자연스럽게 수면 호르몬으로 전환시켜 숙면 유도."),
            ("★ 근육 긴장 이완 및 야간 쥐내림 방지", "마그네슘이 근육 경련과 신경 떨림을 부드럽게 풀어주어 안락한 수면 환경 제공."),
            ("★ 만성 스트레스 및 불안감 해소", "우울감과 초조함을 부드럽게 가라앉혀 심신의 긴장을 자연스럽게 해소해주는 천연 테라피."),
            ("★ 수면 주기(렘수면/비렘수면) 정상화", "깊은 서파 수면 시간을 늘려 잠자는 동안 뇌의 피로 물질이 깨끗이 청소되도록 유도."),
            ("★ 자율신경계 불균형(교감/부교감) 조율", "스트레스로 무너진 자율신경 밸런스를 바로잡아 가슴 두근거림과 호흡 불안정 완화."),
            ("★ 아침 기상 시 개운함과 피로 회복", "수면의 질을 비약적으로 높여 짧은 잠을 자더라도 상쾌하고 개운한 아침 컨디션."),
            ("★ 수면제 의존 없는 천연 자연 수면", "중독성이나 약물 내성 걱정 없이 뇌의 자연스러운 수면 유도 메커니즘을 복원.")
        ],
        "dur": 7.5, "motion": "zoom_in"
    },
    {
        "img": "KakaoTalk_20260829_181618045_09.jpg",
        "tag": "다래의 효능 20",
        "title": "인체 최강 면역 NK세포 활성화 & 항암 방어망",
        "sub": "돌연변이 세포를 스스로 찾아 파괴하는 대자연의 강력한 방어력",
        "bullets": [
            ("● 자연살해세포(NK Cell) 활성 대폭 증강", "체내에서 매일 생겨나는 변이 암세포를 스스로 식별해 파괴하는 NK세포 공격력 극대화."),
            ("● 1급 발암물질 니트로사민 합성 억제", "식품 찌꺼기에서 생성되는 강력한 위암, 대장암 유발 인자의 체내 합성을 원천 차단."),
            ("● 비정상 암세포 신생 혈관 차단", "돌연변이 세포가 영양을 공급받기 위해 주변으로 뻗어 나가는 미세혈관 생성을 강력 억제."),
            ("● 24시간 전신 면역 감시 체계 가동", "침묵하는 면역 체계를 깨워 외부 바이러스와 이상 세포의 증식을 철저하게 감시."),
            ("● 암세포 전이 및 침습 억제", "변이 세포가 주변 조직으로 파고들거나 혈관을 타고 전이되는 효소 작용을 무력화."),
            ("● 항암 활성 다당류의 면역 자극", "체내 대식세포와 T세포를 활성화하여 종양 세포에 대한 다각도 면역 공격 유도."),
            ("● 방사선 및 유해 환경 독소 해독", "일상 속 미세 방사선과 환경 호르몬이 유발하는 유전자 손상을 정밀 수리."),
            ("● 전신 생체 방어력의 체계적 강화", "외부 발암 요인에 굴복하지 않는 강력한 신체 방어벽을 구축하여 평생 건강 보장.")
        ],
        "dur": 11.0, "motion": "pan_left_right"
    },
    {
        "img": "KakaoTalk_20260829_181618045_15.jpg",
        "tag": "다래의 효능 21",
        "title": "대자연이 선사한 기적의 열매, 온 가족 평생 보약",
        "sub": "사계절 내내 지치지 않는 활력과 면역을 선사하는 자연의 선물",
        "bullets": [
            ("★ 완벽한 천연 영양소의 생명체 하모니", "비타민, 미네랄, 파이토케미컬, 효소, 유기산이 총망라된 자연의 종합 천연 영양제."),
            ("★ 사계절 무병장수의 든든한 건강 동반자", "계절이 바뀔 때마다 찾아오는 환절기 잔병치레와 피로로부터 온 가족을 빈틈없이 수호."),
            ("★ 청정 숲의 순수한 생명력 그대로", "농약과 인공 비료 없이 깊은 산골의 정기만으로 맺힌 귀한 토종 열매의 은혜를 온전히 누리세요."),
            ("★ 어르신 기력 보강과 청소년 성장 발육", "온 가족 남녀노소 누구나 부담 없이 매일 즐기는 최고의 가정 상비 건강 과실."),
            ("★ 체질 개선과 전신 활력의 샘물", "지치지 않는 에너지와 맑고 투명한 혈액으로 매일매일 건강한 삶의 질을 선물."),
            ("★ 자연 치유력(Immunity)의 극대화", "인체 본연의 자정 작용과 면역 복원력을 일깨워 스스로 병을 물리치는 힘을 길러줌."),
            ("★ 소중한 분들에게 전하는 귀한 선물", "자연의 맑은 기운과 정성이 담긴 토종 다래는 사랑하는 분들을 위한 가장 뜻깊은 선물."),
            ("★ 늘 건강과 활력이 충만하시길 기원합니다!", "깊고 풍부한 맛과 놀라운 효능을 지닌 토종 다래와 함께 온 가족 모두 늘 건강하세요!")
        ],
        "dur": 11.42, "motion": "zoom_out"
    }
]

AUDIO_LEN = 158.72
total_dur = sum(s["dur"] for s in SCENES)
for s in SCENES:
    s["dur"] = (s["dur"] / total_dur) * AUDIO_LEN

print(f"Total Vertical Shorts duration: {AUDIO_LEN:.2f}s ({len(SCENES)} scenes)")

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

print("Pre-rendering 8-card vertical Shorts assets (1080x1920)...")
scene_assets = []

# Upper photo bounds: y = 120 to y = 960 (h=840)
photo_stage_y = 120
photo_stage_h = 840
photo_center_x = WIDTH // 2

# Lower card bounds: y = 980 to y = 1845 (h=865)
card_x = 50
card_y = 980
card_w = WIDTH - 100  # 980px
card_h = 865

strip_box_x = card_x + 30
strip_box_y = card_y + 145
strip_box_w = card_w - 60  # 920px
strip_box_h = card_h - 170  # 695px

for idx, sc in enumerate(SCENES):
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
    top_badge_text = "★ 자연이 빚은 보약 | 토종 다래의 21대 핵심 효능"
    tb_bbox = f_top_badge.getbbox(top_badge_text)
    tb_w = (tb_bbox[2] - tb_bbox[0]) + 44
    tb_h = 50
    tb_x = (WIDTH - tb_w) // 2
    tb_y = 45
    
    rc_top = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    tb_draw = ImageDraw.Draw(rc_top)
    tb_draw.rounded_rectangle([(tb_x, tb_y), (tb_x + tb_w, tb_y + tb_h)], radius=25, fill=(12, 17, 14, 230), outline=(255, 255, 255, 45), width=1)
    tb_draw.text((tb_x + 22, tb_y + 10), top_badge_text, font=f_top_badge, fill=(253, 224, 71, 255))
    
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
    tag_w = (tag_bbox[2] - tag_bbox[0]) + 26
    tag_h = 36
    rc_draw.rounded_rectangle([(card_x + 30, card_y + 24), (card_x + 30 + tag_w, card_y + 24 + tag_h)], radius=18, fill=(245, 158, 11, 235))
    rc_draw.text((card_x + 43, card_y + 30), tag_text, font=f_tag, fill=(15, 23, 18, 255))
    
    # Main Headline
    rc_draw.text((card_x + 30 + tag_w + 14, card_y + 22), sc["title"], font=f_card_title, fill=(255, 255, 255, 255))
    
    # Divider Line
    rc_draw.line([(card_x + 30, card_y + 72), (card_x + card_w - 30, card_y + 72)], fill=(255, 255, 255, 35), width=1)
    
    # Subtitle
    rc_draw.text((card_x + 30, card_y + 86), sc["sub"], font=f_card_sub, fill=(203, 213, 225, 255))
    
    static_frame_rgba = Image.alpha_composite(bg_blurred, rc_top)
    static_frame_bgr = cv2.cvtColor(np.array(static_frame_rgba), cv2.COLOR_RGBA2BGR)
    
    # 5. Pre-render 8 Detailed Subtitle Cards
    bullets = sc["bullets"]
    strip_w = strip_box_w
    max_desc_w = strip_w - 44
    
    card_items = []
    total_content_h = 0
    for b_title, b_desc in bullets:
        desc_lines = wrap_korean_text(b_desc, f_item_desc, max_desc_w)
        c_h = 10 + 26 + 6 + len(desc_lines) * 24 + 10
        card_items.append({
            "title": b_title,
            "lines": desc_lines,
            "height": c_h
        })
        total_content_h += c_h + 12
        
    pad_top = 10
    pad_bot = 140
    total_strip_h = max(strip_box_h + 350, pad_top + total_content_h + pad_bot)
    
    strip_img = Image.new('RGB', (strip_w, total_strip_h), (12, 17, 14))
    st_draw = ImageDraw.Draw(strip_img)
    
    cur_y = pad_top
    for ci in card_items:
        ch = ci["height"]
        st_draw.rounded_rectangle([(0, cur_y), (strip_w, cur_y + ch)], radius=15, fill=(20, 28, 23), outline=(255, 255, 255, 22), width=1)
        st_draw.text((22, cur_y + 10), ci["title"], font=f_item_title, fill=(253, 224, 71))
        line_y = cur_y + 40
        for l in ci["lines"]:
            st_draw.text((22, line_y), l, font=f_item_desc, fill=(241, 245, 249))
            line_y += 24
        cur_y += ch + 12
        
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

print(f"Prepared {len(scene_assets)} 8-card Shorts scene assets.")

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

    # 2. Lower Card: Upward Scrolling 8-Card Subtitles Animation
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

    # 4. Live Bottom Gold Progress Bar
    bar_y = 1880
    bar_h = 8
    bar_w = int(WIDTH * overall_progress)
    cv2.rectangle(frame, (0, bar_y), (WIDTH, bar_y + bar_h), (30, 40, 35), -1)
    if bar_w > 0:
        cv2.rectangle(frame, (0, bar_y), (bar_w, bar_y + bar_h), (71, 224, 253), -1)  # BGR for Gold/Yellow
        
    return frame

print("Setting up FFmpeg rendering process for 8-card Shorts master video...")
total_frames = sum(s["num_frames"] for s in scene_assets)

ffmpeg_cmd = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}',
    '-pix_fmt', 'bgr24',
    '-r', str(FPS),
    '-i', '-',
    '-i', LOCAL_AUDIO,
    '-filter_complex', f'[1:a]afade=t=in:st=0:d=1.0,afade=t=out:st={AUDIO_LEN - 3.0}:d=3.0[a]',
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
            print(f"  [8-Card Shorts Rendering] {global_f}/{total_frames} ({pct:.1f}%) | Speed: {cur_fps:.1f} FPS | ETA: {eta:.1f}s")

proc.stdin.close()
proc.wait()

print(f"8-Card Shorts encoding complete in {time.time() - t0:.2f}s!")

# Copy to KakaoTalk folder
shutil.copy2(OUT_WORKSPACE, OUT_KAKAO)
print(f"Saved: {OUT_WORKSPACE}")
print(f"Saved: {OUT_KAKAO}")
