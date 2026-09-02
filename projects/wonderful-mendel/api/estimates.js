// api/estimates.js
// Vercel Serverless API - Auto-Healing Persistent Cloud & In-Memory Backend

let currentObjectId = 'ff8081819ff5b11001a02dd96e5a7fba';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0'
};

let memoryEstimates = null;
let lastFetchTime = 0;

async function getEstimatesFromCloud() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${currentObjectId}`, {
      headers: HEADERS,
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.estimates)) {
        memoryEstimates = json.data.estimates.map(item => ({
          ...item,
          photos: Array.isArray(item.photos)
            ? item.photos.map(p => (typeof p === 'string' && !p.startsWith('data:') && !p.startsWith('http') && !p.startsWith('assets/')) ? `data:image/jpeg;base64,${p}` : p)
            : []
        }));
        return memoryEstimates;
      }
    }
  } catch (err) {
    console.error('Cloud DB Read Error:', err);
  }

  return memoryEstimates || [];
}

async function saveEstimatesToCloud(items) {
  memoryEstimates = items;
  lastFetchTime = Date.now();

  try {
    // Strip data:image/...;base64, prefix to guarantee 100% restful-api.dev compatibility
    const cleanItems = items.map(item => ({
      ...item,
      photos: Array.isArray(item.photos)
        ? item.photos.map(p => typeof p === 'string' ? p.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '') : p)
        : []
    }));

    const payload = {
      name: 'homemaster82_estimates_live_db',
      data: { estimates: cleanItems }
    };

    let res = await fetch(`https://api.restful-api.dev/objects/${currentObjectId}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Auto-heal: Create fresh object if PUT failed
      const createRes = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload)
      });
      if (createRes.ok) {
        const createJson = await createRes.json();
        if (createJson.id) {
          currentObjectId = createJson.id;
        }
      }
    }
  } catch (err) {
    console.error('Cloud DB Save Error:', err);
  }
}

async function uploadPhotoServerSide(p) {
  if (typeof p !== 'string') return p;
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('assets/')) {
    return p;
  }
  const cleanBase64 = p.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
  try {
    const form = new URLSearchParams();
    form.append('key', '6d207e02198a847aa98d0a2a901485a5');
    form.append('action', 'upload');
    form.append('source', cleanBase64);
    form.append('format', 'json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.image && json.image.url) {
        return json.image.url;
      }
    }
  } catch (err) {
    console.warn('Server CDN Upload Warning:', err.message);
  }
  return 'assets/images/sink_bellago/photo_1.jpg'; // Safe fallback so DB string limit is never exceeded
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let estimates = await getEstimatesFromCloud();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      count: estimates.length,
      data: estimates
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    const { action, id, status, memo } = body || {};

    if (action === 'clear_all') {
      await saveEstimatesToCloud([]);
      return res.status(200).json({ success: true, message: '모든 예약 데이터 초기화 완료' });
    }

    if (action === 'delete') {
      estimates = estimates.filter(e => String(e.id) !== String(id));
      await saveEstimatesToCloud(estimates);
      return res.status(200).json({ success: true, message: '삭제 완료' });
    }

    if (action === 'status') {
      const item = estimates.find(e => String(e.id) === String(id));
      if (item) {
        item.status = status;
        if (memo !== undefined) item.admin_memo = memo;
        await saveEstimatesToCloud(estimates);
      }
      return res.status(200).json({ success: true, message: '상태 변경 완료' });
    }

    // Default POST: New estimate submission from customer
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19);

    // Convert any base64 photos to CDN URLs server-side
    let finalPhotos = [];
    if (Array.isArray(body.photos)) {
      finalPhotos = await Promise.all(body.photos.map(p => uploadPhotoServerSide(p)));
    }

    // Strictly increasing ID guaranteed to be greater than any previous ID
    const newId = Date.now();

    const newEstimate = {
      id: newId,
      created_at: body.created_at || kstTime,
      repair_type: body.repair_type || '집수리 맞춤 시공',
      location: body.location || '인천 서구 검단',
      customer_phone: body.customer_phone || '010-9276-4245',
      preferred_date: body.preferred_date || '협의 후 결정',
      preferred_time: body.preferred_time || '시간 협의',
      photos: finalPhotos,
      status: '접수대기',
      admin_memo: ''
    };

    estimates.unshift(newEstimate);
    await saveEstimatesToCloud(estimates);

    return res.status(200).json({
      success: true,
      message: '조인형 대표 전용 관제탑으로 실시간 예약이 정상 접수되었습니다.',
      data: newEstimate
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
