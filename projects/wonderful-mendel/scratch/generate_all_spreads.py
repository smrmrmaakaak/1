import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out_dir = r'c:\Users\황태민\Documents\antigravity\wonderful-mendel\assets\magazine'
os.makedirs(out_dir, exist_ok=True)

font_bold = r'C:\Windows\Fonts\malgunbd.ttf'
font_reg = r'C:\Windows\Fonts\malgun.ttf'
font_serif = r'C:\Windows\Fonts\batang.ttc'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

W, H = 1760, 1240

def create_comic_spread(vol_num="VOL. 2026", cat_left="", cat_right=""):
    # 1. Warm Cream Comic Paper Background
    im = Image.new('RGBA', (W, H), (255, 253, 240, 255))
    draw = ImageDraw.Draw(im)
    
    # Outer Comic Box Border
    draw.rectangle([20, 20, W-20, H-20], outline=(17, 17, 17, 255), width=5)
    draw.rectangle([28, 28, W-28, H-28], outline=(255, 230, 0, 255), width=4)
    
    # Center Spine Gutter
    mid = W // 2
    for offset in range(-35, 36):
        alpha = int(45 * (1 - abs(offset) / 35))
        draw.line([mid + offset, 28, mid + offset, H-28], fill=(20, 20, 20, alpha))
    draw.line([mid, 28, mid, H-28], fill=(17, 17, 17, 255), width=3)
    
    # Left & Right Page Top Header Badges
    f_h_badge = get_font(font_bold, 16)
    f_h_title = get_font(font_bold, 18)
    
    # Left Header: Yellow Badge + Black Text
    draw.rounded_rectangle([70, 48, 220, 84], radius=10, fill=(255, 230, 0, 255), outline=(17, 17, 17, 255), width=3)
    draw.text((85, 54), "현장 구출 웹툰", fill=(17, 17, 17, 255), font=f_h_badge)
    draw.text((235, 54), f"CASE STUDY · {cat_left}", fill=(17, 17, 17, 255), font=f_h_title)
    
    # Right Header: Emerald Badge + Black Text
    draw.rounded_rectangle([mid + 50, 48, mid + 200, 84], radius=10, fill=(16, 185, 129, 255), outline=(17, 17, 17, 255), width=3)
    draw.text((mid + 65, 54), "장인 완벽 해결", fill=(255, 255, 255, 255), font=f_h_badge)
    draw.text((mid + 215, 54), f"SOLUTION · {cat_right}", fill=(17, 17, 17, 255), font=f_h_title)
    
    # Header underline
    draw.line([70, 96, mid - 50, 96], fill=(17, 17, 17, 255), width=2)
    draw.line([mid + 50, 96, W - 70, 96], fill=(17, 17, 17, 255), width=2)
    
    # Footer line & text
    draw.line([70, H - 75, mid - 50, H - 75], fill=(17, 17, 17, 255), width=2)
    draw.line([mid + 50, H - 75, W - 70, H - 75], fill=(17, 17, 17, 255), width=2)
    
    f_foot = get_font(font_bold, 15)
    draw.text((70, H - 60), "목수의 홈케어마스터 · 30년 목수 조인형 대표의 집수리 구출 일지", fill=(17, 17, 17, 255), font=f_foot)
    draw.text((W - 320, H - 60), "📞 직통 무료 사진견적: 010-9276-4245", fill=(225, 29, 72, 255), font=f_foot)
    
    return im, draw

