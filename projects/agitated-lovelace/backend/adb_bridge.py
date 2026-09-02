import sys
import os
import json
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import re

ADB_PATH = os.path.expandvars(r"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe")
if not os.path.exists(ADB_PATH):
    ADB_PATH = "adb"

PORT = 8765

def run_adb(args, timeout=10, is_binary=False):
    try:
        cmd = [ADB_PATH] + args
        if is_binary:
            result = subprocess.run(cmd, capture_output=True, timeout=timeout)
            return result.stdout
        else:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
            return result.stdout.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def get_device_telemetry():
    model = run_adb(["shell", "getprop", "ro.product.model"])
    device_name = run_adb(["shell", "getprop", "ro.product.name"])
    android_ver = run_adb(["shell", "getprop", "ro.build.version.release"])
    oneui_ver = run_adb(["shell", "getprop", "ro.build.version.oneui"])
    build_id = run_adb(["shell", "getprop", "ro.build.display.id"])
    soc = run_adb(["shell", "getprop", "ro.soc.model"]) or "SM8650 (Snapdragon 8 Gen 3)"
    warranty_bit = run_adb(["shell", "getprop", "ro.boot.warranty_bit"])
    bootloader = run_adb(["shell", "getprop", "ro.boot.flash.locked"])
    
    # Battery info
    battery_dump = run_adb(["shell", "dumpsys", "battery"])
    battery_level = 85
    battery_status = "Discharging"
    battery_temp = 29.5
    for line in battery_dump.splitlines():
        line = line.strip()
        if line.startswith("level:"):
            try: battery_level = int(line.split(":")[1].strip())
            except: pass
        elif line.startswith("status:"):
            s_code = line.split(":")[1].strip()
            if s_code == "2": battery_status = "Charging"
            elif s_code == "5": battery_status = "Full"
        elif line.startswith("temperature:"):
            try: battery_temp = int(line.split(":")[1].strip()) / 10.0
            except: pass
            
    # Storage info
    df_data = run_adb(["shell", "df", "-h", "/data"])
    storage_total = "512 GB"
    storage_used = "128 GB"
    storage_percent = 25
    lines = df_data.splitlines()
    if len(lines) >= 2:
        parts = lines[1].split()
        if len(parts) >= 5:
            storage_total = parts[1]
            storage_used = parts[2]
            try: storage_percent = int(parts[4].replace("%", ""))
            except: pass
            
    # RAM info
    meminfo = run_adb(["shell", "cat", "/proc/meminfo"])
    mem_total_kb = 12000000
    mem_avail_kb = 6000000
    for line in meminfo.splitlines():
        if "MemTotal:" in line:
            m = re.search(r'(\d+)', line)
            if m: mem_total_kb = int(m.group(1))
        elif "MemAvailable:" in line:
            m = re.search(r'(\d+)', line)
            if m: mem_avail_kb = int(m.group(1))
    
    ram_total_gb = round(mem_total_kb / 1024 / 1024, 1)
    ram_used_gb = round((mem_total_kb - mem_avail_kb) / 1024 / 1024, 1)
    ram_percent = round((ram_used_gb / ram_total_gb) * 100) if ram_total_gb > 0 else 50
    
    # Screen info
    wm_size = run_adb(["shell", "wm", "size"])
    wm_density = run_adb(["shell", "wm", "density"])
    
    return {
        "status": "connected",
        "model": model or "SM-S928N",
        "product": device_name or "Galaxy S24 Ultra",
        "soc": soc,
        "androidVersion": android_ver or "16",
        "oneUiVersion": oneui_ver or "8.5",
        "buildId": build_id,
        "knoxBit": "0x0 (Safe & Pure)" if warranty_bit == "0" else "0x1 (Void)",
        "bootloader": "Locked (Secure)" if bootloader == "1" else "Unlocked",
        "battery": {
            "level": battery_level,
            "status": battery_status,
            "temp": battery_temp
        },
        "storage": {
            "total": storage_total,
            "used": storage_used,
            "percent": storage_percent
        },
        "ram": {
            "total": f"{ram_total_gb} GB",
            "used": f"{ram_used_gb} GB",
            "percent": ram_percent
        },
        "display": {
            "resolution": "1440 x 3120 (QHD+)",
            "density": "600 DPI",
            "refreshRate": "120 Hz Dynamic"
        }
    }

class ADBBridgeHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/device/specs":
            data = get_device_telemetry()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            
        elif path == "/api/device/packages":
            raw = run_adb(["shell", "pm", "list", "packages", "-3"])
            pkgs = []
            for line in raw.splitlines():
                if line.startswith("package:"):
                    pkg_name = line.replace("package:", "").strip()
                    pkgs.append(pkg_name)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"packages": pkgs}, ensure_ascii=False).encode('utf-8'))

        elif path == "/api/device/screenshot":
            png_bytes = run_adb(["exec-out", "screencap", "-p"], is_binary=True)
            if png_bytes and png_bytes.startswith(b'\x89PNG'):
                self.send_response(200)
                self.send_header('Content-Type', 'image/png')
                self.send_header('Content-Length', str(len(png_bytes)))
                self.end_headers()
                self.wfile.write(png_bytes)
            else:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Failed to capture screenshot"}).encode('utf-8'))

        elif path == "/api/health":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        
        try:
            req_data = json.loads(body)
        except:
            req_data = {}

        if path == "/api/device/shell":
            cmd_str = req_data.get("command", "")
            if not cmd_str:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing command"}).encode('utf-8'))
                return
            
            output = run_adb(["shell", cmd_str])
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"output": output}, ensure_ascii=False).encode('utf-8'))
            
        elif path == "/api/device/launch":
            pkg = req_data.get("package", "")
            if pkg:
                out = run_adb(["shell", "monkey", "-p", pkg, "-c", "android.intent.category.LAUNCHER", "1"])
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"result": out}).encode('utf-8'))
            else:
                self.send_response(400)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), ADBBridgeHandler)
    print(f"[ADB Bridge] Running on http://127.0.0.1:{PORT}")
    server.serve_forever()

if __name__ == "__main__":
    run_server()
