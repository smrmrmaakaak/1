/**
 * 14대 완전히 다른 디자인 콘셉트 실시간 스위처 (모바일 완벽 반응형)
 */
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  const sites = [
    { file: 'site14-aaastudio.html', alias: '', title: '✨ 14. 3D 스튜디오', icon: 'wb_sunny' },
    { file: 'site13-homeplanner.html', alias: '', title: '🏡 13. 공간 플래너', icon: 'view_in_ar' },
    { file: 'site12-3dbook.html', alias: '', title: '📖 12. 3D 실사 책', icon: 'menu_book' },
    { file: 'site11-3dmaster.html', alias: '', title: '⭐ 11. 3D 쇼룸', icon: 'view_in_ar' },
    { file: 'site01-heritage.html', alias: 'index.html', title: '1. 한옥 족보', icon: 'history_edu' },
    { file: 'site02-blueprint.html', alias: '', title: '2. 캐드 청사진', icon: 'architecture' },
    { file: 'site03-magazine.html', alias: '', title: '3. 킨포크 매거진', icon: 'auto_stories' },
    { file: 'site04-webtoon.html', alias: '', title: '4. 웹툰 스토리', icon: 'chat' },
    { file: 'site05-poster.html', alias: '', title: '5. 한글 포스터', icon: 'draw' },
    { file: 'site06-pixelretro.html', alias: '', title: '6. 픽셀 아케이드', icon: 'sports_esports' },
    { file: 'site07-workshop.html', alias: '', title: '7. 공방 작업대', icon: 'handyman' },
    { file: 'site08-simpleapp.html', alias: '', title: '8. 토스형 1초 진단', icon: 'bolt' },
    { file: 'site09-vipluxury.html', alias: '', title: '9. VIP 컨시어지', icon: 'hotel' },
    { file: 'site10-investigation.html', alias: '', title: '10. 사건 르포 파일', icon: 'policy' },
  ];

  const toolbar = document.createElement('div');
  toolbar.id = 'fourteen-sites-switcher-toolbar';
  toolbar.className = 'fixed top-0 inset-x-0 z-[9999] bg-[#0A0806]/95 backdrop-blur-xl border-b border-amber-500/30 h-[42px] px-2 sm:px-4 shadow-2xl flex items-center justify-between text-xs text-slate-300 font-sans';
  
  let buttonsHtml = sites.map(s => {
    const isActive = currentPath === s.file || (s.alias && currentPath === s.alias) || (currentPath === '' && s.file === 'site14-aaastudio.html');
    const activeClass = isActive 
      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/40 border-amber-400' 
      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.1]';
    return `
      <a href="${s.file}" class="px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 shrink-0 whitespace-nowrap ${activeClass}">
        <span class="material-symbols-outlined text-xs leading-none">${s.icon}</span>
        <span>${s.title}</span>
      </a>
    `;
  }).join('');

  toolbar.innerHTML = `
    <div class="max-w-[1800px] mx-auto w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span class="font-extrabold text-amber-400 text-[11px] hidden sm:inline">14대 시연:</span>
      </div>
      <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        ${buttonsHtml}
      </div>
      <div class="hidden xl:flex items-center gap-1.5 text-[10px] text-amber-300/80 shrink-0">
        <span class="border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded font-bold font-mono">44종 자재/3D</span>
      </div>
    </div>
  `;

  document.body.prepend(toolbar);
  document.body.style.paddingTop = '42px';
});
