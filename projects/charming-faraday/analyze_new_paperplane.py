import os
import sys
import librosa
import numpy as np
from mutagen.mp3 import MP3

sys.stdout.reconfigure(encoding='utf-8')

tracks = [
    ('Track 2', r'G:\내 드라이브\노래\종이비행기 항해 (리믹스) (2).mp3'),
    ('Track 3', r'G:\내 드라이브\노래\종이비행기 항해 (리믹스) (3).mp3'),
    ('Track 4', r'G:\내 드라이브\노래\종이비행기 항해 (리믹스) (4).mp3')
]

results = []

for label, path in tracks:
    audio = MP3(path)
    dur = audio.info.length
    bitrate = audio.info.bitrate // 1000
    
    y, sr = librosa.load(path, sr=22050)
    
    # Tempo / BPM
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, np.ndarray):
        tempo = tempo[0]
        
    # RMS Energy & Dynamic Range
    rms = librosa.feature.rms(y=y)[0]
    rms_mean = np.mean(rms)
    rms_peak = np.max(rms)
    dynamic_ratio = rms_peak / (rms_mean + 1e-6)
    
    # Spectral Centroid (Brightness/Clarity)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    brightness = np.mean(centroid)
    
    # Spectral Rolloff (High-end presence)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    high_end = np.mean(rolloff)
    
    # Vocal clarity estimation (energy in 1kHz ~ 4kHz band)
    S = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    vocal_band = (freqs >= 1000) & (freqs <= 4000)
    vocal_energy = np.mean(S[vocal_band, :])
    
    # Bass presence (< 250Hz)
    bass_band = (freqs >= 20) & (freqs <= 250)
    bass_energy = np.mean(S[bass_band, :])
    
    results.append({
        'label': label,
        'filename': os.path.basename(path),
        'duration': dur,
        'bitrate': bitrate,
        'bpm': float(tempo),
        'rms_mean': float(rms_mean),
        'rms_peak': float(rms_peak),
        'dynamic_ratio': float(dynamic_ratio),
        'brightness': float(brightness),
        'high_end': float(high_end),
        'vocal_energy': float(vocal_energy),
        'bass_energy': float(bass_energy)
    })

print('=== 신규 종이비행기 리믹스 3개 트랙 정밀 분석 결과 ===')
for r in results:
    m = int(r['duration'] // 60)
    s = r['duration'] % 60
    print(f"\n--- [{r['label']}] {r['filename']} ---")
    print(f"- 재생 시간: {m}분 {s:.2f}초 ({r['duration']:.2f}초)")
    print(f"- 템포 (BPM): {r['bpm']:.1f} BPM")
    print(f"- 음압 (RMS 평균 / 피크): {r['rms_mean']:.4f} / {r['rms_peak']:.4f}")
    print(f"- 다이내믹 레인지 비율: {r['dynamic_ratio']:.2f}")
    print(f"- 보컬 대역 선명도: {r['vocal_energy']:.2f}")
    print(f"- 저음 펀치감 (Bass): {r['bass_energy']:.2f}")
    print(f"- 사운드 밝기 (Spectral Centroid): {r['brightness']:.1f} Hz")
