import os
import sys
import subprocess
import asyncio
import edge_tts

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Paths
DRIVE_PHOTO_DIR = r"G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\작업사진\0809 부평 벨라고 사각싱크볼교체-작업난이도가 높고 까다로워 다른업체에서 못하는 것을 한 건~가 안맞아서 나무상판 앞쪽 30mm 미리 재단하는 위험하고 어려운 작업을 미리 한 후 싱크볼 설치"
ENDING_IMG = r"G:\.shortcut-targets-by-id\1tGWzznfKLoG4nxtdimQo4_XTmSV3ASDD\목수의 홈케어마스터-황태민작가-9276-4245\엔딩이미지\엔딩이미지1.png"
BGM_DIR = r"G:\내 드라이브\내_컴퓨터_보관함\음악\Suno_Music"
OUTPUT_DIR = r"G:\내 드라이브\영상"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "0809_부평_벨라고_사각싱크볼_3D마스터_최종본.mp4")
TEMP_DIR = os.path.abspath("temp_render_3d")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 2. Scene Definitions (Strictly using Google Drive photos from the folder)
SCENES = [
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010.jpg"),
        "text": "상판 폭이 좁아서 다른 업체들한테 전부 시공 불가 판정받았던 싱크대, 정말 포기해야 할까요?",
        "badge": "[타업체 시공 불가 판정]",
        "sub": "상판 폭이 좁아 다른 업체들이 모두 포기했던 주방!"
    },
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010_05.jpg"),
        "text": "낡고 좁아서 프라이팬 하나 안 들어가고 악취 나던 옛날 싱크볼을 조심스럽게 탈거하고,",
        "badge": "[노후 싱크볼 철거]",
        "sub": "기름때·악취 나던 낡은 싱크볼과 배관 탈거!"
    },
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010_10.jpg"),
        "text": "일반 업체는 상판 깨질까 봐 손도 못 대지만, 30년 목수의 손길로 상판 앞쪽 30밀리를 1밀리 오차 없이 정밀 절단합니다.",
        "badge": "[30년 목수 정밀 가공]",
        "sub": "플런지쏘로 상판 전면부 30mm 정밀 절단 (먼지 0%)"
    },
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010_15.jpg"),
        "text": "여기에 최고급 벨라고 대형 사각 싱크볼을 빈틈없이 완벽 밀착 안착시키고,",
        "badge": "[벨라고 사각싱크볼 안착]",
        "sub": "대형 사각싱크볼 언더 매립 & 항균 바이오 실리콘 밀착"
    },
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010_18.jpg"),
        "text": "고급 무광 거위목 수전과 악취 차단 배수구까지 연결해 누수 제로 통수 검수 완료!",
        "badge": "[무광 거위목 수전 & 누수 검수]",
        "sub": "올스텐 배수구 & 폭포수 거위목 수전 누수 제로 검수"
    },
    {
        "img": os.path.join(DRIVE_PHOTO_DIR, "KakaoTalk_20260814_082220010_23.jpg"),
        "text": "단 2시간 만에 신축 호텔 주방 완성! 우리 집도 가능할까 궁금하시다면 지금 사진 한 장만 보내주세요. 10분 안에 견적을 드립니다!",
        "badge": "[신축 호텔 주방 완성]",
        "sub": "단 2시간 만에 신축 호텔 주방으로 대변신!"
    },
    {
        "img": ENDING_IMG,
        "text": "목수의 홈케어마스터 조인형 대표 직통 010-9276-4245로 지금 바로 문의주세요!",
        "badge": "[실시간 사진 견적 문의]",
        "sub": "조인형 대표 직통 010-9276-4245 (문자/전화)"
    }
]

# 3. Generate Audio with edge-tts
async def generate_audios():
    print("[1] Generating Neural Voiceover Audios with edge-tts...")
    voice = "ko-KR-HyunsuMultilingualNeural"
    for i, sc in enumerate(SCENES):
        audio_path = os.path.join(TEMP_DIR, f"tts_{i}.mp3")
        communicate = edge_tts.Communicate(sc["text"], voice, rate="+16%", pitch="+1Hz")
        await communicate.save(audio_path)
        sc["audio"] = audio_path
        
        cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", audio_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        dur = float(res.stdout.strip())
        sc["audio_dur"] = dur
        sc["dur"] = max(dur + 0.8, 3.5) if i < len(SCENES)-1 else max(dur + 2.0, 5.0)
        print(f"  Scene {i+1}: Audio {dur:.2f}s -> Scene Dur {sc['dur']:.2f}s | Image: {os.path.basename(sc['img'])}")

