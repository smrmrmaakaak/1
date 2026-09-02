# AutoTransfer.ps1 - Galaxy MTP Auto Copier
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "스타듀밸리 모바일 모드팩 자동 전송기"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host " [스타듀밸리 모바일 모드팩 USB 자동 전송기]" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = Join-Path $PSScriptRoot "[1] 폰_복사용_설치패키지"
if (-not (Test-Path $sourceDir)) {
    $sourceDir = Join-Path (Split-Path $PSScriptRoot -Parent) "[1] 폰_복사용_설치패키지"
}

$shell = New-Object -ComObject Shell.Application
$myComputer = $shell.Namespace(17)
$devices = $myComputer.Items()

$foundPhone = $null
$internalStorage = $null

foreach ($dev in $devices) {
    if ($dev.Type -like "*Portable*" -or $dev.Type -like "*장치*" -or $dev.Name -like "*Galaxy*" -or $dev.Name -like "*Z Flip*" -or $dev.Name -like "*S24*" -or $dev.Name -like "*휴대폰*" -or $dev.Name -like "*Phone*") {
        $foundPhone = $dev
        break
    }
}

if (-not $foundPhone) {
    # Scan all items for sub-storage
    foreach ($dev in $devices) {
        try {
            $folder = $dev.GetFolder
            if ($folder) {
                foreach ($sub in $folder.Items()) {
                    if ($sub.Name -like "*내부*" -or $sub.Name -like "*Internal*") {
                        $foundPhone = $dev
                        $internalStorage = $sub
                        break
                    }
                }
            }
        } catch {}
        if ($foundPhone) { break }
    }
}

if ($foundPhone) {
    Write-Host "[1] 연결된 스마트폰 감지됨: $($foundPhone.Name)" -ForegroundColor Green
    
    if (-not $internalStorage) {
        $phoneFolder = $foundPhone.GetFolder
        if ($phoneFolder) {
            foreach ($sub in $phoneFolder.Items()) {
                if ($sub.Name -like "*내부*" -or $sub.Name -like "*Internal*") {
                    $internalStorage = $sub
                    break
                }
            }
        }
    }
    
    if ($internalStorage) {
        Write-Host "[2] 내부 저장공간 접근 성공!" -ForegroundColor Green
        
        $storageFolder = $internalStorage.GetFolder
        $downloadItem = $null
        foreach ($item in $storageFolder.Items()) {
            if ($item.Name -eq "Download" -or $item.Name -eq "다운로드") {
                $downloadItem = $item
                break
            }
        }
        
        if ($downloadItem) {
            Write-Host "[3] Download 폴더로 파일 자동 복사 중... 잠시만 기다려주세요." -ForegroundColor Yellow
            $downloadFolder = $downloadItem.GetFolder
            
            # Copy items from sourceDir
            $sourceShell = $shell.Namespace($sourceDir)
            if ($sourceShell) {
                $downloadFolder.CopyHere($sourceShell.Items(), 16) # 16 = Respond 'Yes to All'
                Write-Host ""
                Write-Host "===============================================================================" -ForegroundColor Cyan
                Write-Host " [전송 완료!] 폰의 Download 폴더로 파일이 100% 자동 복사되었습니다!" -ForegroundColor Green
                Write-Host "===============================================================================" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "이제 폰 화면에서 딱 2가지만 해주시면 끝납니다:" -ForegroundColor White
                Write-Host " 1. 폰 [내 파일] -> [다운로드] -> 'SMAPI-Launcher.apk' 터치하여 설치" -ForegroundColor Yellow
                Write-Host " 2. SMAPI Launcher 앱 실행 -> [Install SMAPI From Zip] -> 'SMAPI.zip' 선택" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "아무 키나 누르면 종료됩니다..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                exit 0
            }
        }
    }
}

# Fallback: Open folders side by side
Write-Host "[-] 폰 자동 감지 대기 중..." -ForegroundColor Yellow
Write-Host "    1. 폰 화면 잠금을 풀고 '휴대전화 데이터 접근 허용' -> [허용]을 눌러주세요." -ForegroundColor White
Write-Host "    2. 수동으로 바로 넣으실 수 있도록 폴더 창 2개를 나란히 띄워드립니다." -ForegroundColor Gray
Write-Host ""

Start-Process explorer.exe -ArgumentList "`"$sourceDir`""
Start-Process explorer.exe -ArgumentList "shell:MyComputerFolder"

Write-Host "열린 창에서 '[1] 폰_복사용_설치패키지' 안의 파일들을 폰의 'Download' 폴더로 드래그해 주세요!" -ForegroundColor Green
Write-Host ""
Write-Host "아무 키나 누르면 종료됩니다..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