def place_comic_image(im, src_path, box, corner_radius=12, badge_text="", badge_bg=(255, 46, 99, 255)):
    x, y, w, h = box
    if not os.path.exists(src_path):
        print("Missing image:", src_path)
        return
    
    photo = Image.open(src_path).convert('RGBA')
    pw, ph = photo.size
    target_ratio = w / h
    current_ratio = pw / ph
    
    if current_ratio > target_ratio:
        new_w = int(ph * target_ratio)
        left = (pw - new_w) // 2
        photo = photo.crop((left, 0, left + new_w, ph))
    else:
        new_h = int(pw / target_ratio)
        top = (ph - new_h) // 2
        photo = photo.crop((0, top, pw, top + new_h))
        
    photo = photo.resize((w, h), Image.Resampling.LANCZOS)
    
    # Mask
    mask = Image.new('L', (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, w, h], radius=corner_radius, fill=255)
    
    # Draw comic drop shadow first (4px offset)
    draw = ImageDraw.Draw(im)
    draw.rounded_rectangle([x + 6, y + 6, x + w + 6, y + h + 6], radius=corner_radius, fill=(17, 17, 17, 255))
    
    # Paste photo
    im.paste(photo, (x, y), mask)
    
    # Outer solid black border (3.5px comic line)
    draw.rounded_rectangle([x, y, x + w, y + h], radius=corner_radius, outline=(17, 17, 17, 255), width=4)
    
    # Sound FX or Comic Badge
    if badge_text:
        f_badge = get_font(font_bold, 15)
        bw = len(badge_text) * 16 + 24
        # Drop shadow for badge
        draw.rounded_rectangle([x + 14, y + 14, x + 14 + bw, y + 46], radius=8, fill=(17, 17, 17, 255))
        # Badge body
        draw.rounded_rectangle([x + 10, y + 10, x + 10 + bw, y + 42], radius=8, fill=badge_bg, outline=(17, 17, 17, 255), width=3)
        draw.text((x + 20, y + 15), badge_text, fill=(255, 255, 255, 255), font=f_badge)

