import os
import sys
import librosa
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

audio_path = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_paperplane_v2\audio.mp3'
y, sr = librosa.load(audio_path, sr=22050)

# Check onset envelope
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
times = librosa.times_like(onset_env, sr=sr)

test_points = [
    (24.0, 27.0, "골목 끝에"),
    (27.0, 30.0, "내 이름도"),
    (36.0, 38.5, "웃으며 말했지"),
    (41.0, 43.5, "작은 발로"),
    (57.0, 60.0, "날아가 종이비행기야"),
    (82.0, 85.0, "친구의 눈물"),
    (114.5, 117.5, "날아가 종이비행기야 (2절)"),
    (160.0, 163.0, "모든 별이"),
    (173.0, 176.0, "날아가 종이비행기야 (클라이맥스)")
]

for t_s, t_e, label in test_points:
    print(f"\n=== [{label}] ({t_s}s ~ {t_e}s) ===")
    for t in np.arange(t_s, t_e, 0.1):
        idx = np.argmin(np.abs(times - t))
        val = onset_env[idx]
        bar = '#' * int(min(40, val * 3))
        print(f"{t:5.2f}s | {val:5.2f} | {bar}")
