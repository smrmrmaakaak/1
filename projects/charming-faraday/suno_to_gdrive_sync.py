import os
import sys
import time
import shutil
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS_DIR = os.path.expanduser('~/Downloads')
GDRIVE_MUSIC_ROOT = r'G:\내 드라이브\내_컴퓨터_보관함\음악\Suno_장르별_정리'
GDRIVE_NEW_SONGS = r'G:\내 드라이브\내_컴퓨터_보관함\음악\Suno_플레이리스트_분류\새노래\WAV'

# Genre matching keywords
GENRE_RULES = [
    ('03_국악_한국전통_아리랑', ['아리랑', '국악', '매화', '새벽', '지리산', '한옥', '전통', 'korean traditional']),
    ('06_발라드_감성_슬픈노래', ['오글거리', '사랑해', '누나', '결혼', '짝사랑', '발라드', '꽃비', '봄날', '그리움', '달을 넘는', '눈물', 'ballad']),
    ('10_록_메탈_밴드음악', ['락', '메탈', '밴드', 'rock', 'metal', 'guitar', 'dungeon', 'pirate']),
    ('08_댄스_팝_EDM_리믹스', ['댄스', '팝', 'edm', 'remix', '리믹스', 'pop', 'dance', 'club']),
    ('05_게임_판타지_RPG_OST', ['종이비행기', '비행기', 'ost', 'fantasy', 'rpg', '게임', '모험', '하늘섬']),
    ('07_잔잔한_어쿠스틱_힐링_피아노', ['어쿠스틱', '피아노', 'acoustic', 'piano', '힐링', '잔잔'])
]

def classify_genre(filename):
    lower_name = filename.lower()
    for genre_folder, keywords in GENRE_RULES:
        for kw in keywords:
            if kw in lower_name:
                return genre_folder
    return '06_발라드_감성_슬픈노래'  # default for romance/crush songs

def sync_new_audio():
    if not os.path.exists(DOWNLOADS_DIR):
        return

    # Check for completed downloads (ignore .crdownload or .tmp)
    audio_files = glob.glob(os.path.join(DOWNLOADS_DIR, '*.wav')) + glob.glob(os.path.join(DOWNLOADS_DIR, '*.mp3'))
    
    for fpath in audio_files:
        fname = os.path.basename(fpath)
        # Verify file is fully downloaded
        try:
            sz_1 = os.path.getsize(fpath)
            time.sleep(0.5)
            sz_2 = os.path.getsize(fpath)
            if sz_1 != sz_2 or sz_1 < 50000:
                continue  # still downloading
        except:
            continue

        genre = classify_genre(fname)
        ext = 'WAV' if fname.lower().endswith('.wav') else 'MP3'
        
        target_dir = os.path.join(GDRIVE_MUSIC_ROOT, genre, '🎤_가사_보컬곡', ext)
        if not os.path.exists(r'G:\내 드라이브'):
            # Fallback to local cache if drive not mounted
            target_dir = os.path.join(r'c:\Users\황태민\Documents\antigravity\charming-faraday\google_drive_music_curator\audio')
        
        os.makedirs(target_dir, exist_ok=True)
        dest_path = os.path.join(target_dir, fname)
        
        try:
            shutil.copy2(fpath, dest_path)
            print(f'✅ [Suno Auto-Sync] Successfully organized & backed up to Google Drive!')
            print(f'   - Song: {fname}')
            print(f'   - Category: {genre}')
            print(f'   - Path: {dest_path}')
            
            # Also copy to new songs playlist folder
            if os.path.exists(r'G:\내 드라이브'):
                os.makedirs(GDRIVE_NEW_SONGS, exist_ok=True)
                shutil.copy2(fpath, os.path.join(GDRIVE_NEW_SONGS, fname))
        except Exception as e:
            print(f'Sync error for {fname}: {e}')

if __name__ == '__main__':
    print('🚀 Suno -> Google Drive Real-time Auto-Sync Daemon Started...')
    print(f'Monitoring: {DOWNLOADS_DIR}')
    print(f'Target: {GDRIVE_MUSIC_ROOT}')
    while True:
        sync_new_audio()
        time.sleep(2)