# -------------------------------------------------------------
# SPREAD 0: Comic Pop Webtoon Cover
# -------------------------------------------------------------
def make_cover():
    im = Image.new('RGBA', (W, H), (255, 253, 240, 255))
    draw = ImageDraw.Draw(im)
    
    # Border & comic drop shadow
    draw.rectangle([20, 20, W-20, H-20], outline=(17, 17, 17, 255), width=6)
    
    mid = W // 2
    for offset in range(-35, 36):
        alpha = int(45 * (1 - abs(offset) / 35))
        draw.line([mid + offset, 20, mid + offset, H-20], fill=(20, 20, 20, alpha))
    draw.line([mid, 20, mid, H-20], fill=(17, 17, 17, 255), width=4)
    
    # Left Page: Webtoon Intro Speech Box
    draw.rounded_rectangle([70 + 6, 120 + 6, mid - 60 + 6, H - 120 + 6], radius=20, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 120, mid - 60, H - 120], radius=20, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    
    # Sound FX Tag
    draw.rounded_rectangle([90, 95, 260, 135], radius=10, fill=(255, 46, 99, 255), outline=(17, 17, 17, 255), width=3)
    draw.text((105, 102), "⚡ 30년 목수의 사명", fill=(255, 255, 255, 255), font=get_font(font_bold, 17))
    
    f_title_l = get_font(font_bold, 32)
    f_body = get_font(font_bold, 20)
    draw.text((100, 160), "“집수리의 품격은", fill=(17, 17, 17, 255), font=f_title_l)
    draw.text((100, 205), "  보이지 않는 1mm 마감에서 결정된다!”", fill=(225, 29, 72, 255), font=f_title_l)
    
    body_lines = [
        "나무는 계절에 따라 숨을 쉬고, 집의 수평은 세월에 따라 변합니다.",
        "",
        "단순히 뜯고 새로 갈아치우는 건 누구나 할 수 있지만,",
        "기존 뼈대를 살리고 1mm 오차 없이 원인을 바로잡는 것!",
        "그것이 진짜 30년 목수 장인의 사명입니다.",
        "",
        "• 타업체 포기 현장 100% 구출",
        "• 대리석 젠다이 재단 & 사각싱크볼 일체형 시공",
        "• 500만원 교체비 대신 70% 절약 싱크대 알짜 리폼",
        "• 낡은 문짝 교체 없는 최고급 인테리어 필름 복원",
        "",
        "화려한 말 대신 실제 현장 사진으로 증명합니다."
    ]
    y_l = 270
    for line in body_lines:
        color = (16, 185, 129, 255) if line.startswith("✔") else (50, 50, 50, 255)
        draw.text((100, y_l), line, fill=color, font=f_body)
        y_l += 36
        
    # Representative Badge
    draw.rounded_rectangle([100, H - 240, mid - 90, H - 150], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=3)
    draw.text((120, H - 225), "목수의 홈케어마스터 대표 시공 장인", fill=(80, 80, 80, 255), font=get_font(font_bold, 16))
    draw.text((120, H - 195), "조 인 형 (010-9276-4245) · 서울/경기/인천 전지역 출장", fill=(17, 17, 17, 255), font=get_font(font_bold, 22))
    
    # Right Page: Big Comic Magazine Cover
    draw.rounded_rectangle([mid + 60 + 6, 120 + 6, W - 60 + 6, H - 120 + 6], radius=20, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 120, W - 60, H - 120], radius=20, fill=(255, 230, 0, 255), outline=(17, 17, 17, 255), width=4)
    
    # Big Title
    draw.rounded_rectangle([mid + 90, 150, mid + 340, 195], radius=10, fill=(17, 17, 17, 255))
    draw.text((mid + 105, 158), "REAL CRAFTSMANSHIP", fill=(255, 230, 0, 255), font=get_font(font_bold, 18))
    
    draw.text((mid + 90, 220), "목수의", fill=(17, 17, 17, 255), font=get_font(font_bold, 48))
    draw.text((mid + 90, 285), "홈케어마스터", fill=(17, 17, 17, 255), font=get_font(font_bold, 68))
    draw.text((mid + 90, 375), "30년 목수 장인의 1mm 실전 시공 만화 매거진", fill=(50, 50, 50, 255), font=get_font(font_bold, 24))
    
    draw.line([mid + 90, 420, W - 90, 420], fill=(17, 17, 17, 255), width=3)
    
    toc_items = [
        ("PLATE 01", "부평 벨라고 30mm 정밀 타공 사각싱크볼", "난이도 최상 · 타업체 포기"),
        ("PLATE 02", "부평 한스 대리석 젠다이 재단 & 사각싱크볼", "대리석 턱 간섭 일체형 가공"),
        ("PLATE 03", "싱크대 본프레임 보존 상판 + 도어 알짜 리폼", "500만원 대신 70% 절약"),
        ("PLATE 04", "현관문 & 욕실문 프리미엄 헤어라인 필름 복원", "문짝 교체 없는 신축 호텔 복원"),
        ("PLATE 05", "푸르니 어린이집 친환경 불연 마그네슘보드 목공", "관공서·대기업 친환경 인증")
    ]
    y_toc = 455
    for tag, title, note in toc_items:
        # Comic plate row
        draw.rounded_rectangle([mid + 90, y_toc, W - 90, y_toc + 52], radius=10, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=3)
        draw.text((mid + 105, y_toc + 14), tag, fill=(225, 29, 72, 255), font=get_font(font_bold, 17))
        draw.text((mid + 205, y_toc + 14), title, fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
        draw.text((W - 270, y_toc + 15), note, fill=(100, 100, 100, 255), font=get_font(font_bold, 14))
        y_toc += 64
        
    # Interactive Guide Tag
    draw.rounded_rectangle([mid + 90, H - 200, W - 90, H - 145], radius=12, fill=(17, 17, 17, 255))
    draw.text((mid + 115, H - 182), "👉 책장을 클릭/드래그하여 넘기거나 돋보기로 확대해보세요!", fill=(255, 230, 0, 255), font=get_font(font_bold, 20))
    
    cover_path = os.path.join(out_dir, 'spread_00_cover.png')
    im.save(cover_path)
    print("Comic Cover generated:", cover_path)

# -------------------------------------------------------------
# SPREAD 1: 부평 벨라고 30mm 정밀 타공
# -------------------------------------------------------------
def make_spread_01():
    im, draw = create_comic_spread("VOL. 01", "부평 벨라고 30mm 타공", "플런지쏘 정밀 절단 기술")
    mid = W // 2
    
    # Left Page: Before
    draw.text((70, 115), "타업체가 포기한 깊이 부족 싱크대,", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((70, 160), "30mm 정밀 절단으로 벨라고 사각싱크볼 완성!", fill=(225, 29, 72, 255), font=get_font(font_bold, 24))
    
    src_before = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0809 부평 벨라고 사각싱크볼교체-작업난이도가 높고 까다로워 다른업체에서 못하는 것을 한 건~가 안맞아서 나무상판 앞쪽 30mm 미리 재단하는 위험하고 어려운 작업을 미리 한 후 싱크볼 설치\KakaoTalk_20260814_082220010.jpg'
    place_comic_image(im, src_before, (70, 210, 740, 570), corner_radius=14, badge_text="BEFORE · 타업체 시공 거부 상태", badge_bg=(225, 29, 72, 255))
    
    # Left Comic Speech Bubble
    draw.rounded_rectangle([70 + 4, 815 + 4, mid - 60 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 815, mid - 60, H - 95], radius=14, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((90, 835), "조인형 대표의 현장 구출 진단", fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
    draw.text((90, 870), "• 상판 교체 비용 150만원 완벽 세이브: 기존 상판을 살려 앞쪽 30mm만 가공", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 902), "• 1mm 집진 플런지쏘 재단: 실내 먼지 날림 0% 무분진 완벽 직선 컷팅", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 934), "• 2중 진동 방지 패드 & 항균 바이오 실리콘 3중 방수 실현", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    
    # Right Page: After
    draw.text((mid + 60, 115), "벨라고 최고급 사각싱크볼 & 거위목 폭포수전", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((mid + 60, 160), "신축 호텔급 주방으로 재탄생한 최종 애프터!", fill=(16, 185, 129, 255), font=get_font(font_bold, 24))
    
    src_after = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0809 부평 벨라고 사각싱크볼교체-작업난이도가 높고 까다로워 다른업체에서 못하는 것을 한 건~가 안맞아서 나무상판 앞쪽 30mm 미리 재단하는 위험하고 어려운 작업을 미리 한 후 싱크볼 설치\KakaoTalk_20260814_082220010_23.jpg'
    place_comic_image(im, src_after, (mid + 60, 210, 740, 570), corner_radius=14, badge_text="AFTER · 호텔 주방 완벽 구출!", badge_bg=(16, 185, 129, 255))
    
    # Right Comic Review Box
    draw.rounded_rectangle([mid + 60 + 4, 815 + 4, W - 70 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 815, W - 70, H - 95], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((mid + 80, 835), "고객 리얼 후기 (부평 고객님)", fill=(225, 29, 72, 255), font=get_font(font_bold, 18))
    draw.text((mid + 80, 870), "“다른 데서 안 된다고 해서 포기했었는데, 목수님이 오셔서 30분 만에", fill=(40, 40, 40, 255), font=get_font(font_bold, 16))
    draw.text((mid + 80, 902), " 상판 안 바꾸고도 쏙 넣어주셨어요! 주방이 새집처럼 너무 고급스러워졌습니다!”", fill=(17, 17, 17, 255), font=get_font(font_bold, 16))
    
    sp1_path = os.path.join(out_dir, 'spread_01_bellago.png')
    im.save(sp1_path)
    print("Comic Spread 1 generated:", sp1_path)

# -------------------------------------------------------------
# SPREAD 2: 부평 한스 젠다이 재단
# -------------------------------------------------------------
def make_spread_02():
    im, draw = create_comic_spread("VOL. 02", "부평 한스 싱크볼", "대리석 젠다이 정밀 재단")
    mid = W // 2
    
    draw.text((70, 115), "뒤쪽 젠다이 턱 간섭으로 설치 불가 현장,", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((70, 160), "대리석 정밀 재단 후 한스 사각싱크볼 일체형 시공!", fill=(225, 29, 72, 255), font=get_font(font_bold, 24))
    
    src_before = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0809 부평 한스 사각싱크볼교체-사이즈가 안맞아서 뒤쪽 젠다이를 사이즈에 맞게 재단하여 재설치후 사각싱크볼 (벨라고)교체\KakaoTalk_20260814_082357326.jpg'
    place_comic_image(im, src_before, (70, 210, 740, 570), corner_radius=14, badge_text="BEFORE · 젠다이 턱 간섭 현장", badge_bg=(225, 29, 72, 255))
    
    draw.rounded_rectangle([70 + 4, 815 + 4, mid - 60 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 815, mid - 60, H - 95], radius=14, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((90, 835), "석재 정밀 가공 & 수평 피팅 기술", fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
    draw.text((90, 870), "• 대리석 크랙 제로: 분리 후 정밀 석재 절단기를 이용한 맞춤 컷팅", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 902), "• 젠다이와 싱크볼 테두리가 맞춤 가구처럼 딱 떨어지는 100% 일체감", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 934), "• 올스테인리스 프리미엄 배수구 교체로 악취·누수 원천 차단", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    
    draw.text((mid + 60, 115), "한스 프리미엄 사각싱크볼 & 폭포수전", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((mid + 60, 160), "젠다이와 완벽한 조화를 이루는 프리미엄 주방!", fill=(16, 185, 129, 255), font=get_font(font_bold, 24))
    
    src_after = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0809 부평 한스 사각싱크볼교체-사이즈가 안맞아서 뒤쪽 젠다이를 사이즈에 맞게 재단하여 재설치후 사각싱크볼 (벨라고)교체\KakaoTalk_20260814_082359385_06.jpg'
    place_comic_image(im, src_after, (mid + 60, 210, 740, 570), corner_radius=14, badge_text="AFTER · 일체형 마감 완성!", badge_bg=(16, 185, 129, 255))
    
    draw.rounded_rectangle([mid + 60 + 4, 815 + 4, W - 70 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 815, W - 70, H - 95], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((mid + 80, 835), "고객 리얼 후기", fill=(225, 29, 72, 255), font=get_font(font_bold, 18))
    draw.text((mid + 80, 870), "“선반 턱 때문에 사각싱크볼 꿈도 못 꿨는데, 목수님이 젠다이를 잘라", fill=(40, 40, 40, 255), font=get_font(font_bold, 16))
    draw.text((mid + 80, 902), " 원래 한 세트였던 것처럼 맞춰주셨어요. 통수도 시원하고 최고입니다!”", fill=(17, 17, 17, 255), font=get_font(font_bold, 16))
    
    sp2_path = os.path.join(out_dir, 'spread_02_hans.png')
    im.save(sp2_path)
    print("Comic Spread 2 generated:", sp2_path)

# -------------------------------------------------------------
# SPREAD 3: 싱크대 본프레임 보존 상판 + 도어 교체
# -------------------------------------------------------------
def make_spread_03():
    im, draw = create_comic_spread("VOL. 03", "싱크대 알짜 리폼", "본프레임 보존 상판·도어 교체")
    mid = W // 2
    
    draw.text((70, 115), "500만원 전면 철거 대신 150만원,", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((70, 160), "본프레임 살리고 상판·도어만 맞춤 교체!", fill=(225, 29, 72, 255), font=get_font(font_bold, 24))
    
    src_before = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0812 한집에서 싱크대 상판 + 싱크대 상하부장교체(싱크대 본프레임틀은 그대로 두고 진행)+아트월 평탄화- 3시리즈 나눔\KakaoTalk_20260804_075253079.jpg'
    place_comic_image(im, src_before, (70, 210, 740, 570), corner_radius=14, badge_text="BEFORE · 노후 상판 & 변색 문짝", badge_bg=(225, 29, 72, 255))
    
    draw.rounded_rectangle([70 + 4, 815 + 4, mid - 60 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 815, mid - 60, H - 95], radius=14, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((90, 835), "300만원 절약하는 싱크대 알짜 리폼 비법", fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
    draw.text((90, 870), "• 타일 공사 & 철거 폐기물 비용 제로화 (기존 튼튼한 뼈대 100% 재활용)", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 902), "• 최고급 화이트 인조대리석 상판 & 댐퍼 힌지 무광 매트 화이트 도어", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 934), "• 30년 목수 장인의 레이저 레벨기 수평 피팅으로 20년 내구성 확보", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    
    draw.text((mid + 60, 115), "신축 아파트 첫 입주 주방의 눈부신 완성", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((mid + 60, 160), "1/3 비용으로 완성된 올화이트 프리미엄 주방!", fill=(16, 185, 129, 255), font=get_font(font_bold, 24))
    
    src_after = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0812 한집에서 싱크대 상판 + 싱크대 상하부장교체(싱크대 본프레임틀은 그대로 두고 진행)+아트월 평탄화- 3시리즈 나눔\KakaoTalk_20260804_075304230.jpg'
    place_comic_image(im, src_after, (mid + 60, 210, 740, 570), corner_radius=14, badge_text="AFTER · 신축급 프리미엄 리폼!", badge_bg=(16, 185, 129, 255))
    
    draw.rounded_rectangle([mid + 60 + 4, 815 + 4, W - 70 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 815, W - 70, H - 95], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((mid + 80, 835), "고객 리얼 후기", fill=(225, 29, 72, 255), font=get_font(font_bold, 18))
    draw.text((mid + 80, 870), "“새 싱크대 견적 받고 너무 비싸서 엄두가 안 났는데, 상판이랑 문짝만", fill=(40, 40, 40, 255), font=get_font(font_bold, 16))
    draw.text((mid + 80, 902), " 바꿨더니 완전 새 주방이 되었어요! 300만원 아끼고 품질은 대기업 이상입니다!”", fill=(17, 17, 17, 255), font=get_font(font_bold, 16))
    
    sp3_path = os.path.join(out_dir, 'spread_03_sink_reform.png')
    im.save(sp3_path)
    print("Comic Spread 3 generated:", sp3_path)

# -------------------------------------------------------------
# SPREAD 4: 현관문 & 욕실문 프리미엄 필름 래핑
# -------------------------------------------------------------
def make_spread_04():
    im, draw = create_comic_spread("VOL. 04", "인테리어 필름 복원", "현관문·욕실문 프리미엄 래핑")
    mid = W // 2
    
    draw.text((70, 115), "습기로 썩은 문짝과 낡은 현관문,", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((70, 160), "문짝 교체 없이 프리미엄 헤어라인 래핑 복원!", fill=(225, 29, 72, 255), font=get_font(font_bold, 24))
    
    src_before = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0812 현관문 헤어라인, 욕실문2개, 샤시 필름 시공\KakaoTalk_20260813_211334545.jpg'
    place_comic_image(im, src_before, (70, 210, 740, 570), corner_radius=14, badge_text="BEFORE · 습기로 썩은 문짝", badge_bg=(225, 29, 72, 255))
    
    draw.rounded_rectangle([70 + 4, 815 + 4, mid - 60 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 815, mid - 60, H - 95], radius=14, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((90, 835), "목수의 정밀 퍼티 & 필름 래핑 공법", fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
    draw.text((90, 870), "• 썩은 부위 완전 제거 및 방수 목공용 퍼티 충진 평탄화", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 902), "• 친환경 프라이머 도포로 들뜸 0% 반영구 접착력 유지", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 934), "• 최고급 메탈 헤어라인 텍스처로 신축 호텔 도어 느낌 완성", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    
    draw.text((mid + 60, 115), "호텔 로비 감성의 메탈 헤어라인 완성", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((mid + 60, 160), "교체 비용의 1/4로 완성된 완벽한 신축 복원!", fill=(16, 185, 129, 255), font=get_font(font_bold, 24))
    
    src_after = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0812 현관문 헤어라인, 욕실문2개, 샤시 필름 시공\KakaoTalk_20260813_211334545_16.jpg'
    place_comic_image(im, src_after, (mid + 60, 210, 740, 570), corner_radius=14, badge_text="AFTER · 프리미엄 헤어라인 완성!", badge_bg=(16, 185, 129, 255))
    
    draw.rounded_rectangle([mid + 60 + 4, 815 + 4, W - 70 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 815, W - 70, H - 95], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((mid + 80, 835), "고객 리얼 후기", fill=(225, 29, 72, 255), font=get_font(font_bold, 18))
    draw.text((mid + 80, 870), "“문짝이 썩어서 다 뜯고 새로 사야 하나 싶었는데, 목수님이 필름으로", fill=(40, 40, 40, 255), font=get_font(font_bold, 16))
    draw.text((mid + 80, 902), " 감쪽같이 새 문으로 만들어주셨어요. 집 들어올 때마다 호텔 온 기분입니다!”", fill=(17, 17, 17, 255), font=get_font(font_bold, 16))
    
    sp4_path = os.path.join(out_dir, 'spread_04_film.png')
    im.save(sp4_path)
    print("Comic Spread 4 generated:", sp4_path)

# -------------------------------------------------------------
# SPREAD 5: 푸르니 어린이집 마그네슘보드 목공
# -------------------------------------------------------------
def make_spread_05():
    im, draw = create_comic_spread("VOL. 05", "공공기관 · 상업시설", "용인 푸르니 어린이집 마그네슘보드")
    mid = W // 2
    
    draw.text((70, 115), "관공서 · 어린이집이 믿고 선택하는,", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((70, 160), "친환경 준불연 마그네슘보드 목공 정밀 시공!", fill=(225, 29, 72, 255), font=get_font(font_bold, 24))
    
    src_before = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0810 카테고리 공공기관상업시설 -용인수지푸르니어린이집 마그네슘보드 설치-1.관공서, 유수의 ~에서 믿고 선택, 신뢰성, 전문성 부각 2. 마그네슘보드 어린이집에서 많이 시공하는 이유등 어필\KakaoTalk_20260814_081924254.jpg'
    place_comic_image(im, src_before, (70, 210, 740, 570), corner_radius=14, badge_text="IN PROGRESS · 정밀 하지 목공", badge_bg=(255, 140, 0, 255))
    
    draw.rounded_rectangle([70 + 4, 815 + 4, mid - 60 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([70, 815, mid - 60, H - 95], radius=14, fill=(255, 255, 255, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((90, 835), "공공기관·대기업이 찾는 장인의 목공 기술", fill=(17, 17, 17, 255), font=get_font(font_bold, 18))
    draw.text((90, 870), "• 준불연 인증 마그네슘보드로 화재 안전 및 결로·곰팡이 완벽 차단", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 902), "• 유해물질 Zero 친환경 자재로 아이들 호흡기 안심 환경 구축", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    draw.text((90, 934), "• 목수 전문 레이저 각재 하지를 세워 흔들림 없는 내구성 완성", fill=(40, 40, 40, 255), font=get_font(font_bold, 15))
    
    draw.text((mid + 60, 115), "깔끔하고 안전한 어린이집 친환경 벽체 완성", fill=(17, 17, 17, 255), font=get_font(font_bold, 30))
    draw.text((mid + 60, 160), "공공기관 시설 기준 100% 통과된 최종 완성!", fill=(16, 185, 129, 255), font=get_font(font_bold, 24))
    
    src_after = r'G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0810 카테고리 공공기관상업시설 -용인수지푸르니어린이집 마그네슘보드 설치-1.관공서, 유수의 ~에서 믿고 선택, 신뢰성, 전문성 부각 2. 마그네슘보드 어린이집에서 많이 시공하는 이유등 어필\KakaoTalk_20260814_081926667_14.jpg'
    place_comic_image(im, src_after, (mid + 60, 210, 740, 570), corner_radius=14, badge_text="AFTER · 마그네슘보드 완공!", badge_bg=(16, 185, 129, 255))
    
    draw.rounded_rectangle([mid + 60 + 4, 815 + 4, W - 70 + 4, H - 95 + 4], radius=14, fill=(17, 17, 17, 255))
    draw.rounded_rectangle([mid + 60, 815, W - 70, H - 95], radius=14, fill=(255, 249, 196, 255), outline=(17, 17, 17, 255), width=4)
    draw.text((mid + 80, 835), "원장님 & 교직원 만족 후기", fill=(225, 29, 72, 255), font=get_font(font_bold, 18))
    draw.text((mid + 80, 870), "“아이들 안전이 최우선이라 꼼꼼히 업체를 찾았는데, 목수님이 규격에 맞춰", fill=(40, 40, 40, 255), font=get_font(font_bold, 16))
    draw.text((mid + 80, 902), " 칼각으로 튼튼하게 시공해 주셨어요. 소방 점검도 무사 통과했습니다!”", fill=(17, 17, 17, 255), font=get_font(font_bold, 16))
    
    sp5_path = os.path.join(out_dir, 'spread_05_magnesium.png')
    im.save(sp5_path)
    print("Comic Spread 5 generated:", sp5_path)

make_cover()
make_spread_01()
make_spread_02()
make_spread_03()
make_spread_04()
make_spread_05()
print("ALL COMIC SPREADS RE-GENERATED SUCCESSFULLY!")
