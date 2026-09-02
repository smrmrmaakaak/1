import os
import sys
import json
import re
import time
import requests
import shutil

sys.stdout.reconfigure(encoding='utf-8')

TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InN1bm8tYXBpLXJzMjU2LWtleS0xIiwidHlwIjoiSldUIiwieC1hYmx5LXRva2VuIjoibnYzNlZ3LkkwSWJuSlBHeHVyX015ZmRDLWg0UHE1N0I4R2xIM0pnTmFWcFJnb1RfZFRsUEpHc2ptdDJicVd4UldaLWJobzBxRGJUWmRISDh0aU9tRVFGWlhsQ0JaSWNuNTF3VTctRDFoMHBPZFlMUXA4M0lIQTltelVSU01SY2k5VzJHcHNGYkNwTFh1ZzV2d3k1Y2gtWmlZMW5MRy1OTy02c2trd1Y3MjcyMklMa3VKRUNuZ2JjWUM1TmxWZXdWdURMR2JTa3NnQTlXQ1lkaDRhQTZrR182RndYRFkwV0RaZXN5Wmw5QTBXdk56NElKenZnIn0.eyJzdW5vLmNvbS9jbGFpbXMvdXNlcl9pZCI6IjE5YWI3MjkzLWYxZDctNDQ0Yy04ZmQxLTdlMzExN2U2ZmIyZSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJ4R3FFVmpGWUtpcVRFQmkzaDZqZUdUUzhBUiIsInN1bm8uY29tL2NsYWltcy90b2tlbl90eXBlIjoiYWNjZXNzIiwic3Vuby9kaWQiOjYwMDEwOTczLCJleHAiOjE3ODc4ODM4NzMsImF1ZCI6InN1bm8tYXBpIiwic3ViIjoidXNlcl8yeEdxRVZqRllLaXFURUJpM2g2amVHVFM4QVIiLCJhenAiOiJodHRwczovL3N1bm8uY29tIiwiZnZhIjpbMCwtMV0sImlhdCI6MTc4Nzg4MDI3MywiaXNzIjoiaHR0cHM6Ly9hdXRoLnN1bm8uY29tIiwiaml0IjoiMWIyNGM4ZjQtN2QwMS00MzE1LWEzZDgtZDgyYmNkMzI2OTY4IiwicGxhbiI6IjNlYWViZWYzLWVmNDYtNDQ2YS05MzFjLTNkNTBjZDE1MTRmMTptb250aDoiLCJzdW5vL2pvaW5lZCI6MTc0NzU3NDY0Nywic2lkIjoic2Vzc2lvbl8zOTY0Zjc4MDU5YWU0ZWIxN2U2NGU5Iiwic3Vuby5jb20vY2xhaW1zL2VtYWlsIjoiZGtxandsNzc3QGdtYWlsLmNvbSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvZW1haWwiOiJka3Fqd2w3NzdAZ21haWwuY29tIiwic3Vuby9oYW5kbGUiOiJka3Fqd2w3NzciLCJzdW5vL3VzZXJfaWQiOiI5MDE0ODQ5MyIsInN1bm8vdXNlcm5hbWUiOiJka3Fqd2w3NzdAZ21haWwuY29tIn0.i23RukuEAyQFr4e8SWFPbZfKvNVItPNsqqmEXJsoMbxnSbyKPA57CrtS8FR9D-Vsn7vYwmTftPVRtLnMQ2VLolEbaoZJPLzAprJboVGfgXighG_EEhGPNHUaMpQy5wFw7Y0rTuel4gdPLw2kjEj9l98-OGytqRvIk89xySu3r-ietZYsbznefHoKxp9Yhej7zYresXo9MpYdpyfXKdP1wnQo4RAk6BvRDAu3nTopTCYkaGGJHoBxpYl3edWvkvO8rDmcTaokotXtzeCRvca6c41NWaTPhjTGVUp3gz3srgFa-onraprH6FfYFIfxiwitn43vOD81stnNaT4qKrIRZw'

