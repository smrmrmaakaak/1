/**
 * 목수의 홈케어마스터 (Homecare Master) - App Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Before & After Sliders
  initBeforeAfterSlider('hero-ba-slider', 'hero-ba-before', 'hero-ba-handle');
  initBeforeAfterSlider('gallery-ba-sink', 'gallery-ba-sink-before', 'gallery-ba-sink-handle');

  // Lucide Icons Render
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ============================================================
   1. Before & After Slider Logic
   ============================================================ */
function initBeforeAfterSlider(containerId, beforeId, handleId) {
  const container = document.getElementById(containerId);
  const beforeWrapper = document.getElementById(beforeId);
  const handle = document.getElementById(handleId);

  if (!container || !beforeWrapper || !handle) return;

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;
    beforeWrapper.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  // Mouse Events
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });

  // Touch Events (Mobile)
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  }, { passive: true });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });
}

/* ============================================================
   2. Portfolio Tabs Switching
   ============================================================ */
function switchPortfolioTab(tabId) {
  const allTabs = document.querySelectorAll('.portfolio-tab-content');
  allTabs.forEach(tab => {
    tab.classList.add('hidden');
    tab.classList.remove('block');
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');
  }

  // Update Button Styles
  const tabButtons = [
    { id: 'btn-tab-sink', target: 'tab-sink' },
    { id: 'btn-tab-door', target: 'tab-door' },
    { id: 'btn-tab-artwall', target: 'tab-artwall' },
    { id: 'btn-tab-kinder', target: 'tab-kinder' },
  ];

  tabButtons.forEach(item => {
    const btn = document.getElementById(item.id);
    if (!btn) return;
    if (item.target === tabId) {
      btn.className = 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500 text-slate-950 shadow-md transition';
    } else {
      btn.className = 'px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
    }
  });

  // Re-init slider if tab-sink
  if (tabId === 'tab-sink') {
    setTimeout(() => {
      initBeforeAfterSlider('gallery-ba-sink', 'gallery-ba-sink-before', 'gallery-ba-sink-handle');
    }, 50);
  }
}

/* ============================================================
   3. Quick Estimate Simulator & SMS Builder
   ============================================================ */
const selectedServices = new Set(['사각싱크볼 교체 & 상판 재단']);

function toggleEstimateService(element, serviceName) {
  if (selectedServices.has(serviceName)) {
    if (selectedServices.size > 1) {
      selectedServices.delete(serviceName);
      element.classList.remove('selected');
    }
  } else {
    selectedServices.add(serviceName);
    element.classList.add('selected');
  }
}

function selectServiceInEstimate(serviceKey) {
  const mapping = {
    'sink': '사각싱크볼 교체 & 상판 재단',
    'door': '방문/욕실문 수리 및 교체',
    'artwall': '아트월 철거 & 평탄화',
    'commercial': '어린이집/상가 마그네슘보드'
  };

  const serviceName = mapping[serviceKey];
  if (!serviceName) return;

  const cards = document.querySelectorAll('.estimate-card');
  cards.forEach(card => {
    const title = card.querySelector('div.font-bold')?.innerText;
    if (title && serviceName.includes(title)) {
      if (!card.classList.contains('selected')) {
        card.click();
      }
    }
  });
}

function sendEstimateSMS() {
  const region = document.getElementById('input-region').value.trim() || '지역 미입력';
  const residence = document.getElementById('select-residence').value;
  const schedule = document.getElementById('select-schedule').value;
  const serviceList = Array.from(selectedServices).join(', ');

  const phoneNumber = '01092764245';
  const messageBody = `[홈케어마스터 견적문의]\n- 의뢰항목: ${serviceList}\n- 희망지역: ${region}\n- 거주상태: ${residence}\n- 희망일정: ${schedule}\n(아래에 현장 사진 2~3장을 첨부해 주시면 즉시 정확한 견적을 안내해 드립니다)`;

  // Encode for URI
  const encodedBody = encodeURIComponent(messageBody);
  
  // Try opening native SMS app
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    const smsUrl = navigator.userAgent.match(/iPhone|iPad|iPod/i) 
      ? `sms:${phoneNumber}&body=${encodedBody}` 
      : `sms:${phoneNumber}?body=${encodedBody}`;
    window.location.href = smsUrl;
  } else {
    // Desktop: Copy to clipboard and alert
    navigator.clipboard.writeText(`010-9276-4245\n\n${messageBody}`).then(() => {
      alert(`[문자 내용이 클립보드에 복사되었습니다!]\n\n받는 사람: 010-9276-4245\n\n내용:\n${messageBody}\n\n휴대폰으로 사진과 함께 문자를 보내주시면 10분 내로 연락드리겠습니다.`);
    }).catch(() => {
      alert(`받는 사람: 010-9276-4245\n\n문의 내용:\n${messageBody}\n\n위 내용과 함께 사진을 문자로 보내주세요!`);
    });
  }
}

