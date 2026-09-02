# ⚔️ Ultra UI Mastercraft (by smrmrmaakaak)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/smrmrmaakaak/1?style=social)](https://github.com/smrmrmaakaak/1)
[![Awwwards Ready](https://img.shields.io/badge/Design-Awwwards%20Level-38bdf8?style=flat-square)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Web)-10b981?style=flat-square)](#)

> **전 세계 어디에도 없던 최정상급 Awwwards급 & 중세 고전 앤틱 3D 인터랙티브 UI 컴포넌트 마스터 컬렉션.**  
> 순수 HTML, CSS, JavaScript (Three.js/Canvas) 기반으로 제작되어 어떤 프레임워크(React, Vue, Next.js, Svelte, Vanilla)에서도 **1초 만에 복사하여 즉시 작동**합니다.

---

## 🌟 시그니처 마스터 컴포넌트 6종 (Signature Mastercraft)

### 1. 👑 3D Grimoire Spellbook (고대 마도서 펼침)
- **특징**: 마우스 커서의 3차원 원근 좌표를 추적하여 부드럽게 틸트 회전하며, 표지를 열면 황금빛 연금술 룬 문자(⛧)가 입체 발광합니다.
- **적용 기술**: `transform-style: preserve-3d`, `perspective: 900px`, `Cinzel Webfont`, Dynamic Mouse Parallax Math.

### 2. 📜 Royal Wax Seal & Charter (황실 왁스 인장 해제)
- **특징**: 찢어진 고대 양피지 질감 위에 붉은색 황실 왁스 도장(♛)이 찍혀 있으며, 클릭 시 인장이 비틀어지며 황실 비밀 칙서가 공개됩니다.
- **적용 기술**: `Radial-gradient Blood Wax`, `Box-shadow Inset Parchment`, Interactive DOM State Toggle.

### 3. ⚡ 1px Laser Border & Bento Spotlight (Linear 스타일 서브픽셀 레이저)
- **특징**: Linear와 Vercel 스타일의 1픽셀 서브픽셀 보더 위로, 마우스 좌표를 실시간 추적하는 방사형 스포트라이트 광원이 부드럽게 감쌉니다.
- **적용 기술**: CSS Variable `--mouse-x/--mouse-y` 실시간 주입, `Radial-gradient Spotlight Mask`.

### 4. 🌌 Fluid Lens Ripple Canvas (실시간 유체 렌즈 왜곡)
- **특징**: 마우스가 지나간 궤적을 따라 실시간 액체 파동 굴절과 무지개 프리즘 광선이 일렁이는 가볍고 빠른 캔버스 셰이더입니다.
- **적용 기술**: HTML5 Canvas 2D / WebGL Alpha Decay Ring Particles, Ripple Physics.

### 5. 🔮 Apple Vision Pro Acrylic Glass & Dynamic Island (비전프로 아크릴 & 모핑 아일랜드)
- **특징**: 3D 굴절 테두리를 가진 반투명 아크릴 글래스모피즘과, 클릭 시 부드러운 스프링 물리로 음악 재생 위젯으로 확장되는 다이내믹 아일랜드.
- **적용 기술**: `backdrop-filter: blur(24px)`, `cubic-bezier(0.34, 1.56, 0.64, 1)` Spring Motion.

### 6. 🤖 Cyber Glitch & Decrypt Terminal (사이버펑크 해커 암호 해독)
- **특징**: 텍스트를 클릭하는 순간 0.025초 단위로 무작위 외계/해커 기호가 스크램블되며 실제 보안 토큰 문장으로 복원되는 디코딩 시퀀스.
- **적용 기술**: `Fira Code Font`, Matrix Random Character Generator Interval Timer.

---

## 🚀 빠른 시작 (Quick Start)

### 1. 로컬에서 즉시 실행
```bash
# 저장소 클론
git clone https://github.com/smrmrmaakaak/1.git
cd 1/projects/ultra-ui-mastercraft

# 웹 서버 구동
python -m http.server 5500
# 브라우저에서 http://localhost:5500 접속
```

### 2. 코드 즉시 복사하여 내 프로젝트에 넣기
- 웹 브라우저(`http://localhost:5500`)에서 원하는 컴포넌트 우측 상단의 **`[💻 코드 복사]`** 버튼을 클릭하면 HTML, CSS, JavaScript를 1초 만에 복사할 수 있습니다.

---

## 📁 프로젝트 파일 구조

```text
ultra-ui-mastercraft/
├── index.html            # 6대 시그니처 컴포넌트 실시간 쇼케이스 포털
├── README.md             # 프로젝트 공식 가이드 문서
├── css/
│   └── master.css        # 3D 원근, 네온 레이저, 중세 앤틱 골드 스타일 시트
└── js/
    └── components.js     # 3D 마우스 추적, 왁스 인장 물리, 유체 파동 캔버스 엔진
```

---

## 📜 라이선스 (License)

MIT License © 2026 smrmrmaakaak. 상업적 웹사이트, 포트폴리오, SaaS 서비스에 자유롭게 사용 및 수정이 가능합니다.
