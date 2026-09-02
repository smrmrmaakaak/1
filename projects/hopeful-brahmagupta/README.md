# 🚀 Ox Alpha Agent Studio (Antigravity-Style Local Web Agent)

화제의 스텔스 AI 추론 모델 **`Ox Alpha` (`stealth/ox-alpha`)**를 백엔드로 연동하여, **Antigravity나 Cursor처럼 로컬 작업 공간에서 자율적으로 파일 읽기/쓰기/수정 및 터미널 명령어를 실행하는 로컬 웹 에이전트 환경**입니다.

---

## ✨ 핵심 기능

1. **ReAct 에이전트 자율 루프 (Local Tools)**
   - `read_file`: 프로젝트 내 파일 읽기 및 분석
   - `write_file`: 새 파일 생성 및 스크립트 작성
   - `replace_file_content`: 파일 내 특정 코드 블록 정밀 치환 및 리팩토링
   - `list_dir`: 디렉토리 구조 및 파일 목록 탐색
   - `search_code`: 코드베이스 내 키워드 및 정규식 검색
   - `run_command`: 터미널 쉘 명령어(PowerShell/CMD) 실행 및 결과 확인
2. **비용 및 토큰 독립성**
   - OpenRouter API를 통해 직접 통신하므로 Antigravity 토큰 소모 0%
3. **고감도 다크 테마 웹 UI**
   - 실시간 SSE 스트리밍 & 사고(Thinking) 과정 시각화
   - 접이식 도구 실행 카드 (실행된 명령어, 파일 수정 로그, 결과 뷰어)
   - 코드 하이라이팅 및 원클릭 복사 버튼
   - OpenRouter API 키 브라우저 로컬 안전 저장

---

## 🏃 실행 방법

### 방법 1. 원클릭 실행 (추천)
* `run.bat` 파일을 더블클릭합니다.
* 자동으로 브라우저(`http://localhost:8000`)가 열립니다.

### 방법 2. 터미널에서 실행
```bash
python start.py
```

---

## 🔑 첫 사용 설정

1. 브라우저가 열리면 우측 상단의 **[API Key 설정]** 버튼을 클릭합니다.
2. [OpenRouter](https://openrouter.ai/keys)에서 발급받은 API 키(`sk-or-v1-...`)를 입력하고 저장합니다.
3. 모델 선택에서 **`stealth/ox-alpha (Free / 1M Context)`**를 선택하고 바로 작업을 지시해보세요!
