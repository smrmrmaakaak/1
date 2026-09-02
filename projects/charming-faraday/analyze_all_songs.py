import os
import sys
import glob
import librosa
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

# Target 1: Main Vocal Songs in G:\내 드라이브\노래
vocal_dir = r'G:\내 드라이브\노래'
# Target 2: OST / Instrumental Tracks in 디노\노래\노래
ost_dir = r'G:\내 드라이브\일단 그냥 싹다 백업\모든잡파일\로블록스 게임들\디노\노래\노래'

all_targets = []

if os.path.exists(vocal_dir):
    for f in os.listdir(vocal_dir):
        if f.lower().endswith(('.mp3', '.wav', '.flac', '.m4a')) and not f.startswith('종이비행기 항해 (리믹스) (2)') and not f.startswith('종이비행기 항해 (리믹스) (3)'):
            all_targets.append(('Vocal Track', os.path.join(vocal_dir, f), f))

if os.path.exists(ost_dir):
    # Select unique best OST files (exclude duplicate '(1)' copies)
    for f in os.listdir(ost_dir):
        if f.lower().endswith(('.mp3', '.wav')) and not '(1)' in f and not '- 복사본' in f:
            all_targets.append(('OST/BGM Track', os.path.join(ost_dir, f), f))

print(f"Total Targets to Analyze: {len(all_targets)} tracks\n")

results = []

for category, file_path, name in all_targets:
    try:
        # Load 90 seconds for fast and accurate musical analysis
        y, sr = librosa.load(file_path, sr=22050, duration=120.0)
        dur = librosa.get_duration(path=file_path)
        
        # 1. BPM & Tempo
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(np.atleast_1d(tempo)[0])
        
        # 2. RMS Energy & Dynamics
        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(np.mean(rms))
        peak_rms = float(np.max(rms))
        dyn_range = peak_rms / max(0.001, mean_rms)
        
        # 3. Spectral Centroid (Brightness) & Roll-off
        centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
        
        # 4. Harmonics vs Percussion (Melody richness)
        y_harm, y_perc = librosa.effects.hpss(y)
        harm_energy = float(np.mean(y_harm**2))
        perc_energy = float(np.mean(y_perc**2))
        harm_ratio = harm_energy / max(0.0001, (harm_energy + perc_energy))
        
        # 5. Chroma / Harmonic Complexity
        chroma = librosa.feature.chroma_stft(y=y_harm, sr=sr)
        chroma_std = float(np.mean(np.std(chroma, axis=1)))
        
        # Comprehensive Scoring Model (0 ~ 100)
        # Higher dynamics, richer harmony, clean frequency spectrum, stable groove
        score = 50.0
        # Dynamic build bonus
        if dyn_range >= 1.8: score += 15.0
        elif dyn_range >= 1.5: score += 10.0
        else: score += 5.0
        
        # Brightness & Clarity bonus (2000Hz ~ 4500Hz sweet spot)
        if 2200 <= centroid <= 4800: score += 15.0
        else: score += 8.0
        
        # Harmonic richness bonus
        if harm_ratio >= 0.55: score += 12.0
        else: score += 7.0
        
        # Chroma richness
        score += min(10.0, chroma_std * 40.0)
        
        # Duration sweet spot (2m ~ 5m)
        if 120 <= dur <= 300: score += 8.0
        
        results.append({
            'name': name,
            'category': category,
            'path': file_path,
            'duration': dur,
            'bpm': bpm,
            'mean_rms': mean_rms,
            'dyn_range': dyn_range,
            'centroid': centroid,
            'harm_ratio': harm_ratio,
            'score': round(score, 1)
        })
        print(f"Analyzed: {name[:30]:<30} | Score: {score:4.1f} | BPM: {bpm:5.1f} | Dur: {dur:5.1f}s")
    except Exception as e:
        print(f"Error analyzing {name}: {e}")

# Sort by score descending
results.sort(key=lambda x: x['score'], reverse=True)

import json
with open(r'c:\Users\황태민\Documents\antigravity\charming-faraday\all_songs_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n=== TOP 10 BEST SONGS IN GOOGLE DRIVE ===")
for idx, r in enumerate(results[:10], 1):
    print(f"{idx:2d}위: [{r['score']}점] {r['name']} ({r['category']}) - {r['duration']//60:.0f}분 {r['duration']%60:.0f}초 | {r['bpm']:.1f} BPM")