/* ============================================================
   4. Live Service Area District Filter
   ============================================================ */
function filterAreas() {
  const query = document.getElementById('area-search-input').value.trim().toLowerCase();
  const feedback = document.getElementById('search-feedback');
  const badges = document.querySelectorAll('.area-badge');

  if (!query) {
    badges.forEach(b => {
      b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold', 'border-amber-400', 'animate-pulse');
      b.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
    });
    if (feedback) feedback.classList.add('hidden');
    return;
  }

  let matchFound = false;

  badges.forEach(badge => {
    const text = badge.innerText.toLowerCase();
    if (text.includes(query)) {
      matchFound = true;
      badge.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');
      badge.classList.add('bg-amber-500', 'text-slate-950', 'font-bold', 'border-amber-400', 'animate-pulse');
    } else {
      badge.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold', 'border-amber-400', 'animate-pulse');
      badge.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
    }
  });

  if (feedback) {
    if (matchFound) {
      feedback.innerText = `✓ '${query}' 출장 가능 지역입니다!`;
      feedback.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 block';
    } else {
      feedback.innerText = `수도권 인근 상담 후 출장 가능!`;
      feedback.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 block';
    }
  }
}

/* ============================================================
   5. Service Detail Modal
   ============================================================ */
const serviceModalData = {
  'sink': {
    title: '🍳 주방 프리미엄 리폼 & 사각싱크볼 시공 공정',
    badge: '타 업체 포기 현장 1위 해결',
    steps: [
      { num: '01', title: '현장 실측 & 타공 규격 진단', desc: '기존 싱크볼 탈거 후 상판의 가로·세로 치수 및 전면/후면 여유 공간을 레이저 실측합니다.' },
      { num: '02', title: '살림집 먼지 차단 보양', desc: '싱크대 주변 이중 비닐 커버링 및 배수구 밀봉으로 분진 유입을 100% 차단합니다.' },
      { num: '03', title: '목수 전용 집진 정밀 컷팅 (30mm)', desc: '원목/대리석 파손 없이 전용 톱날과 고성능 집진기로 오차 없이 깔끔하게 컷팅합니다.' },
      { num: '04', title: '단면 방수 코팅 & 사각싱크볼 안착', desc: '잘린 단면에 물이 먹지 않도록 방수 코팅 후 전용 브라켓으로 흔들림 없이 고정합니다.' },
      { num: '05', title: '바이오 실리콘 & 누수 방지 배수관 마감', desc: '악취 차단 S트랩 배수관 연결, 수압/배수 3회 테스트 후 곰팡이 방지 바이오 실리콘으로 완성합니다.' }
    ]
  },
  'door': {
    title: '🚪 도어 목공 & 인테리어 필름 시공 공정',
    badge: '교체 비용 70% 절감 솔루션',
    steps: [
      { num: '01', title: '도어 힌지 및 단차 점검', desc: '문이 바닥에 긁히거나 닫히지 않는 원인을 분석하고 경첩 및 프레임 구조를 보정합니다.' },
      { num: '02', title: '표면 샌딩 & 퍼티 평탄화', desc: '흠집, 찍힘, 곰팡이 부위를 깔끔하게 메우고 매끄럽게 샌딩 가공합니다.' },
      { num: '03', title: '고접착 프라이머 도포', desc: '필름이 들뜨거나 벗겨지지 않도록 전용 프라이머를 도포하여 내구성을 극대화합니다.' },
      { num: '04', title: '프리미엄 메탈 헤어라인 필름 랩핑', desc: '기포 제로 공법으로 모서리와 틈새까지 정밀 열처리 압착 랩핑을 진행합니다.' }
    ]
  },
  'artwall': {
    title: '🧱 벽체 · 아트월 평탄화 & 부분 복원 공정',
    badge: '모던 인테리어의 기본',
    steps: [
      { num: '01', title: '노후 아트월 안전 철거', desc: '타일 및 목재 판넬을 주변 몰딩과 바닥 손상 없이 깔끔하게 철거 폐기합니다.' },
      { num: '02', title: '벽면 수평 레이저 계측 및 목재 상작업', desc: '벽면 단차를 보정하기 위해 다루끼 목재 골조 뼈대를 튼튼하게 세웁니다.' },
      { num: '03', title: '석고보드 2P 평탄화 시공', desc: '도배가 완벽하게 밀착될 수 있도록 1mm 단차 없는 석고보드 평탄화 시공을 진행합니다.' },
      { num: '04', title: '몰딩 & 걸레받이 마감', desc: '바닥과 천장 라인에 맞춰 걸레받이와 몰딩을 재단하여 깔끔하게 마감합니다.' }
    ]
  },
  'kindergarten': {
    title: '🏢 공공기관 · 어린이집 친환경 마그네슘보드 공정',
    badge: '화재 안전 & 친환경 인증',
    steps: [
      { num: '01', title: '안전 기준 및 도면 검토', desc: '어린이집/유치원 소방 안전 기준 및 보육시설 환경 기준을 면밀히 검토합니다.' },
      { num: '02', title: '불연 마그네슘보드 정밀 가공', desc: '친환경 불연 마그네슘보드를 규격에 맞게 1:1 맞춤 재단합니다.' },
      { num: '03', title: '무독성 친환경 접착 및 튼튼한 고정', desc: '유해 물질 방출이 없는 친환경 접착제와 안전 고정 앵커로 견고하게 부착합니다.' },
      { num: '04', title: '모서리 완충 코너 가드 마감', desc: '아이들이 부딪혀도 다치지 않도록 모서리마다 둥근 안전 가드로 꼼꼼하게 마감합니다.' }
    ]
  }
};

