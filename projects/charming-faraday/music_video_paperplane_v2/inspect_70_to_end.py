import os
import sys
import librosa
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')

audio_path = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_paperplane_v2\audio.mp3'
y, sr = librosa.load(audio_path, sr=22050)
dur = len(y) / sr

chunk_dir = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_paperplane_v2\debug_chunks'
os.makedirs(chunk_dir, exist_ok=True)

model = WhisperModel('large-v3', device='cpu', compute_type='int8')

print("=== 1초 단위 보컬 전수 검사 (70초 ~ 215초) ===")
for sec in range(70, int(dur) - 8):
    chunk = y[int(sec*sr):int((sec+1)*sr)]
    c_path = os.path.join(chunk_dir, f'sec_{sec:02d}.wav')
    sf.write(c_path, chunk, sr)
    segs, _ = model.transcribe(c_path, language='ko', beam_size=5)
    t = ' '.join([s.text for s in segs]).strip()
    if t and not any(skip in t for skip in ["감사합니다", "고맙습니다", "다음 영상", "한글자막"]):
        print(f"[{sec:03d}.0s ~ {sec+1:03d}.0s]: \"{t}\"")
    if os.path.exists(c_path):
        os.remove(c_path)