GDRIVE_ROOT = r'G:\내 드라이브\내_컴퓨터_보관함\음악'
GDRIVE_GENRE_ROOT = os.path.join(GDRIVE_ROOT, 'Suno_장르별_정리')
GDRIVE_PLAYLIST_NEW = os.path.join(GDRIVE_ROOT, 'Suno_플레이리스트_분류', '새노래')
GDRIVE_ALL_WAV = os.path.join(GDRIVE_ROOT, 'Suno_Music_WAV')
GDRIVE_ALL_MP3 = os.path.join(GDRIVE_ROOT, 'Suno_Music_MP3')

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Referer': 'https://suno.com/'
}

GENRE_MAP = [
    ('01_CCM_찬양_복음', ['찬양', '복음', '기도', '예수', '하나님', '주님', 'ccm', 'worship', 'gospel', 'hymn', 'church']),
    ('02_트로트_성인가요', ['트로트', '뽕짝', '막걸리', '야시장', '고향', '어머니', '장터', 'trot', 'enka']),
    ('03_국악_한국전통_아리랑', ['아리랑', '국악', '매화', '새벽', '지리산', '한옥', '전통', 'korean traditional', 'pansori', 'minyo', 'gayageum', 'haegeum', 'daegeum']),
    ('04_동양풍_오리엔탈_중국무협', ['무협', '동양', '황제', '풍운', 'oriental', 'chinese', 'wuxia', 'asian']),
    ('05_게임_판타지_RPG_OST', ['종이비행기', '비행기', 'ost', 'fantasy', 'rpg', '게임', '모험', '하늘섬', 'dungeon', 'battle', 'boss', 'adventure']),
    ('06_발라드_감성_슬픈노래', ['오글거리', '사랑해', '누나', '결혼', '짝사랑', '발라드', '꽃비', '봄날', '그리움', '달을 넘는', '눈물', '이별', '추억', '기억', 'ballad', 'sad', 'emotional']),
    ('07_잔잔한_어쿠스틱_힐링_피아노', ['어쿠스틱', '피아노', 'acoustic', 'piano', '힐링', '잔잔', '휴식', 'lullaby', 'peaceful']),
    ('08_댄스_팝_EDM_리믹스', ['댄스', '팝', 'edm', 'remix', '리믹스', 'pop', 'dance', 'club', 'house', 'techno', 'electro']),
    ('09_힙합_랩_R&B_소울', ['힙합', '랩', 'r&b', '소울', 'hip hop', 'hiphop', 'rap', 'rnb', 'soul', 'groove']),
    ('10_록_메탈_밴드음악', ['락', '메탈', '밴드', 'rock', 'metal', 'punk', 'hard rock', 'guitar solo']),
    ('11_디즈니_뮤지컬_동요_애니', ['디즈니', '뮤지컬', '동요', '애니', 'disney', 'musical', 'anime', 'children']),
    ('12_크리스마스_겨울시즌송', ['크리스마스', '겨울', '눈사람', 'christmas', 'winter', 'holiday', 'carol']),
    ('13_기타_감성_창작곡', [])
]

def clean_filename(name):
    # Remove invalid characters
    return re.sub(r'[\\/*?:"<>|]', '', name).strip()

def classify_song(title, prompt, style):
    full_text = f'{title} {prompt} {style}'.lower()
    for folder, keywords in GENRE_MAP:
        for kw in keywords:
            if kw in full_text:
                return folder
    return '06_발라드_감성_슬픈노래'

print('Step 1: Indexing existing Google Drive files...')
existing_ids = set()
if os.path.exists(GDRIVE_ROOT):
    for root, dirs, files in os.walk(GDRIVE_ROOT):
        for f in files:
            m = re.findall(r'[0-9a-fA-F]{8}', f)
            for hex_id in m:
                existing_ids.add(hex_id.lower())

print(f'Total existing IDs indexed: {len(existing_ids)}')

