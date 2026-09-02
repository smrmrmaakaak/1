import os
import sys
import time
import shutil

sys.stdout.reconfigure(encoding='utf-8')

src_video = r'c:\Users\황태민\Documents\antigravity\charming-faraday\music_video_arirang_pure\arirang_pure_heart_1080p_mv.mp4'

print('Google Drive Auto-Backup Daemon started...')
while True:
    for letter in 'GHIJKLMNOPQRSTUVWXYZ':
        d_root = f'{letter}:\\'
        g_drive_path = os.path.join(d_root, '내 드라이브')
        if os.path.exists(g_drive_path):
            target_dir = os.path.join(g_drive_path, '유튜브에올린음원')
            os.makedirs(target_dir, exist_ok=True)
            dest = os.path.join(target_dir, '순수한마음_아리랑_시네마틱_뮤직비디오_1080p.mp4')
            if not os.path.exists(dest) or os.path.getsize(dest) != os.path.getsize(src_video):
                shutil.copy2(src_video, dest)
                print(f'✅ Successfully backed up to Google Drive ({letter}:): {dest}')
            sys.exit(0)
    time.sleep(3)
