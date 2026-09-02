import os, json, glob

def curate_collections():
    # 1. Custom photo sort & filter per collection
    # Worcester Greek Goddess:
    # 02: Standing goddess 1 front
    # 03: Standing goddess 2 front
    # 04, 05: Drapery & back
    # 06, 07: Pair compositions
    # 08, 09, 10, 11: Bust & face macros
    # 00, 01: Hallmarks
    # 12, 13: Scale shots -> exclude
    
    greek_photos = [
        {"file_idx": 2, "name": "여신상 1 정면 전신 뷰", "tag": "Goddess 1 Front", "desc": "블러시 아이보리 누드 포슬린과 24K 금박 드레이퍼리 전신 뷰"},
        {"file_idx": 3, "name": "여신상 2 정면 전신 뷰", "tag": "Goddess 2 Front", "desc": "손으로 얼굴을 가린 고전 비극 여신상의 우아한 자태"},
        {"file_idx": 6, "name": "그리스 여신상 1쌍 배치 뷰", "tag": "Pair Hero", "desc": "1890년대 로열우스터 한 쌍의 조화로운 고전주의 조형미"},
        {"file_idx": 7, "name": "여신상 1쌍 후면 뷰", "tag": "Pair Rear", "desc": "금박 주름 드레이퍼리와 등판 실루엣 3D 뷰"},
        {"file_idx": 4, "name": "드레이퍼리 하단 & 베이스", "tag": "Base Detail", "desc": "24K 금박 원형 베이스와 유기적인 주름 조각"},
        {"file_idx": 5, "name": "드레이퍼리 후면 주름", "tag": "Drapery Rear", "desc": "로열우스터 수작업 조각 장인의 섬세한 패브릭 질감"},
        {"file_idx": 8, "name": "여신상 1 두상 & 흉상 클로즈업", "tag": "Macro Face 1", "desc": "그리스 여신의 온화한 미소와 컬 헤어스타일"},
        {"file_idx": 9, "name": "여신상 2 두상 & 흉상 클로즈업", "tag": "Macro Face 2", "desc": "고뇌하는 표정과 팔찌 24K 골드 밴드 디테일"},
        {"file_idx": 10, "name": "여신상 상체 누드 조각", "tag": "Macro Torso", "desc": "대리석 같은 부드러운 블러시 아이보리 무광 질감"},
        {"file_idx": 11, "name": "여신상 1쌍 상체 듀오", "tag": "Macro Duo", "desc": "두 여신상의 극적인 감정 대비 클로즈업"},
        {"file_idx": 0, "name": "하단 공식 백스탬프 (No. 2/57)", "tag": "Backstamp 1", "desc": "Royal Worcester 보라색 왕관 각인 및 2/57 번호"},
        {"file_idx": 1, "name": "하단 공식 백스탬프 2", "tag": "Backstamp 2", "desc": "빅토리아 시대 영국 왕실 도자기 정품 인증 마크"}
    ]

    # Sevres Blue Box:
    # Remove photo 0 (tape measure)
    # 01: Hero 45
    # 02: Top view floral
    # 08: Front view
    # 03, 04, 05: Open lid & interior views
    # 06, 07: Side views
    # 09, 10: Macro details
    blue_box_photos = [
        {"file_idx": 2, "name": "세브르 블루 힌지 보석함 정면 뷰", "tag": "Front View", "desc": "Bleu de Roi 코발트 블루 에나멜과 24K 오르몰루 브론즈 힌지"},
        {"file_idx": 1, "name": "3/4 우측 얼짱 앵글", "tag": "Hero 45°", "desc": "직사각형 힌지 박스의 입체감과 상단 플로럴 부케"},
        {"file_idx": 8, "name": "상단 플로럴 부케 세밀화", "tag": "Top Floral", "desc": "장미, 팬지, 물망초 등 프랑스 궁정 화원의 핸드페인팅"},
        {"file_idx": 3, "name": "오픈 리드 내부 뷰 (오르몰루 힌지)", "tag": "Open Interior", "desc": "백색 순백 포슬린 내부와 정품 세브르 각인 마크"},
        {"file_idx": 4, "name": "오픈 리드 정면 뷰", "tag": "Open Front", "desc": "황동 힌지의 정밀 결합 구조와 뚜껑 안쪽 세브르 로고"},
        {"file_idx": 7, "name": "후면 골드 스크롤 뷰", "tag": "Back View", "desc": "후면 24K 금박 로코코 로즈 엠블럼과 힌지 메커니즘"},
        {"file_idx": 9, "name": "상단 뚜껑 로코코 프레임", "tag": "Macro Lid", "desc": "24K 금박 액자 프레임과 핸드페인팅 꽃다발 클로즈업"},
        {"file_idx": 10, "name": "측면 금박 장미 각인", "tag": "Macro Side", "desc": "코발트 블루 바탕 위의 24K 입체 금박 인두 조각"}
    ]

    # Sevres Rose Box:
    # 01: Hero 45
    # 02: Right 60
    # 00: Front View
    # 03: Side 90
    # 04, 05: Open interior
    # 07: Back View
    # 08: Left Side
    # 09, 10: Top floral & Hallmark
    rose_box_photos = [
        {"file_idx": 1, "name": "세브르 로즈 퐁파두르 보석함 얼짱 뷰", "tag": "Hero 45°", "desc": "로즈 퐁파두르 핑크 에나멜과 24K 오르몰루 브론즈 힌지 마스터피스"},
        {"file_idx": 2, "name": "우측 60도 입체 뷰", "tag": "Right 60°", "desc": "직사각 힌지 박스의 화려한 로코코 금박 프레임과 플로럴 부케"},
        {"file_idx": 0, "name": "정면 메인 뷰", "tag": "Front View", "desc": "브론즈 힌지 자물쇠 버클과 전면 핑크 유약 그라데이션"},
        {"file_idx": 3, "name": "우측 측면 뷰", "tag": "Side 90°", "desc": "측면 24K 금박 덩굴무늬와 브론즈 림 엣지"},
        {"file_idx": 4, "name": "오픈 리드 내부 뷰", "tag": "Open Interior", "desc": "백색 순백 포슬린 내부와 뚜껑 안쪽 퐁파두르 여인 초상화"},
        {"file_idx": 5, "name": "오픈 리드 45도 뷰", "tag": "Open 45°", "desc": "황동 힌지의 완벽한 작동 각도와 내부 마감"},
        {"file_idx": 7, "name": "후면 뷰", "tag": "Back 180°", "desc": "후면 힌지 연결 부품과 로즈 퐁파두르 유약 표면"},
        {"file_idx": 9, "name": "상단 플로럴 부케 클로즈업", "tag": "Macro Floral", "desc": "수작업 에나멜 플로럴 페인팅과 24K 금박 잎사귀"},
        {"file_idx": 10, "name": "오픈 뚜껑 내부 명화 세밀화", "tag": "Macro Painting", "desc": "뚜껑 내부의 궁정 귀족 여인 세밀화 초정밀 디테일"}
    ]

    # Warwick Vase:
    warwick_photos = [
        {"file_idx": 0, "name": "워릭캐슬 레이스 투각 화병 정면 뷰", "tag": "Front View", "desc": "워릭 캐슬(Warwick Castle) 명화와 32cm 대형 레이스 투각 넥"},
        {"file_idx": 1, "name": "우측 45도 얼짱 뷰", "tag": "Hero 45°", "desc": "오픈워크 레이스 투각 손잡이와 돔형 리드의 입체감"},
        {"file_idx": 2, "name": "우측 90도 측면 뷰", "tag": "Side 90°", "desc": "황금빛 손잡이 곡선과 8각 받침대(Octagonal Base)"},
        {"file_idx": 3, "name": "후면 제비 세밀화 뷰", "tag": "Back 180°", "desc": "후면의 날아가는 제비 2마리 에나멜 핸드페인팅"},
        {"file_idx": 4, "name": "3/4 좌측 얼짱 뷰", "tag": "Hero Left", "desc": "영국 성곽 풍경화와 파인 본차이나 순백의 조화"},
        {"file_idx": 8, "name": "상단 돔 리드 분리 뷰", "tag": "Lid View", "desc": "레이스 투각 돔 뚜껑과 내부 보조 캡"},
        {"file_idx": 9, "name": "투각 넥 상단 항공 뷰", "tag": "Top Neck", "desc": "장인이 칼로 하나하나 파낸 초정밀 오픈워크 투각"},
        {"file_idx": 10, "name": "3단 분리 마스터 구성", "tag": "3-Piece Set", "desc": "본체, 내부 커버, 외부 투각 돔 리드 전체 구성"}
    ]

    # Moorish Ewer:
    moorish_photos = [
        {"file_idx": 0, "name": "무어풍 아라베스크 골드화병 정면 뷰", "tag": "Front View", "desc": "41cm 초대형 이슬람 무어 양식 오픈워크 핸들과 24K 금박 부조"},
        {"file_idx": 1, "name": "우측 45도 얼짱 뷰", "tag": "Hero 45°", "desc": "입체 아라베스크 문양과 골드 부조의 웅장한 볼륨감"},
        {"file_idx": 2, "name": "우측 90도 측면 프로필", "tag": "Side 90°", "desc": "에워(Ewer) 주구와 손잡이의 독창적인 실루엣"},
        {"file_idx": 3, "name": "우측 후면 135도 뷰", "tag": "Rear 135°", "desc": "360도 전방위 아라베스크 부조와 골드 트림"},
        {"file_idx": 4, "name": "후면 180도 뷰", "tag": "Back 180°", "desc": "대칭적인 무어풍 패턴과 견고한 앤틱 받침대"},
        {"file_idx": 7, "name": "아라베스크 부조 메달리온 클로즈업", "tag": "Macro Relief", "desc": "정면 중앙의 24K 중후한 골드 양각 부조"},
        {"file_idx": 8, "name": "오픈워크 투각 핸들 클로즈업", "tag": "Macro Handle", "desc": "정교한 손잡이 투각 패턴과 금박 상감"},
        {"file_idx": 9, "name": "에워 첨탑 캡 클로즈업", "tag": "Macro Finial", "desc": "모스크 첨탑 형태의 피니얼과 골드 링"}
    ]

    # Past Glory:
    past_glory_photos = [
        { "file_idx": 0, "name": "정면 메인 포트레이트", "tag": "Front View", "desc": "단추 10개, 가슴 훈장 3종, 황동 나팔 및 은빛 콧수염 정면" },
        { "file_idx": 1, "name": "3/4 우측 얼짱 앵글", "tag": "Hero 45°", "desc": "나팔관 입구와 오른쪽 소매 셰브론 계급장 입체 뷰" },
        { "file_idx": 2, "name": "우측 60도 앵글", "tag": "Right 60°", "desc": "황동 버글 손잡이 루프와 무릎 관절 실물 디테일" },
        { "file_idx": 3, "name": "우측 90도 측면 프로필", "tag": "Side 90°", "desc": "모자 챙과 귓바퀴, 마호가니 궤짝 측면 손잡이" },
        { "file_idx": 4, "name": "우측 후면 135도 앵글", "tag": "Rear 135°", "desc": "연금병 코트 등판 절개 라인과 궤짝 모서리 버클" },
        { "file_idx": 5, "name": "후면 궤짝 뷰", "tag": "Back 180°", "desc": "나무 궤짝 질감과 네이비/블랙 팬츠 뒷면" },
        { "file_idx": 6, "name": "좌측 후면 225도 앵글", "tag": "Rear 225°", "desc": "좌측 코트 실루엣과 바닥면 접지 디테일" },
        { "file_idx": 7, "name": "좌측 90도 측면 프로필", "tag": "Left Side", "desc": "좌측 팔 상완 상병 셰브론(Chevrons) 계급장 각인" },
        { "file_idx": 8, "name": "3/4 좌측 얼짱 앵글", "tag": "Hero Left", "desc": "가슴 훈장 리본 바(청록/녹색/적색)와 메달 클로즈업" },
        { "file_idx": 9, "name": "상체 & 훈장 클로즈업", "tag": "Macro Medals", "desc": "로얄둘튼 핸드페인팅 에나멜 훈장 3종 초정밀 디테일" },
        { "file_idx": 10, "name": "황동 버글(Bugle) 나팔", "tag": "Macro Horn", "desc": "황동 나팔관과 블랙 실크 태슬(술) 매듭 클로즈업" },
        { "file_idx": 11, "name": "앤틱 마호가니 궤짝", "tag": "Macro Trunk", "desc": "철제 코너바와 황동 측면 버클 앤틱 우드 질감" },
        { "file_idx": 12, "name": "하단 공식 백스탬프", "tag": "Backstamp", "desc": "Royal Doulton 공식 왕관 로고 및 HN 2484 각인 정품 인증" },
        { "file_idx": 13, "name": "피크드 캡 & RH 엠블럼", "tag": "Macro Cap", "desc": "Royal Hospital 골드 자수 RH 엠블럼과 유광 챙" }
    ]

    collections_spec = [
        ("royal_doulton_past_glory", "depth_2_5d", past_glory_photos, "🇬🇧", "로열둘튼 1970s 'Past Glory' 체어맨 (HN 2484)", "Royal Doulton 'Past Glory' (HN 2484)", "Royal Doulton", "1972 ~ 1979", "England", "Fine Bone China", "영국 첼시 연금병의 자부심을 담은 로열둘튼의 1970년대 마스터피스로, 선명한 레드 에나멜 코트와 핸드페인팅 훈장, 황동 버글 나팔이 완벽한 조화를 이룹니다."),
        ("sevres_rose_box", "antique_collections/sevres_rose_box", rose_box_photos, "🇫🇷", "세브르 로즈 퐁파두르 오르몰루 힌지 보석함 (14cm)", "Sèvres Rose Pompadour Ormolu Hinged Box", "Sèvres", "19th Century (c.1880)", "France (Sèvres)", "Rose Pompadour Porcelain & 24K Ormolu Bronze", "프랑스 왕실 세브르의 독보적인 로즈 퐁파두르 핑크 유약에 24K 오르몰루 브론즈 마운트와 플로럴 핸드페인팅이 결합된 최고급 힌지 주얼리 박스입니다."),
        ("worcester_greek_goddess", "antique_collections/worcester_greek_goddess", greek_photos, "🇬🇧", "로열우스터 1890s 고전 그리스 여인 골드 조각상 1쌍 (No. 2/57)", "Royal Worcester Classical Greek Goddesses Pair", "Royal Worcester", "Victorian Period (c.1890)", "England (Royal Worcester)", "Blush Ivory Porcelain & 24K Gilt Drapery", "영국 왕실 도자기 로열우스터 전성기의 블러시 아이보리 포슬린과 24K 금박 드레이퍼리가 완벽한 균형을 이루는 고전 그리스 여신 입체 조각상 1쌍입니다."),
        ("worcester_warwick_vase", "antique_collections/worcester_warwick_vase", warwick_photos, "🇬🇧", "로열우스터 워릭캐슬 레이스 투각 대형 포푸리 화병 (32cm)", "Royal Worcester Warwick Castle Reticulated Vase", "Grainger Worcester", "Victorian Period (c.1895)", "England (Grainger Royal Worcester)", "Reticulated Pierced Fine Bone China", "장인의 정밀한 수작업 레이스 투각 넥과 돔 리드, 정면의 워릭 캐슬(Warwick Castle) 풍경화 및 후면 제비 세밀화가 수놓아진 32cm 대형 마스터피스입니다."),
        ("worcester_moorish_ewer", "antique_collections/worcester_moorish_ewer", moorish_photos, "🇬🇧", "로열우스터 빅토리안 무어풍 아라베스크 부조 초대형 골드화병 (41cm)", "Royal Worcester Moorish Arabesque Gilt Ewer", "Royal Worcester", "Victorian Period (c.1885)", "England (Royal Worcester)", "Moorish Pierced Porcelain & Heavy 24K Gold Relief", "빅토리아 시대 이슬람 무어 양식의 정교한 아라베스크 오픈워크 투각 손잡이와 24K 금박 부조가 돋보이는 41cm 초대형 왕실 에워 화병입니다."),
        ("sevres_blue_box", "antique_collections/sevres_blue_box", blue_box_photos, "🇫🇷", "세브르 블루 포슬린 핸드페인팅 힌지 보석함 (13cm)", "Sèvres Bleu de Roi Hand-Painted Hinged Box", "Sèvres", "19th Century (c.1870)", "France (Sèvres)", "Bleu de Roi Porcelain & Ormolu Bronze", "왕의 파랑(Bleu de Roi) 에나멜과 화려한 24K 금박 스크롤, 프랑스 궁정 화원의 플로럴 부케 핸드페인팅이 어우러진 럭셔리 힌지 보석함입니다.")
    ]

    all_dict = {}
    for cid, folder, plist, flag, tko, ten, brand, era, origin, mat, desc in collections_spec:
        final_p_list = []
        for i, item in enumerate(plist):
            f_idx = item["file_idx"]
            final_p_list.append({
                "id": i,
                "name": item["name"],
                "tag": item["tag"],
                "desc": item["desc"],
                "rgba": f"{folder}/rgba_{f_idx:02d}.png",
                "depth": f"{folder}/depth_{f_idx:02d}.png",
                "normal": f"{folder}/normal_{f_idx:02d}.png"
            })
        all_dict[cid] = {
            "id": cid,
            "title_ko": tko,
            "title_en": ten,
            "brand": brand,
            "flag": flag,
            "era": era,
            "origin": origin,
            "material": mat,
            "desc": desc,
            "photos": final_p_list
        }

    # Now rewrite index.html cleanly
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Replace masterCollections object in index.html
    import re
    json_str = json.dumps(all_dict, indent=2, ensure_ascii=False)
    new_html = re.sub(r'const masterCollections = \{[\s\S]*?\};\n\n        let currentTab', f'const masterCollections = {json_str};\n\n        let currentTab', html)

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)

    print("index.html perfectly curated and updated with flawless photo sequences!")

if __name__ == "__main__":
    curate_collections()