print('\nStep 2: Fetching clips from Suno API...')
new_clips = []
page = 1
while True:
    url = f'https://studio-api.prod.suno.com/api/feed/v2?page={page}'
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code != 200:
            print(f'API error on page {page}: {r.status_code}')
            break
        data = r.json()
        clips = data.get('clips', [])
        if not clips:
            break
        
        reached_existing = False
        for c in clips:
            cid = c.get('id', '')
            short_id = cid[:8].lower() if cid else ''
            if short_id in existing_ids:
                print(f'-> Found existing song: "{c.get("title")}" ({short_id}). Reached backup boundary.')
                reached_existing = True
                break
            if c.get('status') == 'complete' and (c.get('audio_url') or c.get('video_url')):
                new_clips.append(c)
        
        if reached_existing or not data.get('has_more', False):
            break
        page += 1
    except Exception as e:
        print(f'Fetch error: {e}')
        break

print(f'\n🎉 Total NEW Suno songs to download & organize: {len(new_clips)}')

# Step 3: Download & Organize
success_count = 0
for idx, c in enumerate(new_clips, 1):
    cid = c.get('id', '')
    short_id = cid[:8]
    raw_title = c.get('title') or '무제'
    title = clean_filename(raw_title)
    if not title: title = '무제'
    
    metadata = c.get('metadata', {})
    prompt = metadata.get('prompt', '') or ''
    style = metadata.get('tags', '') or ''
    created_at = c.get('created_at', '')[:10]
    
    genre = classify_song(title, prompt, style)
    is_vocal = bool(prompt.strip() and not metadata.get('instrumental', False))
    type_sub = '🎤_가사_보컬곡' if is_vocal else '🎹_MR_반주_연주곡'
    
    audio_url = c.get('audio_url')
    if not audio_url:
        print(f'[{idx}/{len(new_clips)}] Skipping {title} (No audio URL)')
        continue

    # Filename format: <Title>_<ShortID>.mp3
    fname_base = f'{title}_{short_id}'
    fname_mp3 = f'{fname_base}.mp3'
    fname_txt = f'{fname_base}_가사.txt'

    print(f'[{idx}/{len(new_clips)}] Downloading: {fname_base} ({genre} / {type_sub})...')
    
    try:
        # Download audio
        audio_resp = requests.get(audio_url, timeout=30)
        if audio_resp.status_code == 200:
            audio_bytes = audio_resp.content
            
            # 1. Save to Genre Folder (MP3)
            target_genre_mp3 = os.path.join(GDRIVE_GENRE_ROOT, genre, type_sub, 'MP3')
            os.makedirs(target_genre_mp3, exist_ok=True)
            with open(os.path.join(target_genre_mp3, fname_mp3), 'wb') as f:
                f.write(audio_bytes)
                
            # 2. Save Lyrics/Prompt Text
            lyrics_content = f"제목: {title}\nSuno ID: {cid}\n생성일: {created_at}\n스타일: {style}\n\n[가사 / 프롬프트]\n{prompt}"
            with open(os.path.join(target_genre_mp3, fname_txt), 'w', encoding='utf-8') as f:
                f.write(lyrics_content)
                
            # 3. Save to Playlist (새노래)
            target_new_mp3 = os.path.join(GDRIVE_PLAYLIST_NEW, 'MP3')
            os.makedirs(target_new_mp3, exist_ok=True)
            shutil.copy2(os.path.join(target_genre_mp3, fname_mp3), os.path.join(target_new_mp3, fname_mp3))
            shutil.copy2(os.path.join(target_genre_mp3, fname_txt), os.path.join(target_new_mp3, fname_txt))
            
            # 4. Save to Master MP3 All Folder
            os.makedirs(GDRIVE_ALL_MP3, exist_ok=True)
            shutil.copy2(os.path.join(target_genre_mp3, fname_mp3), os.path.join(GDRIVE_ALL_MP3, fname_mp3))
            
            success_count += 1
            print(f'   -> Saved successfully: {genre} / {fname_mp3}')
        else:
            print(f'   -> Failed to download audio: {audio_resp.status_code}')
    except Exception as e:
        print(f'   -> Error downloading {title}: {e}')

print(f'\n✨ Suno Sync Completed! Successfully downloaded & organized {success_count} / {len(new_clips)} new songs to Google Drive!')
