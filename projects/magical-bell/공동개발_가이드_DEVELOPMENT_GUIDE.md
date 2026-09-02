# 🏴‍☠️ 원피스 RPG (Elemental Defense RPG) 공동 개발자 가이드

본 문서는 **원피스 RPG (One Piece MMORPG Open-World)** 프로젝트를 함께 개발하는 팀원 및 가족 개발자를 위한 **환경 구축, 아키텍처 가이드 및 빌드/배포 매뉴얼**입니다.

---

## 🚀 1. 1분 만에 개발 환경 구축하기

### 📋 필수 요구사항
- **Node.js**: v18.0 이상 권장 ([Node.js 공식 다운로드](https://nodejs.org/))
- **에디터**: VS Code, Antigravity IDE, Cursor 또는 WebStorm

### 💻 로컬 개발 서버 실행
```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 구동 (실시간 핫 리로드 지원)
npm run dev
```
- 브라우저에서 **`http://localhost:5173/`** 로 접속하면 즉시 게임이 실행되고, 소스코드를 수정하면 브라우저에 실시간 반영됩니다.

---

## 📁 2. 프로젝트 핵심 아키텍처 구조

```
magical-bell/
├── src/                          # 3D 게임 및 RPG 핵심 소스코드
│   ├── animation/                # 캐릭터 이동 및 스켈레탈 애니메이션 (CharacterController.js)
│   ├── characters/               # 8대 영웅 데이터 및 속성 정의 (ProceduralHeroFactory.js)
│   │                             # (흰수염, 검은수염, 아오키지, 키자루, 아카이누, 에이스, 에넬, 드래곤)
│   ├── config/                   # 전역 밸런스, 33대 스킬 수치, 조명 설정 (settings.js)
│   ├── core/                     # 메인 루프, 3D 카메라 리그, 멀티터치 제스처 (App.js, CameraRig.js)
│   ├── game/                     # 몬스터 스폰, 웨이브, 데미지 공식, 게임 매니저 (EnemyManager.js)
│   ├── rpg/                      # RPG 레벨업, 스탯 배분, 인벤토리, 퀘스트 (RPGPlayerData.js, QuestManager.js)
│   ├── spells/                   # 33대 악마의 열매 procedural VFX 스킬 엔진
│   ├── ui/                       # 모바일 4슬롯 조작계, 슬림 HUD, 캐릭터 선택창 (MobileControls.js, RPGHUD.js)
│   └── world/                    # 75km 초대형 대륙 지형, 프랙탈 셰이더, 랜드마크 (Ground.js, ProceduralWorldMap.js)
│
├── public/                       # 3D GLB 모델, 오디오 음원, KTX2 트랜스코더 에셋
│   ├── models/                   # 사원, 에테르 탑, 중세 가옥, 화산 산맥 3D 에셋
│   └── audio/                    # 배경음악, 레벨업, 타격 사운드
│
├── android/                      # Capacitor 기반 안드로이드 네이티브 앱 프로젝트 (Android Studio 연동)
│   └── app/src/main/             # AndroidManifest.xml (센서 가로모드 고정)
│
├── scripts/                      # Playwright 모바일 자동화 QA 및 캡처 스크립트
├── package.json                  # 프로젝트 의존성 설정
├── vite.config.js                # Vite 고속 번들러 빌드 설정
└── firebase.json                 # 글로벌 라이브 호스팅 배포 설정
```

---

## ⚡ 3. 주요 개발 및 수정 가이드

### 1) 새로운 영웅 / 스킬 추가 및 밸런스 수정
- **`src/characters/ProceduralHeroFactory.js`**: 새로운 영웅 ID, 이름, 아이콘, 칭호, 속성 및 4대 스킬 지정.
- **`src/config/settings.js`**: 스킬별 사거리(`range`), 쿨다운(`cooldown`), 데미지, 이펙트 색상 및 광원 반경 설정.

### 2) 모바일 조작계 및 UI 수정
- **`src/ui/MobileControls.js`**: `[Q]`, `[E]`, `[R]`, `[T]` 4개 스킬 슬롯 및 `[ATTACK]`, `[BLINK]`, `[AUTO]` 터치 버튼 로직.
- **`src/ui/styles.css`**: 반응형 모바일 HUD, 조이스틱 영역, 체력바 및 퀘스트 창 스타일.

### 3) 75km 월드 맵 & 랜드마크 수정
- **`src/world/Ground.js`**: 프랙탈 셰이더 기반 지형 색상 (에메랄드 잔디, 대리석 광장, 마그마, 심연).
- **`src/world/ProceduralWorldMap.js`**: 분수대, 풍차, 스톤헨지, 사원, 화산 기둥 등 랜드마크 배치.
- **`src/world/ProceduralFlora.js`**: 1,250그루 숲 군락, 화강암 바위, 가로등 인스턴싱 배치.

---

## 🌐 4. 실시간 웹 배포 및 APK 빌드

### 1) 글로벌 라이브 웹서버 원클릭 배포
```bash
# 프로덕션 번들 빌드 후 Firebase 호스팅 배포
npm run build
npx firebase-tools deploy --only hosting
```
- 배포 완료 시 **https://elemental-defense-rpg.web.app** 에 즉시 전 세계 실시간 반영됩니다.

### 2) 안드로이드 APK 스마트폰 앱 빌드
```bash
# 1. 웹 빌드 결과를 안드로이드 프로젝트로 동기화
npm run build
npx cap sync android

# 2. 안드로이드 APK 컴파일
.\android\gradlew.bat assembleDebug --project-dir android

# 생성된 APK 파일 위치:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🤝 5. 팀원 / 가족 공동 개발 팁
1. **Google Drive 백업 폴더**: 구글 드라이브의 `원피스_RPG_개발_소스코드_백업` 폴더에서 언제든지 최신 소스코드 ZIP을 내려받을 수 있습니다.
2. **코드 수정 후 공유**: 작업한 내용을 ZIP으로 압축하여 구글 드라이브에 올리거나, Git 저장소(GitHub)를 생성하여 `git push`로 브랜치를 관리하면 완벽하게 분업할 수 있습니다!
