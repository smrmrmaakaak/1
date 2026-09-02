// api/likes.js
// Vercel Serverless Function - Persistent Likes Counter

const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a01a97bf99526a';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0'
};

async function getCloudData() {
  try {
    const res = await fetch(CLOUD_DB_URL, { headers: HEADERS });
    if (!res.ok) return { estimates: [], likes: { ep1: 1250, ep2: 986, ep3: 1412, ep4: 890, ep5: 1074 } };
    const json = await res.json();
    return json.data || { estimates: [], likes: { ep1: 1250, ep2: 986, ep3: 1412, ep4: 890, ep5: 1074 } };
  } catch (err) {
    return { estimates: [], likes: { ep1: 1250, ep2: 986, ep3: 1412, ep4: 890, ep5: 1074 } };
  }
}

async function saveCloudData(data) {
  try {
    const payload = {
      name: 'homemaster82_cloud_db_v1',
      data: data
    };
    await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Cloud DB Save Error:', err);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const cloudData = await getCloudData();
  let likes = cloudData.likes || { ep1: 1250, ep2: 986, ep3: 1412, ep4: 890, ep5: 1074 };

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: likes
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    const { ep_id } = body || {};

    if (ep_id) {
      likes[ep_id] = (likes[ep_id] || 1000) + 1;
      cloudData.likes = likes;
      await saveCloudData(cloudData);

      return res.status(200).json({
        success: true,
        ep_id: ep_id,
        like_count: likes[ep_id]
      });
    }

    return res.status(200).json({ success: true, data: likes });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