function openServiceModal(serviceKey) {
  const data = serviceModalData[serviceKey];
  if (!data) return;

  const modal = document.getElementById('service-modal');
  const body = document.getElementById('modal-body-content');

  let stepsHtml = data.steps.map(s => `
    <div class="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
      <span class="w-8 h-8 rounded-lg wood-gradient text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
        ${s.num}
      </span>
      <div>
        <h5 class="text-sm font-bold text-white mb-0.5">${s.title}</h5>
        <p class="text-xs text-slate-400 leading-relaxed">${s.desc}</p>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="inline-block bg-amber-500/20 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30 mb-2">
      ${data.badge}
    </div>
    <h3 class="text-xl font-extrabold text-white mb-4">${data.title}</h3>
    <div class="space-y-2.5 mb-6">
      ${stepsHtml}
    </div>
    <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
      <button onclick="closeServiceModal()" class="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">
        닫기
      </button>
      <a href="#estimate" onclick="closeServiceModal(); selectServiceInEstimate('${serviceKey}')" class="px-5 py-2 rounded-lg wood-gradient text-white text-xs font-extrabold shadow glow-wood">
        이 공정으로 견적 문의
      </a>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  const modal = document.getElementById('service-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('service-modal');
  if (e.target === modal) {
    closeServiceModal();
  }
});

/* ============================================================
   6. FAQ Accordion Toggle
   ============================================================ */
function toggleFaq(button) {
  const answer = button.nextElementSibling;
  const icon = button.querySelector('i');
  
  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
  } else {
    answer.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
  }
}
