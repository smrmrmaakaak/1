import http.server
import socketserver
import os
import json
import sqlite3
import urllib.parse
from datetime import datetime
import shutil

PORT = 8088
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_DIR, 'estimates.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # 1. 예약/견적 테이블
    cur.execute('''
        CREATE TABLE IF NOT EXISTS estimates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            repair_type TEXT NOT NULL,
            location TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            preferred_date TEXT DEFAULT '',
            preferred_time TEXT DEFAULT '',
            photo_filenames TEXT DEFAULT '[]',
            status TEXT DEFAULT '접수완료',
            admin_memo TEXT DEFAULT ''
        )
    ''')
    
    # 2. 에피소드 하트/좋아요 영구 저장 테이블
    cur.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            ep_id TEXT PRIMARY KEY,
            like_count INTEGER DEFAULT 0
        )
    ''')
    
    defaults = {
        'ep1': 1250,
        'ep2': 986,
        'ep3': 1412,
        'ep4': 890,
        'ep5': 1074
    }
    for ep_id, count in defaults.items():
        cur.execute('INSERT OR IGNORE INTO likes (ep_id, like_count) VALUES (?, ?)', (ep_id, count))

    conn.commit()
    conn.close()

init_db()

class MasterCarpenterHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/estimates':
            self.handle_get_estimates()
        elif path == '/api/likes':
            self.handle_get_likes()
        elif path == '/api/health':
            self.send_json_response(200, {"status": "ok", "service": "Master Carpenter API"})
        elif path == '/robots.txt':
            self.serve_text_file(os.path.join(BASE_DIR, 'robots.txt'), 'text/plain')
        elif path == '/sitemap.xml':
            self.serve_text_file(os.path.join(BASE_DIR, 'sitemap.xml'), 'application/xml')
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path in ['/api/estimate', '/api/booking']:
            self.handle_post_estimate()
        elif path.startswith('/api/likes/'):
            ep_id = path.split('/')[3]
            self.handle_post_like(ep_id)
        elif path.startswith('/api/estimates/') and path.endswith('/status'):
            est_id = path.split('/')[3]
            self.handle_update_status(est_id)
        elif path.startswith('/api/estimates/') and path.endswith('/delete'):
            est_id = path.split('/')[3]
            self.handle_delete_estimate(est_id)
        elif path == '/api/estimates/clear_all':
            self.handle_clear_all_estimates()
        else:
            self.send_json_response(404, {"error": "Endpoint not found"})

    def handle_get_estimates(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT * FROM estimates ORDER BY id DESC')
        rows = cur.fetchall()
        data = []
        for r in rows:
            d = dict(r)
            try:
                d['photo_filenames'] = json.loads(d.get('photo_filenames', '[]'))
            except Exception:
                d['photo_filenames'] = []
            data.append(d)
        conn.close()
        self.send_json_response(200, {"success": True, "count": len(data), "data": data})

    def handle_get_likes(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('SELECT ep_id, like_count FROM likes')
        rows = cur.fetchall()
        conn.close()
        likes_map = {row[0]: row[1] for row in rows}
        self.send_json_response(200, {"success": True, "data": likes_map})

    def handle_post_like(self, ep_id):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('INSERT OR IGNORE INTO likes (ep_id, like_count) VALUES (?, 1000)', (ep_id,))
        cur.execute('UPDATE likes SET like_count = like_count + 1 WHERE ep_id = ?', (ep_id,))
        cur.execute('SELECT like_count FROM likes WHERE ep_id = ?', (ep_id,))
        new_count = cur.fetchone()[0]
        conn.commit()
        conn.close()
        self.send_json_response(200, {"success": True, "ep_id": ep_id, "like_count": new_count})

    def handle_post_estimate(self):
        content_type = self.headers.get('Content-Type', '')

        # 1. JSON Request
        if 'application/json' in content_type:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(body)
            except Exception:
                self.send_json_response(400, {"error": "Invalid JSON"})
                return

            repair_type = payload.get('repair_type', '사각싱크볼 교체 & 상판 타공')
            location = payload.get('location', '지역 미지정')
            customer_phone = payload.get('customer_phone', '010-0000-0000')
            preferred_date = payload.get('preferred_date', '협의 후 결정')
            preferred_time = payload.get('preferred_time', '시간 무관')
            photo_filenames = payload.get('photo_filenames', [])
            admin_memo = payload.get('admin_memo', '')

            new_id = self.save_estimate_to_db(repair_type, location, customer_phone, preferred_date, preferred_time, photo_filenames, admin_memo)
            self.send_json_response(200, {
                "success": True, 
                "id": new_id, 
                "message": "예약 및 견적 신청이 성공적으로 접수되었습니다. 조인형 대표가 10분 내로 안내드립니다."
            })

        # 2. Multipart Form Data (다중 사진 업로드 지원)
        elif 'multipart/form-data' in content_type:
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)

            boundary = content_type.split("boundary=")[1].encode('utf-8')
            parts = body_bytes.split(b'--' + boundary)

            fields = {}
            photo_filenames = []

            for part in parts:
                if b'Content-Disposition' in part:
                    header_part, content_part = part.split(b'\r\n\r\n', 1)
                    header_text = header_part.decode('utf-8', errors='ignore')
                    content = content_part.rstrip(b'\r\n')

                    if 'filename="' in header_text:
                        raw_filename = header_text.split('filename="')[1].split('"')[0]
                        if raw_filename and len(content) > 0:
                            ext = os.path.splitext(raw_filename)[1] or '.jpg'
                            photo_name = f"est_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(3).hex()}{ext}"
                            file_path = os.path.join(UPLOAD_DIR, photo_name)
                            with open(file_path, 'wb') as f:
                                f.write(content)
                            photo_filenames.append(photo_name)
                    else:
                        field_name = header_text.split('name="')[1].split('"')[0]
                        fields[field_name] = content.decode('utf-8', errors='ignore').strip()

            repair_type = fields.get('repair_type', '사각싱크볼 교체 & 상판 타공')
            location = fields.get('location', '지역 미지정')
            customer_phone = fields.get('customer_phone', '010-0000-0000')
            preferred_date = fields.get('preferred_date', '협의 후 결정')
            preferred_time = fields.get('preferred_time', '시간 무관')

            new_id = self.save_estimate_to_db(repair_type, location, customer_phone, preferred_date, preferred_time, photo_filenames, '')
            self.send_json_response(200, {
                "success": True, 
                "id": new_id, 
                "photos_count": len(photo_filenames),
                "message": f"예약 및 {len(photo_filenames)}장의 사진 접수가 완료되었습니다!"
            })
        else:
            self.send_json_response(400, {"error": "Unsupported Content-Type"})

    def handle_update_status(self, est_id):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            payload = json.loads(body)
        except Exception:
            self.send_json_response(400, {"error": "Invalid JSON"})
            return

        new_status = payload.get('status', '접수완료')
        new_memo = payload.get('admin_memo', None)

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        if new_memo is not None:
            cur.execute('UPDATE estimates SET status = ?, admin_memo = ? WHERE id = ?', (new_status, new_memo, est_id))
        else:
            cur.execute('UPDATE estimates SET status = ? WHERE id = ?', (new_status, est_id))
        conn.commit()
        conn.close()

        self.send_json_response(200, {"success": True, "message": f"예약/견적 #{est_id} 상태가 변경되었습니다."})

    def handle_delete_estimate(self, est_id):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('DELETE FROM estimates WHERE id = ?', (est_id,))
        conn.commit()
        conn.close()
        self.send_json_response(200, {"success": True, "message": f"예약/견적 #{est_id}이 삭제되었습니다."})

    def handle_clear_all_estimates(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('DELETE FROM estimates')
        conn.commit()
        conn.close()
        self.send_json_response(200, {"success": True, "message": "모든 테스트 예약/견적 데이터가 초기화되었습니다."})

    def save_estimate_to_db(self, repair_type, location, customer_phone, preferred_date, preferred_time, photo_filenames, admin_memo):
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        photos_json = json.dumps(photo_filenames, ensure_ascii=False)
        cur.execute('''
            INSERT INTO estimates (created_at, repair_type, location, customer_phone, preferred_date, preferred_time, photo_filenames, status, admin_memo)
            VALUES (?, ?, ?, ?, ?, ?, ?, '접수완료', ?)
        ''', (now_str, repair_type, location, customer_phone, preferred_date, preferred_time, photos_json, admin_memo))
        new_id = cur.lastrowid
        conn.commit()
        conn.close()
        return new_id

    def serve_text_file(self, file_path, content_type):
        if not os.path.exists(file_path):
            self.send_error(404, "File not found")
            return
        with open(file_path, 'rb') as f:
            content = f.read()
        self.send_response(200)
        self.send_header('Content-Type', f'{content_type}; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json_response(self, status_code, data):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), MasterCarpenterHandler) as httpd:
        print(f"Master Carpenter Production Server running at http://127.0.0.1:{PORT}")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
