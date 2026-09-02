import os
import sys
import json
import shutil

sys.stdout.reconfigure(encoding='utf-8')

curator_dir = r'c:\Users\황태민\Documents\antigravity\charming-faraday\google_drive_music_curator'
audio_dir = os.path.join(curator_dir, 'audio')

arirang_top = [
    {
        'name': '순수한 마음 아리랑 (Futuristic Anthem Mix)',
        'category': 'Vocal Track',
        'src': r'G:\내 드라이브\내_컴퓨터_보관함\음악\Suno_Music_WAV\[2026-07-20] 순수한 마음 아리랑 (Futuristic Anthem Mix)_090e6b7b.wav',
        'dest': 'arirang_futuristic_anthem.wav',
        'bpm': 143.6,
        'duration': 247.0,
        'dyn_range': 2.31,
        'harm_ratio': 0.68,
        'score': 105.0,
        'desc': '웅장한 미래지향 앤섬 믹스 (화려한 오케스트라 & 합창 피날레)'
    },
    {
        'name': '순수한 마음 아리랑 (정석 퓨전 락 완곡)',
        'category': 'Vocal Track',
        'src': r'G:\내 드라이브\노래\순수한 마음 아리랑.wav',
        'dest': 'arirang_standard_pure.wav',
        'bpm': 143.6,
        'duration': 209.8,
        'dyn_range': 1.98,
        'harm_ratio': 0.72,
        'score': 104.0,
        'desc': '가장 또렷한 보컬 딕션 & 깔끔한 국악 팝/락 밸런스'
    },
    {
        'name': '순수한 마음 아리랑 (감성 오케스트라 서사 믹스)',
        'category': 'Vocal Track',
        'src': r'G:\내 드라이브\내_컴퓨터_보관함\음악\Suno_Music_WAV\순수한 마음 아리랑_f376af5e.wav',
        'dest': 'arirang_emotional_epic.wav',
        'bpm': 143.6,
        'duration': 244.9,
        'dyn_range': 2.15,
        'harm_ratio': 0.65,
        'score': 103.5,
        'desc': '서정적인 피아노 도입부에서 웅장하게 터지는 드라마틱 발라드'
    }
]

with open(os.path.join(curator_dir, 'curated_songs.json'), 'r', encoding='utf-8') as f:
    existing = json.load(f)

new_list = []
for a in arirang_top:
    dest_path = os.path.join(audio_dir, a['dest'])
    if os.path.exists(a['src']) and not os.path.exists(dest_path):
        try:
            shutil.copy2(a['src'], dest_path)
        except Exception as e:
            print('Copy error:', e)
    a['path'] = a['src']
    a['web_audio_path'] = 'audio/' + a['dest']
    new_list.append(a)

for e in existing:
    if '순수한 마음' not in e['name']:
        new_list.append(e)

with open(os.path.join(curator_dir, 'curated_songs.json'), 'w', encoding='utf-8') as f:
    json.dump(new_list, f, ensure_ascii=False, indent=2)

print('Added Top 3 Arirang versions to the Web Player!')
