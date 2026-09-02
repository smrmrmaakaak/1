import os
import sys
import glob
import librosa
import numpy as np
import json

sys.stdout.reconfigure(encoding='utf-8')

drive_path = r'G:\내 드라이브'
arirang_targets = {}

for root, dirs, files in os.walk(drive_path):
    for f in files:
        if '순수한 마음 아리랑' in f and f.lower().endswith(('.mp3', '.wav')):
            base_id = f.replace('.mp3', '').replace('.wav', '')
            full_p = os.path.join(root, f)
            sz = os.path.getsize(full_p) / (1024*1024)
            if base_id not in arirang_targets:
                arirang_targets[base_id] = []
            arirang_targets[base_id].append((full_p, sz, f))

print(f"Total Unique '순수한 마음 아리랑' Variations: {len(arirang_targets)}\n")

results = []

for base_id, file_list in arirang_targets.items():
    best_file = max(file_list, key=lambda x: x[1]) # Pick WAV if available
    file_path = best_file[0]
    
    try:
        dur = librosa.get_duration(path=file_path)
        y, sr = librosa.load(file_path, sr=22050, duration=min(dur, 120.0))
        
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        bpm = float(np.atleast_1d(tempo)[0])
        
        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(np.mean(rms))
        peak_rms = float(np.max(rms))
        dyn_range = peak_rms / max(0.001, mean_rms)
        
        centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)))
        
        y_harm, y_perc = librosa.effects.hpss(y)
        harm_energy = float(np.mean(y_harm**2))
        perc_energy = float(np.mean(y_perc**2))
        harm_ratio = harm_energy / max(0.0001, (harm_energy + perc_energy))
        
        # Style classification
        if bpm >= 135:
            style = "에너제틱 퓨전 락 / 팝 (빠른 템포)"
        elif bpm >= 105:
            style = "모던 퓨전 국악 미디엄 템포"
        else:
            style = "서정적 전통 애절 발라드 (느린 템포)"
            
        # Scoring based on vocal clarity, dynamic build, and musical fullness
        score = 60.0
        if dyn_range >= 2.0: score += 15.0
        elif dyn_range >= 1.6: score += 10.0
        else: score += 5.0
        
        if 2500 <= centroid <= 4500: score += 12.0 # Clear vocal presence
        else: score += 6.0
        
        if harm_ratio >= 0.55: score += 10.0
        else: score += 5.0
        
        if 150 <= dur <= 250: score += 8.0 # Standard full song length
        
        results.append({
            'id': base_id,
            'filename': best_file[2],
            'path': file_path,
            'duration': dur,
            'bpm': bpm,
            'mean_rms': mean_rms,
            'dyn_range': dyn_range,
            'centroid': centroid,
            'harm_ratio': harm_ratio,
            'style': style,
            'score': round(score, 1)
        })
        print(f"Analyzed: {base_id:<32} | Score: {score:4.1f} | BPM: {bpm:5.1f} | Dur: {dur:5.1f}s | {style}")
    except Exception as e:
        print(f"Error analyzing {base_id}: {e}")

results.sort(key=lambda x: x['score'], reverse=True)

with open(r'c:\Users\황태민\Documents\antigravity\charming-faraday\arirang_pure_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n=== TOP 5 BEST '순수한 마음 아리랑' VERSIONS ===")
for idx, r in enumerate(results[:5], 1):
    print(f"{idx:2d}위: [{r['score']}점] {r['id']} ({r['style']}) - {r['duration']//60:.0f}분 {r['duration']%60:.0f}초 | {r['bpm']:.1f} BPM | 다이내믹스: {r['dyn_range']:.2f}x")
