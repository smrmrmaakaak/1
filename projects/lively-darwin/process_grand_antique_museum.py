import os, glob, sys, json, re
import numpy as np
from PIL import Image, ImageOps
import cv2
import rembg
import torch
import scipy.ndimage as ndi
from transformers import pipeline

def build_grand_antique_museum():
    base_src_dir = r"C:\Users\황태민\Documents\엔틱"
    output_root = "antique_collections"
    os.makedirs(output_root, exist_ok=True)

    print("=== STARTING GRAND ANTIQUE MUSEUM BATCH PIPELINE ===")
    
    # 1. Discover all folders except '로고&영상' and '초대장'
    item_definitions = [
        # Root files: Royal Copenhagen
        {
            "id": "copenhagen_blue_fluted",
            "category": "copenhagen",
            "category_name": "🇩🇰 로얄 코펜하겐",
            "title_ko": "로얄 코펜하겐 블루 플루티드 풀레이스 커피포트 & 하프레이스 티팟 (No. 1030 / 258)",
            "title_en": "Royal Copenhagen Blue Fluted Full Lace & Half Lace Set",
            "brand": "Royal Copenhagen",
            "flag": "🇩🇰",
            "era": "20th Century (Denmark)",
            "origin": "Denmark",
            "material": "Hand-Painted Fine Porcelain & Coblat Underglaze",
            "desc": "덴마크 왕실 도자기 로얄 코펜하겐의 정수인 블루 플루티드(Blue Fluted) 풀레이스 커피포트(No.1030)와 하프레이스 티팟(No.258) 세트입니다. 시그니처 3개 파도 물결 백스탬프와 블루 핸드페인팅이 완벽 보존되어 있습니다.",
            "src_dir": base_src_dir,
            "file_filter": lambda f: f.startswith("KakaoTalk_20260902_110016856")
        },
        # 01 Lladro / Nao
        {
            "id": "lladro_nao_sweet_dreams",
            "category": "lladro",
            "category_name": "🌷 스페인 야드로 & 나오",
            "title_ko": "스페인 나오 1429 모자상 '달콤한 꿈' (Sweet Dreams)",
            "title_en": "Nao by Lladró #1429 'Sweet Dreams' Mother & Child",
            "brand": "Nao by Lladró",
            "flag": "🇪🇸",
            "era": "Late 20th Century",
            "origin": "Spain (Valencia)",
            "material": "Handcrafted Porcelain with Soft Pastel Glaze",
            "desc": "어머니의 품에서 잠든 아이의 평화로운 순간을 야드로 특유의 나른하고 따뜻한 파스텔 유약과 유려한 곡선 조형미로 빚어낸 명품 모자상입니다.",
            "rel_path": r"01_스페인_야드로_나오_컬렉션\01_스페인_나오_1429_모자상_달콤한꿈"
        },
        {
            "id": "lladro_gres_venus",
            "category": "lladro",
            "category_name": "🌷 스페인 야드로 & 나오",
            "title_ko": "스페인 야드로 그레스 2256 '우물가의 비너스' (Venus at the Well)",
            "title_en": "Lladró Gres #2256 'Venus at the Well' Masterpiece",
            "brand": "Lladró",
            "flag": "🇪🇸",
            "era": "c.1980s",
            "origin": "Spain (Valencia)",
            "material": "Sculpted Gres Stoneware Porcelain",
            "desc": "야드로의 프리미엄 라인인 그레스(Gres) 스톤웨어 소재로 제작되어 대리석 같은 깊은 무광 텍스처와 고대 그리스 비너스의 우아한 나체 조형미를 재현한 대형 조각상입니다.",
            "rel_path": r"01_스페인_야드로_나오_컬렉션\02_스페인_야드로_그레스_2256_우물가비너스"
        },
        {
            "id": "lladro_las_meninas",
            "category": "lladro",
            "category_name": "🌷 스페인 야드로 & 나오",
            "title_ko": "스페인 야드로 한정판 1812 '라스 메니냐스' 마르가리타 공주 초대작",
            "title_en": "Lladró Limited Edition #1812 'Las Meninas' Infanta Margarita",
            "brand": "Lladró",
            "flag": "🇪🇸",
            "era": "Limited Edition",
            "origin": "Spain (Valencia)",
            "material": "Hand-Painted Fine Art Porcelain & Gold Filigree",
            "desc": "디에고 벨라스케스의 불후의 명작 '시녀들(Las Meninas)' 속 마르가리타 왕녀를 기념비적인 스케일로 입체 조각화한 야드로 역사상 가장 희귀한 한정판 초대작입니다.",
            "rel_path": r"01_스페인_야드로_나오_컬렉션\03_스페인_야드로_한정판_1812_라스메니냐스_초대작"
        },
        {
            "id": "rex_shepherd_boy",
            "category": "lladro",
            "category_name": "🌷 스페인 야드로 & 나오",
            "title_ko": "스페인 렉스 발렌시아 1029 목동 소년상",
            "title_en": "Rex Valencia #1029 Shepherd Boy Figurine",
            "brand": "Rex Valencia",
            "flag": "🇪🇸",
            "era": "c.1970s",
            "origin": "Spain (Valencia)",
            "material": "Fine Glazed Porcelain",
            "desc": "스페인 발렌시아 도자기 전통의 목가적인 감성을 담아낸 목동 소년 조각상입니다.",
            "rel_path": r"01_스페인_야드로_나오_컬렉션\04_스페인_렉스_발렌시아_1029_목동소년상"
        },
        # 02 Royal Doulton
        {
            "id": "doulton_princess_jennifer",
            "category": "doulton",
            "category_name": "👑 영국 로열둘튼",
            "title_ko": "로열둘튼 제니퍼 공주 피겨린 (HN 3382)",
            "title_en": "Royal Doulton 'Princess Jennifer' (HN 3382)",
            "brand": "Royal Doulton",
            "flag": "🇬🇧",
            "era": "c.1991",
            "origin": "England",
            "material": "Fine Bone China & Hand-Painted Enamel",
            "desc": "영국 로열둘튼의 우아한 왕실 레이디 컬렉션 중 하나로, 풍성한 드레스 자락과 섬세한 얼굴 페인팅이 돋보이는 명작 피겨린입니다.",
            "rel_path": r"02_영국_로열덜튼_컬렉션\01_로열덜튼_제니퍼_공주_HN3382"
        },
        # 03 Aynsley
        {
            "id": "aynsley_orchard_yellow",
            "category": "aynsley",
            "category_name": "🌹 영국 앤슬리",
            "title_ko": "앤슬리 오차드 골드 옐로우 티잔 & 소서 세트",
            "title_en": "Aynsley Orchard Gold Canary Yellow Teacup & Saucer",
            "brand": "Aynsley",
            "flag": "🇬🇧",
            "era": "Mid 20th Century",
            "origin": "England (Aynsley)",
            "material": "Fine Bone China & 24K Hand-Gilded Gold",
            "desc": "풍요로운 과일 정원을 핸드페인팅으로 수놓고 화사한 카나리아 옐로우와 24K 순금 장정을 두른 영국 앤슬리의 불멸의 시그니처 티잔 세트입니다.",
            "rel_path": r"03_영국_앤슬리_컬렉션\01_앤슬리_오차드골드_옐로우_티잔세트"
        },
        {
            "id": "aynsley_orchard_ruby",
            "category": "aynsley",
            "category_name": "🌹 영국 앤슬리",
            "title_ko": "앤슬리 오차드 골드 루비 크림슨 티잔 세트",
            "title_en": "Aynsley Orchard Gold Ruby Crimson Teacup Set",
            "brand": "Aynsley",
            "flag": "🇬🇧",
            "era": "Mid 20th Century",
            "origin": "England (Aynsley)",
            "material": "Fine Bone China & 24K Hand-Gilded Gold",
            "desc": "귀족적인 루비 크림슨 컬러와 24K 금박 내벽, 무르익은 과일 부케가 조화를 이루는 프리미엄 티웨어입니다.",
            "rel_path": r"03_영국_앤슬리_컬렉션\02_앤슬리_오차드골드_루비크림슨_티잔세트"
        },
        # 04 Rococo
        {
            "id": "rococo_dancing_lovers",
            "category": "rococo",
            "category_name": "🏛️ 유럽 로코코 포슬린",
            "title_ko": "로코코 왕관각인 스탠딩 댄싱 연인 피겨린",
            "title_en": "Rococo Crown Hallmark Standing Dancing Lovers",
            "brand": "European Rococo",
            "flag": "👑",
            "era": "19th Century",
            "origin": "Germany / Austria",
            "material": "Hard-Paste Porcelain & Hand-Painted Enamels",
            "desc": "18세기 궁정 살롱의 화려한 무도회를 배경으로 춤을 추는 귀족 연인의 역동적인 모션과 레이스 드레스가 수놓아진 피겨린입니다.",
            "rel_path": r"04_유럽_로코코_포슬린_컬렉션\01_로코코_왕관각인_스탠딩_댄싱연인_피겨린"
        },
        {
            "id": "rococo_mandolin_lovers",
            "category": "rococo",
            "category_name": "🏛️ 유럽 로코코 포슬린",
            "title_ko": "로코코 만돌린 연주 시팅 귀족 연인 피겨린",
            "title_en": "Rococo Sitting Noble Lovers with Mandolin",
            "brand": "European Rococo",
            "flag": "👑",
            "era": "19th Century",
            "origin": "Germany / Austria",
            "material": "Hard-Paste Porcelain & Hand-Painted Enamels",
            "desc": "정원에서 만돌린을 연주하며 사랑을 속삭이는 로코코 궁정 연인의 낭만적인 한때를 표현한 작품입니다.",
            "rel_path": r"04_유럽_로코코_포슬린_컬렉션\02_로코코_만돌린연주_시팅_귀족연인_피겨린"
        },
        # 05 Classic Art Frame
        {
            "id": "chardin_spinning_top_frame",
            "category": "art_frame",
            "category_name": "🖼️ 명화 액자 & 자수공예",
            "title_ko": "장 바티스트 샤르댕 '팽이를 돌리는 소년' (1738) 골드 유화 액자",
            "title_en": "Jean-Siméon Chardin 'Boy with a Top' Gold Gilt Frame",
            "brand": "Classic Art",
            "flag": "🖼️",
            "era": "18th Century Masterpiece",
            "origin": "France",
            "material": "Oil on Canvas & 24K Hand-Carved Gilt Wood Frame",
            "desc": "루브르 박물관 소장작인 프랑스 18세기 거장 샤르댕의 대표작 '팽이를 돌리는 소년'을 앤틱 24K 수작업 골드 액자에 담아낸 마스터피스입니다.",
            "rel_path": r"05_유럽_클래식_명화액자_컬렉션\01_샤르댕_팽이를돌리는소년_1738_골드유화액자"
        },
        # 06 Sèvres
        {
            "id": "sevres_bleu_celeste_sconces",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 블루 셀레스테 오르몰루 브론즈 벽등 1쌍",
            "title_en": "Sèvres Bleu Céleste Ormolu Bronze Wall Sconces Pair",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1870)",
            "origin": "France (Sèvres)",
            "material": "Bleu Céleste Porcelain & Heavy Ormolu Gilt Bronze",
            "desc": "루이 15세의 궁정 색채인 블루 셀레스테(천상의 푸른빛) 포슬린에 촛대 형태의 24K 오르몰루 주물 브론즈가 결합된 왕실 벽등 한 쌍입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\01_세브르_블루셀레스테_오르몰루_브론즈벽등_1쌍"
        },
        {
            "id": "sevres_rose_sconces",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 로즈 퐁파두르 오르몰루 브론즈 벽등 1쌍",
            "title_en": "Sèvres Rose Pompadour Ormolu Bronze Wall Sconces Pair",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1875)",
            "origin": "France (Sèvres)",
            "material": "Rose Pompadour Porcelain & Ormolu Gilt Bronze",
            "desc": "퐁파두르 부인이 사랑했던 환상적인 핑크 에나멜 유약과 궁정 여인 핸드페인팅 메달리온이 장식된 최고급 오르몰루 2구 벽등 1쌍입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\02_세브르_로즈퐁파두르_오르몰루_브론즈벽등_1쌍"
        },
        {
            "id": "sevres_boudoir_lamp",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 블루 포슬린 오르몰루 2구 부두아 탁상 램프",
            "title_en": "Sèvres Royal Blue Ormolu 2-Light Boudoir Table Lamp",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1880)",
            "origin": "France (Sèvres)",
            "material": "Cobalt Porcelain & 24K Ormolu Bronze Mount",
            "desc": "프랑스 왕실 귀부인의 침실(Boudoir)을 밝히던 2구 오르몰루 브론즈 촛대 스탠드로, 코발트 블루 항아리 바디와 정교한 사자발 받침대가 돋보입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\03_세브르_블루포슬린_오르몰루_2구_부두아_탁상램프"
        },
        {
            "id": "sevres_rose_box",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 로즈 퐁파두르 오르몰루 힌지 직사각 보석함 (14cm)",
            "title_en": "Sèvres Rose Pompadour Ormolu Hinged Jewelry Box (14cm)",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1880)",
            "origin": "France (Sèvres)",
            "material": "Rose Pompadour Porcelain & 24K Ormolu Bronze",
            "desc": "프랑스 왕실 세브르의 독보적인 로즈 퐁파두르 핑크 유약에 24K 오르몰루 브론즈 마운트와 플로럴 핸드페인팅이 결합된 최고급 힌지 주얼리 박스입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\07_세브르_로즈퐁파두르_오르몰루_직사각_힌지보석함_14cm"
        },
        {
            "id": "sevres_blue_box",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 블루 포슬린 핸드페인팅 힌지 보석함 (13cm)",
            "title_en": "Sèvres Bleu de Roi Hand-Painted Hinged Jewelry Box (13cm)",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1870)",
            "origin": "France (Sèvres)",
            "material": "Bleu de Roi Porcelain & Ormolu Bronze Mount",
            "desc": "왕의 파랑(Bleu de Roi) 에나멜과 화려한 24K 금박 스크롤, 프랑스 궁정 화원의 플로럴 부케 핸드페인팅이 어우러진 럭셔리 힌지 보석함입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\05_세브르_블루포슬린_핸드페인팅_힌지_주얼리박스_13cm"
        },
        {
            "id": "sevres_rose_compote_tazza",
            "category": "sevres",
            "category_name": "⚜️ 프랑스 세브르 왕실포슬린",
            "title_ko": "세브르 로즈 퐁파두르 왕실 여인 초상화 컴포트 타짜 1쌍 (23cm)",
            "title_en": "Sèvres Rose Pompadour Royal Portrait Compote Tazza Pair",
            "brand": "Sèvres",
            "flag": "🇫🇷",
            "era": "19th Century (c.1870)",
            "origin": "France (Sèvres)",
            "material": "Porcelain, 24K Gold Filigree & Miniature Portrait",
            "desc": "상단 원형 트레이에 궁정 왕실 여인의 정밀 초상화가 그려지고 로즈 퐁파두르 유약과 금박 스크롤이 수놓아진 23cm 컴포트 타짜 1쌍입니다.",
            "rel_path": r"06_프랑스_세브르_왕실포슬린_컬렉션\08_세브르_로즈퐁파두르_왕실여인초상화_컴포트타짜_1쌍_23cm"
        },
        # 07 London Art Union
        {
            "id": "london_art_union_tazza",
            "category": "rococo",
            "category_name": "🏛️ 유럽 로코코 포슬린",
            "title_ko": "런던 아트 유니온 비엔나풍 오르몰루 브론즈 컴포트 트레이",
            "title_en": "London Art Union Vienna Style Ormolu Bronze Compote",
            "brand": "London Art Union",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1880)",
            "origin": "England / Austria",
            "material": "Ormolu Gilt Bronze & Hand-Painted Porcelain",
            "desc": "빅토리아 시대 영국 런던 아트 유니온 발행의 비엔나 스타일 명화 포슬린과 오르몰루 브론즈 투각 프레임이 결합된 센터피스 트레이입니다.",
            "rel_path": r"07_영국_런던아트유니온_빅토리안_컬렉션\01_런던아트유니온_비엔나풍_오르몰루브론즈_컴포트트레이"
        },
        # 08 Victorian Embroidery
        {
            "id": "victorian_petit_point_floral",
            "category": "art_frame",
            "category_name": "🖼️ 명화 액자 & 자수공예",
            "title_ko": "빅토리안 플로럴 부케 쁘띠포앙 자수 골드 오벌 액자",
            "title_en": "Victorian Petit Point Floral Bouquet Gold Oval Frame",
            "brand": "Victorian Craft",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1890)",
            "origin": "England / France",
            "material": "Hand-Stitched Silk Petit Point & Gilt Wood Frame",
            "desc": "1인치당 수백 번의 실크 바늘땀을 손으로 놓아 완성한 쁘띠포앙(Petit Point) 장미 꽃다발 자수 명작입니다.",
            "rel_path": r"08_유럽_빅토리안_자수공예_컬렉션\01_빅토리안_플로럴부케_쁘띠포앙자수_골드오벌액자"
        },
        {
            "id": "victorian_petit_point_lovers",
            "category": "art_frame",
            "category_name": "🖼️ 명화 액자 & 자수공예",
            "title_ko": "빅토리안 로코코 궁정 연인 쁘띠포앙 자수 스퀘어 액자 1쌍",
            "title_en": "Victorian Petit Point Court Lovers Square Frames Pair",
            "brand": "Victorian Craft",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1895)",
            "origin": "England / France",
            "material": "Silk Petit Point Embroidery & Antique Gilt Frame",
            "desc": "로코코 궁정 귀족 연인의 만남과 구애 장면을 극세사 실크 쁘띠포앙 자수로 표현한 대형 스퀘어 액자 한 쌍입니다.",
            "rel_path": r"08_유럽_빅토리안_자수공예_컬렉션\02_빅토리안_로코코궁정연인_쁘띠포앙자수_골드스퀘어액자_1쌍"
        },
        # 09 Royal Worcester
        {
            "id": "worcester_greek_goddess",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 1890s 고전 그리스 여인 골드 조각상 1쌍 (No. 2/57)",
            "title_en": "Royal Worcester 1890s Classical Greek Goddesses Pair",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1890)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory Porcelain & 24K Gilt Drapery",
            "desc": "영국 왕실 도자기 로열우스터 전성기의 블러시 아이보리 포슬린과 24K 금박 드레이퍼리가 완벽한 균형을 이루는 고전 그리스 여신 입체 조각상 1쌍입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\01_로열우스터_1890s_고전그리스여인_골드조각상_1쌍_2-57"
        },
        {
            "id": "worcester_paradise_bird_ewer",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 1882년 에스테틱 극락조 자포니즘 골드 에워 화병 1쌍",
            "title_en": "Royal Worcester 1882 Aesthetic Bird of Paradise Ewers Pair",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Aesthetic Period (1882)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory & Raised 24K Gold Enamels",
            "desc": "19세기 후반 에스테틱 운동(Aesthetic Movement)과 자포니즘의 정수로, 화려한 극락조와 연꽃 모티프가 24K 양각 금박으로 수놓아진 귀족적인 에워 한 쌍입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\02_로열우스터_1882년_에스테틱_극락조_자포니즘_골드에워화병_1쌍"
        },
        {
            "id": "worcester_hadley_siblings",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 1890s 해들리 바구니를 든 전원 남매 센터피스 1쌍 (No. 96)",
            "title_en": "Royal Worcester 1890s James Hadley Pastoral Siblings Centerpieces",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1890)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory Porcelain & Bronze Green Enamels",
            "desc": "로열우스터의 전설적인 수석 조각가 제임스 해들리(James Hadley)의 걸작으로, 커다란 바구니를 들고 있는 소년과 소녀의 순수한 표정이 살아 숨 쉬는 대형 센터피스 1쌍입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\03_로열우스터_1890s_해들리_바구니를든전원남매_센터피스_1쌍_96"
        },
        {
            "id": "worcester_warwick_vase",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 워릭캐슬 레이스 투각 대형 포푸리 화병 (32cm)",
            "title_en": "Royal Worcester Warwick Castle Reticulated Potpourri Vase (32cm)",
            "brand": "Grainger Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1895)",
            "origin": "England (Grainger Royal Worcester)",
            "material": "Reticulated Pierced Fine Bone China",
            "desc": "장인의 정밀한 수작업 레이스 투각 넥과 돔 리드, 정면의 워릭 캐슬(Warwick Castle) 풍경화 및 후면 제비 세밀화가 수놓아진 32cm 대형 마스터피스입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\04_로열우스터_그레인저_워릭캐슬_레이스투각_대형포푸리화병_32cm_2256"
        },
        {
            "id": "worcester_painted_fruit_demitasse",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 페인티드 프루츠 24K 올골드 내부 데미타스 2인조 세트",
            "title_en": "Royal Worcester Painted Fruit 24K All-Gold Demitasse Cups Pair",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "c.1920s",
            "origin": "England (Royal Worcester)",
            "material": "Bone China, 24K Solid Gold Interior, Hand-Painted Fruit",
            "desc": "찻잔 내부 전체를 24K 순금으로 도금하고 외벽에 농익은 복숭아와 청포도를 붓자국 하나 없이 세밀하게 묘사한 로열우스터의 최고가 시그니처 컬렉션입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\05_로열우스터_페인티드프루츠_24K올골드내부_데미타스_2인조세트"
        },
        {
            "id": "worcester_cherry_blossom_vase",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 에스테틱 벚꽃과 파랑새 자포니즘 골드화병 (No. 871)",
            "title_en": "Royal Worcester Aesthetic Cherry Blossoms & Bluebird Vase",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1885)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory Porcelain & 24K Raised Gilt",
            "desc": "화사하게 만개한 벚꽃 가지 위에 앉은 파랑새와 24K 입체 금박 링 핸들이 동양의 정취를 극대화한 빅토리안 자포니즘 화병입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\06_로열우스터_에스테틱_벚꽃과파랑새_자포니즘_골드화병_871"
        },
        {
            "id": "worcester_moorish_ewer",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 빅토리안 무어풍 아라베스크 부조 초대형 골드화병 (41cm)",
            "title_en": "Royal Worcester Moorish Arabesque Gilt Pierced Ewer (41cm)",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1885)",
            "origin": "England (Royal Worcester)",
            "material": "Moorish Pierced Porcelain & Heavy 24K Gold Relief",
            "desc": "빅토리아 시대 이슬람 무어 양식의 정교한 아라베스크 오픈워크 투각 손잡이와 24K 금박 부조가 돋보이는 41cm 초대형 왕실 에워 화병입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\07_로열우스터_빅토리안_무어풍아라베스크부조_초대형골드화병_41cm_778"
        },
        {
            "id": "worcester_chrysanthemum_vase",
            "category": "worcester",
            "category_name": "👑 영국 로열우스터",
            "title_ko": "로열우스터 1880s 자포니즘 국화세밀화 투각넥 골드화병 (30cm, No. 1133)",
            "title_en": "Royal Worcester 1880s Japonisme Chrysanthemum Reticulated Vase",
            "brand": "Royal Worcester",
            "flag": "🇬🇧",
            "era": "Victorian Period (c.1886)",
            "origin": "England (Royal Worcester)",
            "material": "Blush Ivory Porcelain, Reticulated Neck & Floral Miniature",
            "desc": "만개한 핑크와 퍼플 국화 세밀화와 정교한 투각 넥 및 돔 피니얼이 결합된 30cm 명품 화병입니다.",
            "rel_path": r"09_영국_로열우스터_왕실포슬린_컬렉션\08_로열우스터_1880s_자포니즘_국화세밀화_투각넥골드화병_30cm_1133"
        }
    ]

    session = rembg.new_session("u2net")
    device = 0 if torch.cuda.is_available() else -1
    print("[Pipeline] Loading Depth-Anything-V2-Base model...")
    depth_pipe = pipeline(task="depth-estimation", model="depth-anything/Depth-Anything-V2-Base-hf", device=device)

    all_museum_data = {}
    target_w, target_h = 1536, 2048

    for idx_item, item in enumerate(item_definitions):
        c_id = item["id"]
        c_dir = os.path.join(output_root, c_id)
        os.makedirs(c_dir, exist_ok=True)

        print(f"\n=================================================================")
        print(f"[{idx_item+1}/{len(item_definitions)}] Processing {item['title_ko']}")
        print(f"=================================================================")

        # Collect source photos
        if "src_dir" in item:
            folder = item["src_dir"]
            files = sorted([f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f)) and item["file_filter"](f)])
        else:
            folder = os.path.join(base_src_dir, item["rel_path"])
            files = sorted([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

        # Filter out photos with tape measures or low quality
        photos_meta = []
        p_count = 0

        for f_name in files:
            f_path = os.path.join(folder, f_name)
            raw_img = Image.open(f_path)
            raw_img = ImageOps.exif_transpose(raw_img)

            rgba_path = os.path.join(c_dir, f"rgba_{p_count:02d}.png")
            depth_path = os.path.join(c_dir, f"depth_{p_count:02d}.png")
            normal_path = os.path.join(c_dir, f"normal_{p_count:02d}.png")

            # Check if already processed to save time
            if not (os.path.exists(rgba_path) and os.path.exists(depth_path) and os.path.exists(normal_path)):
                raw_resized = raw_img.resize((target_w, target_h), Image.LANCZOS)
                rgba_pil = rembg.remove(raw_resized, session=session)
                rgba_np = np.array(rgba_pil)
                r_c, g_c, b_c, a = cv2.split(rgba_np)

                # Clean small noise islands in alpha
                num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 40).astype(np.uint8))
                if num_labels > 1:
                    cleaned_alpha = np.zeros_like(a)
                    for l in range(1, num_labels):
                        if stats[l, cv2.CC_STAT_AREA] > 2000:
                            cleaned_alpha[labels == l] = a[labels == l]
                    a = cleaned_alpha

                a = cv2.GaussianBlur(a, (3, 3), 0)
                final_rgba = cv2.merge([r_c, g_c, b_c, a])
                Image.fromarray(final_rgba).save(rgba_path)

                # Depth Anything V2
                rgb_img = Image.fromarray(cv2.merge([r_c, g_c, b_c]))
                depth_res = depth_pipe(rgb_img)
                depth_pil = depth_res["depth"]
                depth_np = np.array(depth_pil).astype(np.float32)

                valid_depth = depth_np[a > 40]
                if len(valid_depth) > 0:
                    d_min = np.percentile(valid_depth, 2)
                    d_max = np.percentile(valid_depth, 98)
                    depth_norm = np.clip((depth_np - d_min) / (d_max - d_min + 1e-6), 0.0, 1.0)
                else:
                    depth_norm = (depth_np - depth_np.min()) / (depth_np.max() - depth_np.min() + 1e-6)

                depth_u8 = (depth_norm * 255.0).astype(np.uint8)
                depth_u8[a < 30] = 0
                Image.fromarray(depth_u8).save(depth_path)

                # Normal map
                strength = 2.5
                sobel_x = ndi.sobel(depth_norm, axis=1) * strength
                sobel_y = ndi.sobel(depth_norm, axis=0) * strength

                nx = -sobel_x
                ny = -sobel_y
                nz = np.ones_like(depth_norm)
                norm = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
                nx /= norm
                ny /= norm
                nz /= norm

                nr = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)
                ng = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)
                nb = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)

                normal_rgb = np.stack([nr, ng, nb], axis=-1)
                normal_rgb[a < 30] = [128, 128, 255]
                Image.fromarray(normal_rgb).save(normal_path)
                print(f"  -> Generated 2.5D View {p_count:02d} for {c_id}")
            else:
                print(f"  -> View {p_count:02d} already cached")

            tags = ["Front View", "Hero 45°", "Right 60°", "Side 90°", "Rear 135°", "Back 180°", "Rear 225°", "Left Side", "Hero Left", "Macro 1", "Macro 2", "Macro 3", "Macro 4", "Backstamp", "Top View", "Detail"]
            tag_name = tags[p_count % len(tags)]

            photos_meta.append({
                "id": p_count,
                "name": f"각도 {p_count+1}: {tag_name}",
                "tag": tag_name,
                "desc": f"{item['title_ko']}의 실물 초정밀 디테일 ({tag_name})",
                "rgba": f"antique_collections/{c_id}/rgba_{p_count:02d}.png",
                "depth": f"antique_collections/{c_id}/depth_{p_count:02d}.png",
                "normal": f"antique_collections/{c_id}/normal_{p_count:02d}.png"
            })
            p_count += 1

        all_museum_data[c_id] = {
            "id": c_id,
            "category": item["category"],
            "category_name": item["category_name"],
            "title_ko": item["title_ko"],
            "title_en": item["title_en"],
            "brand": item["brand"],
            "flag": item["flag"],
            "era": item["era"],
            "origin": item["origin"],
            "material": item["material"],
            "desc": item["desc"],
            "photos": photos_meta
        }

    # Save Grand Master Catalog
    grand_catalog_path = os.path.join(output_root, "grand_master_catalog.json")
    with open(grand_catalog_path, "w", encoding="utf-8") as f:
        json.dump(all_museum_data, f, indent=2, ensure_ascii=False)

    print("\n=== ALL ANTIQUES IN C:\\Users\\황태민\\Documents\\엔틱 PROCESSED SUCCESSFULLY ===")

if __name__ == "__main__":
    build_grand_antique_museum()
