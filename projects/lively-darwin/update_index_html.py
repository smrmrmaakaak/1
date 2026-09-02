import os, json

def update_index_html():
    # Load metadata from master_catalog.json
    with open("antique_collections/master_catalog.json", "r", encoding="utf-8") as f:
        master_catalog = json.load(f)

    # Add royal doulton past glory
    past_glory_photos = [
        { "id": 0, "name": "정면 메인 포트레이트", "tag": "Front View", "desc": "단추 10개, 가슴 훈장 3종, 황동 나팔 및 은빛 콧수염 정면" },
        { "id": 1, "name": "3/4 우측 얼짱 앵글", "tag": "Hero 45°", "desc": "나팔관 입구와 오른쪽 소매 셰브론 계급장 입체 뷰" },
        { "id": 2, "name": "우측 60도 앵글", "tag": "Right 60°", "desc": "황동 버글 손잡이 루프와 무릎 관절 실물 디테일" },
        { "id": 3, "name": "우측 90도 측면 프로필", "tag": "Side 90°", "desc": "모자 챙과 귓바퀴, 마호가니 궤짝 측면 손잡이" },
        { "id": 4, "name": "우측 후면 135도 앵글", "tag": "Rear 135°", "desc": "연금병 코트 등판 절개 라인과 궤짝 모서리 버클" },
        { "id": 5, "name": "후면 궤짝 뷰", "tag": "Back 180°", "desc": "나무 궤짝 질감과 네이비/블랙 팬츠 뒷면" },
        { "id": 6, "name": "좌측 후면 225도 앵글", "tag": "Rear 225°", "desc": "좌측 코트 실루엣과 바닥면 접지 디테일" },
        { "id": 7, "name": "좌측 90도 측면 프로필", "tag": "Left Side", "desc": "좌측 팔 상완 상병 셰브론(Chevrons) 계급장 각인" },
        { "id": 8, "name": "3/4 좌측 얼짱 앵글", "tag": "Hero Left", "desc": "가슴 훈장 리본 바(청록/녹색/적색)와 메달 클로즈업" },
        { "id": 9, "name": "상체 & 훈장 클로즈업", "tag": "Macro Medals", "desc": "로얄둘튼 핸드페인팅 에나멜 훈장 3종 초정밀 디테일" },
        { "id": 10, "name": "황동 버글(Bugle) 나팔", "tag": "Macro Horn", "desc": "황동 나팔관과 블랙 실크 태슬(술) 매듭 클로즈업" },
        { "id": 11, "name": "앤틱 마호가니 궤짝", "tag": "Macro Trunk", "desc": "철제 코너바와 황동 측면 버클 앤틱 우드 질감" },
        { "id": 12, "name": "하단 공식 백스탬프", "tag": "Backstamp", "desc": "Royal Doulton 공식 왕관 로고 및 HN 2484 각인 정품 인증" },
        { "id": 13, "name": "피크드 캡 & RH 엠블럼", "tag": "Macro Cap", "desc": "Royal Hospital 골드 자수 RH 엠블럼과 유광 챙" }
    ]

    for p in past_glory_photos:
        idx = p["id"]
        p["rgba"] = f"depth_2_5d/rgba_{idx:02d}.png"
        p["depth"] = f"depth_2_5d/depth_{idx:02d}.png"
        p["normal"] = f"depth_2_5d/normal_{idx:02d}.png"

    all_collections_dict = {
        "royal_doulton_past_glory": {
            "id": "royal_doulton_past_glory",
            "title_ko": "로열둘튼 1970s 'Past Glory' 체어맨 (HN 2484)",
            "title_en": "Royal Doulton 'Past Glory' (HN 2484)",
            "brand": "Royal Doulton",
            "flag": "🇬🇧",
            "era": "1972 ~ 1979",
            "origin": "England",
            "material": "Fine Bone China",
            "desc": "영국 첼시 연금병의 자부심을 담은 로열둘튼의 1970년대 마스터피스로, 선명한 레드 에나멜 코트와 핸드페인팅 훈장, 황동 버글 나팔이 완벽한 조화를 이룹니다.",
            "photos": past_glory_photos
        }
    }

    angle_tags = ["Front View", "Hero 45°", "Right 60°", "Side 90°", "Rear 135°", "Back 180°", "Rear 225°", "Left Side", "Hero Left", "Macro 1", "Macro 2", "Macro 3", "Macro 4", "Backstamp", "Overview", "Detail"]
    flags = {
        "sevres_rose_box": "🇫🇷",
        "worcester_greek_goddess": "🇬🇧",
        "worcester_warwick_vase": "🇬🇧",
        "worcester_moorish_ewer": "🇬🇧",
        "sevres_blue_box": "🇫🇷"
    }

    for item in master_catalog:
        info = item["info"]
        c_id = info["id"]
        photos = []
        for p_idx, p in enumerate(item["photos"]):
            tag = angle_tags[p_idx % len(angle_tags)]
            photos.append({
                "id": p["id"],
                "name": f"각도 {p_idx+1}: {tag}",
                "tag": tag,
                "desc": f"{info['title_ko']}의 정밀 디테일 뷰 ({tag})",
                "rgba": p["rgba"],
                "depth": p["depth"],
                "normal": p["normal"]
            })
        
        all_collections_dict[c_id] = {
            "id": c_id,
            "title_ko": info["title_ko"],
            "title_en": info["title_en"],
            "brand": info["title_en"].split()[0],
            "flag": flags.get(c_id, "🏺"),
            "era": info["era"],
            "origin": info["origin"],
            "material": info["material"],
            "desc": info["desc"],
            "photos": photos
        }

    html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 디지털 마스터 뷰어 | 앤틱 명품관 6종 & 위례 37평 3D</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-main: #07090e;
            --panel-bg: rgba(255, 255, 255, 0.95);
            --panel-border: rgba(255, 255, 255, 0.12);
            --accent-primary: #3b82f6;
            --accent-prugio: #006654;
            --accent-antique: #c2410c;
            --accent-gold: #d97706;
            --accent-holo: #8b5cf6;
            --text-dark: #0f172a;
            --text-muted: #64748b;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
        }}

        body {{
            font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-dark);
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }}

        /* Top Header */
        .header-bar {{
            position: absolute;
            top: 18px;
            left: 22px;
            z-index: 100;
            background: var(--panel-bg);
            backdrop-filter: blur(24px);
            border: 1px solid var(--panel-border);
            padding: 8px 16px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }}

        .model-switcher {{
            display: flex;
            background: #f1f5f9;
            padding: 3px;
            border-radius: 12px;
            gap: 3px;
        }}

        .model-pill {{
            border: none;
            background: transparent;
            padding: 6px 12px;
            border-radius: 9px;
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .model-pill:hover {{
            color: #0f172a;
        }}

        .model-pill.active-prugio {{
            background: #006654;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 102, 84, 0.35);
        }}

        .model-pill.active-antique {{
            background: linear-gradient(135deg, #c2410c, #ea580c);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(194, 65, 12, 0.4);
        }}

        .header-title h1 {{
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
        }}

        .header-title p {{
            font-size: 10.5px;
            color: var(--text-muted);
        }}

        /* Collection Selector Bar */
        .collection-bar {{
            position: absolute;
            top: 72px;
            left: 22px;
            z-index: 100;
            background: rgba(15, 23, 42, 0.88);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 5px 8px;
            border-radius: 14px;
            display: flex;
            gap: 5px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: calc(100vw - 440px);
            overflow-x: auto;
        }}

        .col-pill {{
            border: 1px solid transparent;
            background: rgba(255, 255, 255, 0.06);
            color: #94a3b8;
            padding: 5px 11px;
            border-radius: 10px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }}

        .col-pill:hover {{
            color: #ffffff;
            background: rgba(255, 255, 255, 0.12);
        }}

        .col-pill.active {{
            background: linear-gradient(135deg, #d97706, #ea580c);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);
        }}

        /* Top Center Mode Bar */
        .top-center-bar {{
            position: absolute;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            background: var(--panel-bg);
            backdrop-filter: blur(24px);
            border: 1px solid var(--panel-border);
            padding: 5px 8px;
            border-radius: 16px;
            display: flex;
            gap: 4px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }}

        .mode-btn {{
            background: transparent;
            color: var(--text-muted);
            border: none;
            padding: 7px 13px;
            border-radius: 10px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }}

        .mode-btn:hover {{
            color: var(--text-dark);
            background: rgba(0, 0, 0, 0.05);
        }}

        .mode-btn.active {{
            background: #0f172a;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
        }}

        /* 3D Canvas Viewport */
        #viewport {{
            width: 100vw;
            height: 100vh;
            display: block;
            outline: none;
        }}

        /* Right Detail Inspector Panel */
        .info-panel {{
            position: absolute;
            top: 18px;
            right: 22px;
            bottom: 22px;
            width: 390px;
            background: var(--panel-bg);
            backdrop-filter: blur(28px);
            border: 1px solid var(--panel-border);
            border-radius: 24px;
            padding: 22px;
            z-index: 90;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: -15px 0 45px rgba(0,0,0,0.25);
            overflow-y: auto;
        }}

        .info-panel::-webkit-scrollbar {{
            width: 5px;
        }}
        .info-panel::-webkit-scrollbar-thumb {{
            background: rgba(0,0,0,0.15);
            border-radius: 4px;
        }}

        .section-title {{
            font-size: 12.5px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.2px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .highlight-card {{
            border-radius: 14px;
            padding: 14px 16px;
            font-size: 12px;
            line-height: 1.55;
        }}
        .highlight-antique {{
            background: #fff7ed;
            border: 1px solid #ffedd5;
            color: #9a3412;
        }}
        .highlight-prugio {{
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            color: #166534;
        }}

        .spec-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
        }}

        .spec-box {{
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 10px 12px;
        }}
        .spec-box .label {{
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
        }}
        .spec-box .val {{
            font-size: 12.5px;
            font-weight: 800;
            color: #0f172a;
            font-family: 'JetBrains Mono', monospace;
        }}

        .control-group {{
            display: flex;
            flex-direction: column;
            gap: 7px;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 12px;
        }}
        .control-label-row {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
            font-weight: 700;
            color: #334155;
        }}

        .slider-input {{
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e2e8f0;
            outline: none;
            accent-color: #ea580c;
        }}

        .feature-card {{
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 14px;
            padding: 14px;
        }}
        .feature-title {{
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
        }}
        .feature-desc {{
            font-size: 11px;
            color: #64748b;
            line-height: 1.45;
        }}

        /* Bottom Filmstrip Carousel */
        .carousel-container {{
            position: absolute;
            bottom: 20px;
            left: 22px;
            right: 424px;
            z-index: 100;
            background: rgba(15, 23, 42, 0.90);
            backdrop-filter: blur(28px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            padding: 12px 16px;
            box-shadow: 0 15px 45px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            gap: 9px;
        }}

        .carousel-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 700;
            color: #cbd5e1;
        }}

        .filmstrip-scroll {{
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 4px;
            scroll-behavior: smooth;
        }}
        .filmstrip-scroll::-webkit-scrollbar {{
            height: 5px;
        }}
        .filmstrip-scroll::-webkit-scrollbar-thumb {{
            background: rgba(255, 255, 255, 0.25);
            border-radius: 4px;
        }}

        .thumb-card {{
            flex: 0 0 68px;
            height: 88px;
            border-radius: 10px;
            border: 2px solid transparent;
            overflow: hidden;
            cursor: pointer;
            position: relative;
            background: #1e293b;
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }}
        .thumb-card:hover {{
            transform: translateY(-2px);
            border-color: rgba(234, 88, 12, 0.6);
        }}
        .thumb-card.active {{
            border-color: #ea580c;
            box-shadow: 0 0 14px rgba(234, 88, 12, 0.6);
            transform: scale(1.04);
        }}
        .thumb-card img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }}
        .thumb-badge {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
            font-size: 9px;
            font-weight: 700;
            color: #ffffff;
            text-align: center;
            padding: 2px 0;
        }}

        /* Bottom Controls Bar for Mesh/Prugio */
        .bottom-prugio-bar {{
            position: absolute;
            bottom: 22px;
            left: 22px;
            z-index: 100;
            background: var(--panel-bg);
            backdrop-filter: blur(24px);
            border: 1px solid var(--panel-border);
            padding: 6px 10px;
            border-radius: 16px;
            display: flex;
            gap: 6px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }}

        .ctrl-btn {{
            background: transparent;
            border: 1px solid #e2e8f0;
            padding: 7px 12px;
            border-radius: 10px;
            font-size: 11.5px;
            font-weight: 700;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        .ctrl-btn:hover {{
            background: #f1f5f9;
            color: #0f172a;
        }}
        .ctrl-btn.active {{
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
        }}
    </style>
    <!-- Three.js & OrbitControls & GLTFLoader & Tween.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
</head>
<body>
    <!-- Top Left Header Navigation -->
    <div class="header-bar">
        <div class="model-switcher">
            <button class="model-pill active-antique" id="pill-antique-25d" onclick="switchMainTab('antique_25d')">
                🏺 2.5D 실사 홀로그램
            </button>
            <button class="model-pill" id="pill-antique-3d" onclick="switchMainTab('antique_3d')">
                📦 로얄둘튼 3D 메시
            </button>
            <button class="model-pill" id="pill-prugio" onclick="switchMainTab('prugio')">
                🏡 위례 37평 아파트
            </button>
        </div>
        <div class="header-title">
            <h1 id="header-main-title">앤틱 명품관 2.5D 실사 3D 홀로그램</h1>
            <p id="header-sub-text">100% 무손실 실물 사진 + Depth-Anything-V2 뎁스 맵</p>
        </div>
    </div>

    <!-- Collection Switcher Bar -->
    <div class="collection-bar" id="collection-bar">
        <!-- Dynamically rendered -->
    </div>

    <!-- Top Center Render Mode Bar -->
    <div class="top-center-bar" id="center-mode-bar">
        <button class="mode-btn active" id="btn-mode-photo" onclick="setHoloRenderMode('photo')">✨ 실사 3D 홀로그램</button>
        <button class="mode-btn" id="btn-mode-depth" onclick="setHoloRenderMode('depth')">🗺️ 3D 뎁스 맵</button>
        <button class="mode-btn" id="btn-mode-normal" onclick="setHoloRenderMode('normal')">🧭 3D 노멀 맵</button>
        <button class="mode-btn" id="btn-mode-clay" onclick="setHoloRenderMode('clay')">🏛️ 클레이 조각 뷰</button>
    </div>

    <!-- 3D Canvas -->
    <canvas id="viewport"></canvas>

    <!-- Bottom Filmstrip Carousel -->
    <div class="carousel-container" id="carousel-bar">
        <div class="carousel-header">
            <span>📸 실물 각도별 고해상도 실사 사진 셀렉터 (클릭시 즉시 3D 뎁스 전환)</span>
            <span id="current-photo-info" style="color: #ea580c; font-weight: 800;">1 / 14: 정면 메인 포트레이트</span>
        </div>
        <div class="filmstrip-scroll" id="filmstrip-list">
            <!-- Dynamically populated -->
        </div>
    </div>

    <!-- Bottom Controls Bar (Active in Prugio / 3D Mesh Mode) -->
    <div class="bottom-prugio-bar" id="bottom-prugio-bar" style="display: none;">
        <button class="ctrl-btn active" id="light-studio" onclick="setLightingPreset('studio')">💡 스튜디오</button>
        <button class="ctrl-btn" id="light-warm" onclick="setLightingPreset('warm')">🕯️ 갤러리 웜</button>
        <button class="ctrl-btn" id="light-rim" onclick="setLightingPreset('rim')">✨ 드라마틱 림</button>
        <div style="width: 1px; height: 18px; background: #e2e8f0; margin: 0 4px;"></div>
        <button class="ctrl-btn" onclick="resetCurrentCamera()">🔄 시점 리셋</button>
    </div>

    <!-- Right Inspector Panel -->
    <div class="info-panel" id="inspector-panel">
        <!-- Content dynamic -->
    </div>

    <script>
        /* === MASTER COLLECTIONS DATA === */
        const masterCollections = {json.dumps(all_collections_dict, indent=2, ensure_ascii=False)};

        let currentTab = 'antique_25d'; // 'antique_25d' | 'antique_3d' | 'prugio'
        let currentCollectionId = 'royal_doulton_past_glory';
        let holoMode = 'photo'; // 'photo' | 'depth' | 'normal' | 'clay'
        let currentPhotoIndex = 0;
        let depthStrength = 1.4;
        let specularSheen = 1.2;
        let autoBreathe = true;

        /* === THREE.JS SETUP === */
        const canvas = document.getElementById('viewport');
        const renderer = new THREE.WebGLRenderer({{ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x07090e);

        const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 2.8);

        const controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 8.0;
        controls.minDistance = 0.8;

        /* === LIGHTING SETUP === */
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(2, 3, 4);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x90b0ff, 0.6);
        fillLight.position.set(-3, -1, 2);
        scene.add(fillLight);

        /* === 2.5D HOLOGRAPHIC RELIEF MESH & SHADER === */
        const texLoader = new THREE.TextureLoader();
        let holoMesh = null;
        let holoMaterial = null;

        const HoloShader = {{
            uniforms: {{
                uColor: {{ value: null }},
                uDepth: {{ value: null }},
                uNormal: {{ value: null }},
                uDepthStrength: {{ value: 0.35 }},
                uSpecularSheen: {{ value: 1.2 }},
                uLightPos: {{ value: new THREE.Vector3(0.5, 0.8, 1.5) }},
                uRenderMode: {{ value: 0 }},
                uMouseOffset: {{ value: new THREE.Vector2(0, 0) }}
            }},
            vertexShader: `
                uniform sampler2D uDepth;
                uniform float uDepthStrength;
                uniform vec2 uMouseOffset;
                varying vec2 vUv;
                varying vec3 vNormalVec;
                varying vec3 vWorldPos;
                varying float vDepthVal;

                void main() {{
                    vUv = uv;
                    float d = texture2D(uDepth, uv).r;
                    vDepthVal = d;
                    
                    vec3 displacedPos = position;
                    displacedPos.z += (d - 0.2) * uDepthStrength;

                    displacedPos.x += (uMouseOffset.x * (d - 0.5)) * 0.08;
                    displacedPos.y += (uMouseOffset.y * (d - 0.5)) * 0.08;

                    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
                    vWorldPos = worldPos.xyz;
                    vNormalVec = normalize(normalMatrix * normal);

                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }}
            `,
            fragmentShader: `
                uniform sampler2D uColor;
                uniform sampler2D uDepth;
                uniform sampler2D uNormal;
                uniform float uSpecularSheen;
                uniform vec3 uLightPos;
                uniform int uRenderMode;
                uniform vec2 uMouseOffset;

                varying vec2 vUv;
                varying vec3 vNormalVec;
                varying vec3 vWorldPos;
                varying float vDepthVal;

                void main() {{
                    vec2 uvOffset = uMouseOffset * (vDepthVal - 0.5) * 0.025;
                    vec2 pUv = clamp(vUv + uvOffset, 0.0, 1.0);

                    vec4 colorTex = texture2D(uColor, pUv);
                    vec4 normTex = texture2D(uNormal, pUv);
                    float depth = texture2D(uDepth, pUv).r;

                    if (colorTex.a < 0.05 && depth < 0.02) {{
                        discard;
                    }}

                    vec3 N = normalize(normTex.rgb * 2.0 - 1.0);
                    N = normalize(mix(vNormalVec, N, 0.75));

                    vec3 L = normalize(uLightPos - vWorldPos);
                    vec3 V = normalize(cameraPosition - vWorldPos);
                    vec3 H = normalize(L + V);

                    float NdotL = max(dot(N, L), 0.0);
                    float NdotH = max(dot(N, H), 0.0);

                    float spec = pow(NdotH, 42.0) * uSpecularSheen;
                    float rim = pow(1.0 - max(dot(V, N), 0.0), 3.5) * 0.35;

                    vec3 finalColor = vec3(0.0);

                    if (uRenderMode == 0) {{
                        vec3 diffuse = colorTex.rgb;
                        vec3 specularColor = vec3(1.0, 0.98, 0.95) * spec * 0.35;
                        vec3 rimColor = vec3(0.9, 0.95, 1.0) * rim * 0.15;
                        finalColor = diffuse + specularColor + rimColor;
                    }} else if (uRenderMode == 1) {{
                        finalColor = vec3(depth);
                    }} else if (uRenderMode == 2) {{
                        finalColor = N * 0.5 + 0.5;
                    }} else if (uRenderMode == 3) {{
                        vec3 clay = vec3(0.85, 0.82, 0.80);
                        finalColor = clay * (NdotL * 0.6 + 0.4) + vec3(1.0) * spec * 1.5;
                    }}

                    gl_FragColor = vec4(finalColor, colorTex.a > 0.0 ? colorTex.a : 1.0);
                }}
            `
        }};

        function create2DHoloMesh() {{
            const geom = new THREE.PlaneGeometry(1.6, 2.13, 512, 512);
            
            holoMaterial = new THREE.ShaderMaterial({{
                uniforms: THREE.UniformsUtils.clone(HoloShader.uniforms),
                vertexShader: HoloShader.vertexShader,
                fragmentShader: HoloShader.fragmentShader,
                transparent: true,
                side: THREE.DoubleSide
            }});

            holoMesh = new THREE.Mesh(geom, holoMaterial);
            holoMesh.position.set(0, 0, 0);
            scene.add(holoMesh);
            
            loadCollection(currentCollectionId, 0);
        }}

        function loadCollection(colId, startPhotoIdx = 0) {{
            currentCollectionId = colId;
            currentPhotoIndex = startPhotoIdx;
            const col = masterCollections[colId];

            // Update Collection Selector UI
            renderCollectionBar();

            // Populate Filmstrip
            initFilmstrip();

            // Load Texture
            loadPhoto25D(startPhotoIdx);
        }}

        function loadPhoto25D(idx) {{
            currentPhotoIndex = idx;
            const col = masterCollections[currentCollectionId];
            const photo = col.photos[idx];
            
            texLoader.load(photo.rgba, (cTex) => {{
                cTex.encoding = THREE.sRGBEncoding;
                cTex.minFilter = THREE.LinearMipmapLinearFilter;
                cTex.generateMipmaps = true;
                holoMaterial.uniforms.uColor.value = cTex;
            }});

            texLoader.load(photo.depth, (dTex) => {{
                dTex.minFilter = THREE.LinearFilter;
                holoMaterial.uniforms.uDepth.value = dTex;
            }});

            texLoader.load(photo.normal, (nTex) => {{
                nTex.minFilter = THREE.LinearFilter;
                holoMaterial.uniforms.uNormal.value = nTex;
            }});

            document.getElementById('current-photo-info').innerText = `${{idx + 1}} / ${{col.photos.length}}: ${{photo.name}}`;
            updateCarouselActiveState(idx);
            renderInspectorUI();
        }}

        function renderCollectionBar() {{
            const bar = document.getElementById('collection-bar');
            bar.innerHTML = '';

            Object.values(masterCollections).forEach(col => {{
                const btn = document.createElement('button');
                btn.className = `col-pill ${{col.id === currentCollectionId ? 'active' : ''}}`;
                btn.innerHTML = `<span>${{col.flag}}</span> ${{col.title_ko.split('(')[0]}}`;
                btn.onclick = () => loadCollection(col.id, 0);
                bar.appendChild(btn);
            }});
        }}

        function setHoloRenderMode(mode) {{
            holoMode = mode;
            document.querySelectorAll('#center-mode-bar .mode-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(`btn-mode-${{mode}}`).classList.add('active');

            if (holoMaterial) {{
                const modeMap = {{ 'photo': 0, 'depth': 1, 'normal': 2, 'clay': 3 }};
                holoMaterial.uniforms.uRenderMode.value = modeMap[mode];
            }}
        }}

        /* === 3D GLTF MESH & PRUGIO LOADER === */
        let antique3dGroup = new THREE.Group();
        let prugioGroup = new THREE.Group();
        scene.add(antique3dGroup);
        scene.add(prugioGroup);

        const gltfLoader = new THREE.GLTFLoader();
        
        gltfLoader.load('antique_past_glory_master.glb', (gltf) => {{
            const m = gltf.scene;
            m.scale.set(7.5, 7.5, 7.5);
            m.position.set(0, -0.75, 0);
            antique3dGroup.add(m);
            antique3dGroup.visible = false;
        }});

        function buildPrugioProceduralApartment() {{
            const matWall = new THREE.MeshStandardMaterial({{ color: 0x1e293b, roughness: 0.4 }});
            const matFloor = new THREE.MeshStandardMaterial({{ color: 0xc89d6c, roughness: 0.35 }});
            const matBalcony = new THREE.MeshStandardMaterial({{ color: 0xe2e8f0, roughness: 0.2 }});

            const floor = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.2, 10.2), matFloor);
            floor.position.set(0, -0.1, 0);
            prugioGroup.add(floor);

            function addWall(x, z, w, d, h=1.4) {{
                const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matWall);
                wall.position.set(x, h/2, z);
                prugioGroup.add(wall);
            }}

            addWall(0, 5.1, 13.4, 0.25);
            addWall(0, -5.1, 13.4, 0.25);
            addWall(-6.7, 0, 0.25, 10.2);
            addWall(6.7, 0, 0.25, 10.2);

            addWall(-2.2, 0.5, 0.2, 9.0);
            addWall(1.8, -1.8, 0.2, 6.4);
            addWall(1.8, 2.5, 0.2, 5.0);

            addWall(-4.4, 0.5, 4.4, 0.2);
            addWall(4.2, 0.5, 4.8, 0.2);

            prugioGroup.visible = false;
        }}
        buildPrugioProceduralApartment();

        /* === TAB SWITCHER === */
        function switchMainTab(tab) {{
            currentTab = tab;
            document.querySelectorAll('.model-pill').forEach(p => {{
                p.classList.remove('active-antique', 'active-prugio');
            }});

            const centerBar = document.getElementById('center-mode-bar');
            const carouselBar = document.getElementById('carousel-bar');
            const collectionBar = document.getElementById('collection-bar');
            const prugioBar = document.getElementById('bottom-prugio-bar');

            if (tab === 'antique_25d') {{
                document.getElementById('pill-antique-25d').classList.add('active-antique');
                document.getElementById('header-main-title').innerText = '앤틱 명품관 2.5D 실사 3D 홀로그램';
                document.getElementById('header-sub-text').innerText = '100% 무손실 실물 사진 + Depth-Anything-V2 뎁스 맵';

                if (holoMesh) holoMesh.visible = true;
                antique3dGroup.visible = false;
                prugioGroup.visible = false;

                centerBar.style.display = 'flex';
                carouselBar.style.display = 'flex';
                collectionBar.style.display = 'flex';
                prugioBar.style.display = 'none';

                camera.position.set(0, 0, 2.8);
                controls.target.set(0, 0, 0);
                controls.update();
            }} else if (tab === 'antique_3d') {{
                document.getElementById('pill-antique-3d').classList.add('active-antique');
                document.getElementById('header-main-title').innerText = '로얄둘튼 1970s Past Glory (3D GLTF 메시)';
                document.getElementById('header-sub-text').innerText = 'Blender 4.2 LTS 연속 매니폴드 4K 베이크 메시';

                if (holoMesh) holoMesh.visible = false;
                antique3dGroup.visible = true;
                prugioGroup.visible = false;

                centerBar.style.display = 'none';
                carouselBar.style.display = 'none';
                collectionBar.style.display = 'none';
                prugioBar.style.display = 'flex';

                camera.position.set(0.35, 0.25, 1.8);
                controls.target.set(0, 0, 0);
                controls.update();
            }} else if (tab === 'prugio') {{
                document.getElementById('pill-prugio').classList.add('active-prugio');
                document.getElementById('header-main-title').innerText = '위례 푸르지오 37평 3D 가상 투어';
                document.getElementById('header-sub-text').innerText = '94A 타입 4-Bay 판상형 구조 실측 3D 모델';

                if (holoMesh) holoMesh.visible = false;
                antique3dGroup.visible = false;
                prugioGroup.visible = true;

                centerBar.style.display = 'none';
                carouselBar.style.display = 'none';
                collectionBar.style.display = 'none';
                prugioBar.style.display = 'flex';

                camera.position.set(0, 2.8, 3.2);
                controls.target.set(0, 0, 0);
                controls.update();
            }}

            renderInspectorUI();
        }}

        /* === MOUSE TRACKING & PARALLAX === */
        const mouse = {{ x: 0, y: 0, targetX: 0, targetY: 0 }};
        window.addEventListener('mousemove', (e) => {{
            mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        }});

        /* === FILMSTRIP POPULATION === */
        function initFilmstrip() {{
            const container = document.getElementById('filmstrip-list');
            container.innerHTML = '';
            const col = masterCollections[currentCollectionId];

            col.photos.forEach((p, idx) => {{
                const card = document.createElement('div');
                card.className = `thumb-card ${{idx === currentPhotoIndex ? 'active' : ''}}`;
                card.id = `thumb-${{idx}}`;
                card.onclick = () => loadPhoto25D(idx);

                card.innerHTML = `
                    <img src="${{p.rgba}}" alt="${{p.name}}">
                    <div class="thumb-badge">${{p.tag}}</div>
                `;
                container.appendChild(card);
            }});
        }}

        function updateCarouselActiveState(idx) {{
            document.querySelectorAll('.thumb-card').forEach((c, i) => {{
                c.classList.toggle('active', i === idx);
            }});
            const activeCard = document.getElementById(`thumb-${{idx}}`);
            if (activeCard) {{
                activeCard.scrollIntoView({{ behavior: 'smooth', inline: 'center', block: 'nearest' }});
            }}
        }}

        /* === RIGHT INSPECTOR PANEL UI === */
        function renderInspectorUI() {{
            const panel = document.getElementById('inspector-panel');

            if (currentTab === 'antique_25d') {{
                const col = masterCollections[currentCollectionId];
                const photo = col.photos[currentPhotoIndex];
                panel.innerHTML = `
                    <div class="section-title">
                        <span>🏺 2.5D 실사 3D 홀로그램</span>
                        <span style="color: #ea580c;">PHOTO ${{currentPhotoIndex + 1}} / ${{col.photos.length}}</span>
                    </div>

                    <div class="highlight-card highlight-antique">
                        <strong>${{col.flag}} ${{col.title_ko}}</strong><br>
                        ${{col.desc}}
                    </div>

                    <div class="spec-grid">
                        <div class="spec-box">
                            <div class="label">선택된 각도</div>
                            <div class="val" style="font-size: 11px;">${{photo.tag}}</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">제작 국가</div>
                            <div class="val" style="font-size: 11px;">${{col.origin}}</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">작품 연대</div>
                            <div class="val" style="font-size: 11px;">${{col.era}}</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">도자기 재질</div>
                            <div class="val" style="font-size: 10px;">${{col.material}}</div>
                        </div>
                    </div>

                    <div class="section-title">
                        <span>🎛️ 2.5D 홀로그램 파라미터 조절</span>
                    </div>

                    <div class="control-group">
                        <div class="control-label-row">
                            <span>3D 뎁스 돌출 강도 (Depth Extrusion)</span>
                            <span id="val-depth">${{depthStrength.toFixed(2)}}x</span>
                        </div>
                        <input type="range" class="slider-input" min="0.0" max="3.0" step="0.05" value="${{depthStrength}}" oninput="onDepthChange(this.value)">
                    </div>

                    <div class="control-group">
                        <div class="control-label-row">
                            <span>포슬린 유약/골드 광택 (Porcelain Sheen)</span>
                            <span id="val-sheen">${{specularSheen.toFixed(1)}}x</span>
                        </div>
                        <input type="range" class="slider-input" min="0.0" max="2.5" step="0.1" value="${{specularSheen}}" oninput="onSheenChange(this.value)">
                    </div>

                    <div class="control-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11.5px; font-weight: 700;">자이로 3D 호흡 회전 (Auto Gyro)</span>
                        <input type="checkbox" ${{autoBreathe ? 'checked' : ''}} onchange="autoBreathe = this.checked;" style="width: 18px; height: 18px; accent-color: #ea580c;">
                    </div>

                    <div class="section-title">
                        <span>🔍 앵글별 고증 디테일 설명</span>
                    </div>

                    <div class="feature-card">
                        <div class="feature-title">📌 ${{photo.name}} (${{photo.tag}})</div>
                        <div class="feature-desc">${{photo.desc}}</div>
                    </div>
                `;
            }} else if (currentTab === 'antique_3d') {{
                panel.innerHTML = `
                    <div class="section-title">
                        <span>📦 로얄둘튼 3D 폴리곤 메시</span>
                        <span style="color: #b45309;">GLTF 2.0 PBR</span>
                    </div>
                    <div class="highlight-card highlight-antique">
                        <strong>Blender 4.2 LTS 4K 베이크 메시</strong><br>
                        연속 매니폴드 곡면 웰딩 및 전방위 포토그래메트리 4096×4096 텍스처 아틀라스가 베이킹된 3D 모델입니다.
                    </div>
                    <div class="spec-grid">
                        <div class="spec-box">
                            <div class="label">모델 규격</div>
                            <div class="val">19.5 cm (1:1)</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">텍스처 해상도</div>
                            <div class="val">4096 × 4096</div>
                        </div>
                    </div>
                `;
            }} else if (currentTab === 'prugio') {{
                panel.innerHTML = `
                    <div class="section-title">
                        <span>🏢 위례 푸르지오 37평 3D 도면</span>
                        <span style="color: #006654;">94A TPYE</span>
                    </div>
                    <div class="highlight-card highlight-prugio">
                        <strong>위례센트럴푸르지오 37평 (전용 94㎡)</strong><br>
                        남향 4-Bay 판상형 구조로, 거실, 주방, 안방(드레스룸/부부욕실), 침실 2개, 알파룸, 공용욕실이 실측 비율로 완벽 배치되어 있습니다.
                    </div>
                    <div class="spec-grid">
                        <div class="spec-box">
                            <div class="label">공급 면적</div>
                            <div class="val">124.6 ㎡ (37평)</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">전용 면적</div>
                            <div class="val">94.8 ㎡ (28.7평)</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">구조 타입</div>
                            <div class="val">4-Bay 맞통풍</div>
                        </div>
                        <div class="spec-box">
                            <div class="label">방 / 욕실</div>
                            <div class="val">방 4 / 욕실 2</div>
                        </div>
                    </div>
                `;
            }}
        }}

        function onDepthChange(val) {{
            depthStrength = parseFloat(val);
            document.getElementById('val-depth').innerText = `${{depthStrength.toFixed(2)}}x`;
            if (holoMaterial) {{
                holoMaterial.uniforms.uDepthStrength.value = depthStrength * 0.25;
            }}
        }}

        function onSheenChange(val) {{
            specularSheen = parseFloat(val);
            document.getElementById('val-sheen').innerText = `${{specularSheen.toFixed(1)}}x`;
            if (holoMaterial) {{
                holoMaterial.uniforms.uSpecularSheen.value = specularSheen;
            }}
        }}

        function setLightingPreset(preset) {{
            document.querySelectorAll('#bottom-prugio-bar .ctrl-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(`light-${{preset}}`).classList.add('active');

            if (preset === 'studio') {{
                dirLight.color.setHex(0xffffff);
                dirLight.intensity = 1.2;
                ambientLight.intensity = 0.8;
            }} else if (preset === 'warm') {{
                dirLight.color.setHex(0xffecc2);
                dirLight.intensity = 1.4;
                ambientLight.intensity = 0.6;
            }} else if (preset === 'rim') {{
                dirLight.color.setHex(0xcbe5ff);
                dirLight.intensity = 1.8;
                ambientLight.intensity = 0.4;
            }}
        }}

        function resetCurrentCamera() {{
            if (currentTab === 'prugio') {{
                new TWEEN.Tween(camera.position).to({{ x: 0, y: 14.0, z: 14.0 }}, 800).easing(TWEEN.Easing.Cubic.Out).start();
                controls.target.set(0, 0, 0);
            }} else if (currentTab === 'antique_3d') {{
                new TWEEN.Tween(camera.position).to({{ x: 0.35, y: 0.25, z: 1.8 }}, 800).easing(TWEEN.Easing.Cubic.Out).start();
                controls.target.set(0, 0, 0);
            }}
        }}

        /* === ANIMATION & RENDER LOOP === */
        let clock = new THREE.Clock();

        function animate() {{
            requestAnimationFrame(animate);
            TWEEN.update();

            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            if (currentTab === 'antique_25d' && holoMesh && holoMaterial) {{
                let effX = mouse.x;
                let effY = mouse.y;

                if (autoBreathe) {{
                    effX += Math.sin(time * 0.9) * 0.35;
                    effY += Math.cos(time * 1.2) * 0.20;
                }}

                holoMesh.rotation.y = effX * 0.22;
                holoMesh.rotation.x = -effY * 0.18;

                holoMaterial.uniforms.uMouseOffset.value.set(effX, effY);
                holoMaterial.uniforms.uLightPos.value.set(effX * 2.0, effY * 2.0 + 0.5, 2.0);
            }} else {{
                controls.update();
            }}

            renderer.render(scene, camera);
        }}

        /* === INIT === */
        window.addEventListener('resize', () => {{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }});

        create2DHoloMesh();
        animate();
    </script>
</body>
</html>
"""
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("index.html updated successfully with 6 antique collections!")

if __name__ == "__main__":
    update_index_html()
