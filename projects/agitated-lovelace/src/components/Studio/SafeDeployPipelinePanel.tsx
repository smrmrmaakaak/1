import React, { useState } from 'react';
import { ShieldCheck, Package, Terminal, Copy, Check } from 'lucide-react';

export const SafeDeployPipelinePanel: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.antigravity.novacore.launcher">

    <application
        android:allowBackup="true"
        android:label="NovaCore S24U Launcher"
        android:theme="@style/Theme.NovaCore.NoActionBar">
        
        <!-- 🚀 Safe Home Launcher Intent Filter (Knox 0x0 Safe) -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:stateNotNeeded="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Knox Safety Guarantee Hero */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 shadow-lg flex items-start space-x-3">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-white">Knox 0x0 안전성 100% 보증 파이프라인</div>
          <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            현재 가상 스튜디오에서 제작한 커스텀 UI와 런처는 **안드로이드 독립 홈 앱(Launcher)** 표준 규격으로 패키징됩니다. 
            부트로더를 언락하거나 시스템 영역을 강제로 덮어쓰지 않으므로, **삼성페이·보안폴더·AS 보증이 100% 영구 보존**됩니다.
          </div>
        </div>
      </div>

      {/* 3-Step Safe Deployment Workflow */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Package className="w-4 h-4 text-cyan-400" />
          실기기 적용 3단계 파이프라인
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">1</span>
            <div>
              <div className="font-bold text-white">가상 OS 스튜디오에서 UI/테마 완성 및 검증</div>
              <div className="text-[10px] text-slate-400 mt-0.5">화면 왼쪽 가상 S24 Ultra에서 1440x3120 해상도 레이아웃과 애니메이션을 100% 확인합니다.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold shrink-0">2</span>
            <div>
              <div className="font-bold text-white">Android Home Launcher APK 빌드</div>
              <div className="text-[10px] text-slate-400 mt-0.5">작성된 UI와 React/Compose 소스를 APK 바이너리로 컴파일합니다.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">3</span>
            <div>
              <div className="font-bold text-white">ADB 1-Click 무선/유선 설치 & 기본 앱 지정</div>
              <div className="text-[10px] text-slate-400 mt-0.5">스마트폰 설정 → 애플리케이션 → 기본 앱 → '홈 앱'을 NovaCore로 선택하면 즉시 적용됩니다.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest & Android Boilerplate */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-pink-400" />
            AndroidManifest.xml 규격
          </div>
          <button
            onClick={handleCopyManifest}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-mono text-[10px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-[#05070d] border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
          {manifestCode}
        </pre>
      </div>
    </div>
  );
};