# 4. Render Scene Clips with Ambient Blur & 2-tone badge subtitles
def render_scene_clips():
    print("\n[2] Rendering 3D Perspective & Ambient Blur Video Clips...")
    for i, sc in enumerate(SCENES):
        clip_path = os.path.join(TEMP_DIR, f"clip_{i}.mp4")
        sc["clip"] = clip_path
        dur = sc["dur"]
        
        # Subtitle ASS file for perfect typography without font issues
        ass_path = os.path.join(TEMP_DIR, f"sub_{i}.ass")
        with open(ass_path, "w", encoding="utf-8") as af:
            af.write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BadgeStyle,Malgun Gothic,44,&H0047E0FD,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,240,1
Style: SubStyle,Malgun Gothic,38,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:01:00.00,BadgeStyle,,0,0,0,,{sc['badge']}
Dialogue: 0,0:00:00.00,0:01:00.00,SubStyle,,0,0,0,,{sc['sub']}
""")
        
        ass_filter_path = ass_path.replace("\\", "/").replace(":", "\\:")
        
        # Background: Boxblur 1080x1920
        # Foreground: 1040x1400 centered with padding
        filter_complex = (
            f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.25[bg];"
            f"[0:v]scale=1040:1400:force_original_aspect_ratio=decrease,pad=1080:1450:(1080-iw)/2:(1450-ih)/2:color=0x00000000[fg];"
            f"[bg][fg]overlay=0:120[comp];"
            f"[comp]ass='{ass_filter_path}'[v]"
        )
        
        cmd = [
            "ffmpeg", "-y", "-loop", "1", "-i", sc["img"],
            "-i", sc["audio"],
            "-filter_complex", filter_complex,
            "-map", "[v]", "-map", "1:a",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18", "-pix_fmt", "yuv420p",
            "-t", str(dur),
            clip_path
        ]
        
        res = subprocess.run(cmd, capture_output=True, text=False)
        if res.returncode != 0:
            print(f"Error rendering clip {i}")
        else:
            print(f"  Rendered clip_{i}.mp4 ({dur:.1f}s)")

# 5. Concatenate with Transitions & BGM
def concatenate_and_finalize():
    print("\n[3] Concatenating with Transitions & Suno Background Music...")
    
    bgm_files = [os.path.join(BGM_DIR, f) for f in os.listdir(BGM_DIR) if f.endswith('.mp3')]
    bgm_file = bgm_files[0] if bgm_files else ""
    print(f"  Selected Suno BGM: {os.path.basename(bgm_file)}")
    
    concat_list_path = os.path.join(TEMP_DIR, "concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for sc in SCENES:
            clip_name = sc["clip"].replace("\\", "/")
            f.write(f"file '{clip_name}'\n")
            
    concat_temp = os.path.join(TEMP_DIR, "concat_temp.mp4")
    cmd_concat = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-c", "copy", concat_temp
    ]
    subprocess.run(cmd_concat, capture_output=True)
    
    total_dur = sum(sc["dur"] for sc in SCENES)
    print(f"  Total Video Duration: {total_dur:.2f}s")
    
    filter_final = (
        f"[0:v]drawbox=x=0:y=0:w='min(1080, 1080*(t/{total_dur}))':h=14:color=0xF59E0B@1:t=fill[v_bar];"
        f"[1:a]volume=0.16[bgm_low];"
        f"[0:a][bgm_low]amix=inputs=2:duration=first:dropout_transition=2[a]"
    )
    
    cmd_final = [
        "ffmpeg", "-y",
        "-i", concat_temp,
        "-stream_loop", "-1", "-i", bgm_file,
        "-filter_complex", filter_final,
        "-map", "[v_bar]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-t", str(total_dur),
        OUTPUT_FILE
    ]
    
    res = subprocess.run(cmd_final, capture_output=True, text=False)
    if res.returncode == 0:
        size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
        print(f"\n🎉 [SUCCESS] Master 3D Short-Form Video Created Successfully!")
        print(f"  Saved File: {OUTPUT_FILE} ({size_mb:.1f} MB)")
    else:
        print("Final render error in concat step")

async def main():
    await generate_audios()
    render_scene_clips()
    concatenate_and_finalize()

asyncio.run(main())
