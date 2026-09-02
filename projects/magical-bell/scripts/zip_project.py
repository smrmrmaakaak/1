import os
import shutil
import zipfile

src_dir = r"c:\Users\황태민\Documents\antigravity\magical-bell"
desktop_zip = r"C:\Users\황태민\Desktop\원피스_RPG_개발_소스코드_v1.0.zip"
desktop_zip_en = r"C:\Users\황태민\Desktop\OnePiece_RPG_Project_v1.0.zip"
gdrive_zip = r"G:\내 드라이브\원피스_RPG_개발_소스코드_v1.0.zip"
gdrive_zip_en = r"G:\내 드라이브\OnePiece_RPG_Project_v1.0.zip"

staging_dir = os.path.join(os.environ.get("TEMP", r"C:\Temp"), "OnePiece_RPG_Export")
if os.path.exists(staging_dir):
    shutil.rmtree(staging_dir, ignore_errors=True)
os.makedirs(staging_dir, exist_ok=True)

# Copy src, public, scripts
for folder in ["src", "public", "scripts"]:
    src_f = os.path.join(src_dir, folder)
    if os.path.exists(src_f):
        shutil.copytree(src_f, os.path.join(staging_dir, folder))

# Copy android excluding build and .gradle
android_src = os.path.join(src_dir, "android")
android_dst = os.path.join(staging_dir, "android")
def ignore_build(src, names):
    ignored = []
    if "build" in names:
        ignored.append("build")
    if ".gradle" in names:
        ignored.append(".gradle")
    return ignored

shutil.copytree(android_src, android_dst, ignore=ignore_build)

# Copy root configs
root_files = [
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "index.html",
    "capacitor.config.json",
    "firebase.json",
    ".firebaserc"
]
for f in root_files:
    src_path = os.path.join(src_dir, f)
    if os.path.exists(src_path):
        shutil.copy2(src_path, os.path.join(staging_dir, f))

# Add README
readme_content = """# 🏴‍☠️ 원피스 RPG (One Piece RPG) 전체 개발 프로젝트

실시간 멀티플레이어 3D 원피스 MMORPG 게임 프로젝트입니다.
모든 유저는 단일 기본 캐릭터(신입 모험가 · 무능력자)로 시작하여 마우스 좌클릭 3단 물리 평타 공격을 구사하며, 인게임에서 악마의 열매를 복용하여 4대 전설 스킬을 각성하는 시스템입니다.

---

## 🚀 빠른 시작 (개발 환경 세팅)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
- 브라우저에서 `http://localhost:5173` 으로 접속하여 즉시 플레이 및 실시간 핫리로드 개발이 가능합니다.

### 3. 웹 빌드 & 배포
```bash
npm run build
```

---

## 📱 안드로이드 APK 빌드 (모바일 앱)

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
- 컴파일된 APK 위치: `android/app/build/outputs/apk/debug/app-debug.apk`
"""
with open(os.path.join(staging_dir, "README.md"), "w", encoding="utf-8") as rf:
    rf.write(readme_content)
with open(os.path.join(staging_dir, "개발가이드_시작하기.md"), "w", encoding="utf-8") as rf:
    rf.write(readme_content)

# Zip
print("Compressing to zip...")
if os.path.exists(desktop_zip):
    os.remove(desktop_zip)

with zipfile.ZipFile(desktop_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(staging_dir):
        for file in files:
            full_p = os.path.join(root, file)
            rel_p = os.path.relpath(full_p, staging_dir)
            zipf.write(full_p, rel_p)

shutil.copy2(desktop_zip, desktop_zip_en)

if os.path.exists(r"G:\내 드라이브"):
    shutil.copy2(desktop_zip, gdrive_zip)
    shutil.copy2(desktop_zip, gdrive_zip_en)
    print("Copied to Google Drive successfully!")

shutil.rmtree(staging_dir, ignore_errors=True)
print("ZIP CREATION COMPLETED SUCCESSFULLY:", desktop_zip)
