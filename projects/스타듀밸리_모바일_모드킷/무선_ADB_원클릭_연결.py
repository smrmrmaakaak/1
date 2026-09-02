import subprocess, sys, re, time

ADB_PATH = r'C:\Users\황태민\Desktop\스타듀밸리_모바일_모드킷\platform-tools\adb.exe'

def run_adb(args):
    cmd = [ADB_PATH] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout.strip(), res.stderr.strip()

def get_devices():
    out, _ = run_adb(['devices'])
    devices = []
    for line in out.split('\n')[1:]:
        if '\tdevice' in line:
            devices.append(line.split()[0])
    return devices

def enable_wireless_via_usb():
    devices = get_devices()
    usb_devs = [d for d in devices if ':' not in d]
    if not usb_devs:
        print("[-] 현재 USB로 연결된 기기가 없습니다.")
        return False
    
    for dev in usb_devs:
        print(f"[+] USB 기기 발견: {dev}")
        out, _ = run_adb(['-s', dev, 'shell', 'ip -f inet addr show wlan0'])
        m = re.search(r'inet\s+(\d+\.\d+\.\d+\.\d+)', out)
        if not m:
            out, _ = run_adb(['-s', dev, 'shell', 'ip route'])
            m = re.search(r'src\s+(\d+\.\d+\.\d+\.\d+)', out)
            
        if m:
            ip = m.group(1)
            print(f"[+] 폰 Wi-Fi IP 주소 확인: {ip}")
            run_adb(['-s', dev, 'tcpip', '5555'])
            time.sleep(2)
            conn_out, _ = run_adb(['connect', f'{ip}:5555'])
            print(f"[+] 무선 연결 결과: {conn_out}")
            return True
        else:
            print("[-] 폰의 Wi-Fi IP를 확인하지 못했습니다. Wi-Fi가 켜져 있는지 확인해주세요.")
    return False

def pair_wireless(ip_port, code):
    print(f"[+] 무선 디버깅 페어링 시도: {ip_port}, 코드: {code}")
    out, err = run_adb(['pair', ip_port, code])
    print(f"페어링 결과: {out} {err}")
    return out

def connect_wireless(ip_port):
    print(f"[+] 무선 디버깅 연결 시도: {ip_port}")
    out, err = run_adb(['connect', ip_port])
    print(f"연결 결과: {out} {err}")
    return out

if __name__ == '__main__':
    if len(sys.argv) == 1:
        # Default: try USB wireless setup or check current status
        devs = get_devices()
        print(f"현재 연결된 기기 목록: {devs}")
        if any(':' in d for d in devs):
            print("[+] 이미 무선(Wi-Fi)으로 정상 연결되어 있습니다!")
        else:
            enable_wireless_via_usb()
    elif sys.argv[1] == 'pair' and len(sys.argv) >= 4:
        pair_wireless(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'connect' and len(sys.argv) >= 3:
        connect_wireless(sys.argv[2])
