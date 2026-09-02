import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rssUrl = 'https://rss.blog.naver.com/home_master82.xml';

    const xmlData = await new Promise((resolve, reject) => {
      https.get(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Simple XML Regex Parsing for RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(xmlData)) !== null) {
      const itemContent = match[1];

      const getTag = (tag) => {
        const cdataMatch = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(itemContent);
        if (cdataMatch) return cdataMatch[1].trim();
        const normalMatch = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(itemContent);
        return normalMatch ? normalMatch[1].trim() : '';
      };

      const title = getTag('title');
      const link = getTag('link');
      const desc = getTag('description').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const pubDate = getTag('pubDate');

      // Category detection
      let category = '기타 집수리';
      let tagBadge = '현장 시공';
      let repairTypeSelect = '기타 집수리 & 맞춤제작';

      if (title.includes('사각') || title.includes('싱크볼') || title.includes('싱크대')) {
        category = '사각싱크볼';
        tagBadge = '🍳 사각싱크볼';
        repairTypeSelect = '사각싱크볼 교체 & 상판 타공';
      } else if (title.includes('식기세척기') || title.includes('식세기') || title.includes('냉장고장') || title.includes('홈바')) {
        category = '식세기/장공사';
        tagBadge = '🍽️ 식세기/수납장';
        repairTypeSelect = '식기세척기 하부장 리폼';
      } else if (title.includes('아트월') || title.includes('목공') || title.includes('철거') || title.includes('대리석')) {
        category = '아트월/목공';
        tagBadge = '🧱 아트월/목공';
        repairTypeSelect = '아트월 & 맞춤 목공';
      } else if (title.includes('문짝') || title.includes('천장') || title.includes('도어') || title.includes('방범창') || title.includes('누수')) {
        category = '문짝/천장/수리';
        tagBadge = '🚪 문짝/천장수리';
        repairTypeSelect = '처진 문짝 교정 & 필름';
      }

      // Format date: e.g. "2026.08.17"
      let formattedDate = '최신 시공기';
      if (pubDate) {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) {
          formattedDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
        }
      }

      if (title && link) {
        items.push({
          title,
          link,
          desc: desc.substring(0, 160) + (desc.length > 160 ? '...' : ''),
          pubDate: formattedDate,
          category,
          tagBadge,
          repairTypeSelect
        });
      }
    }

    return res.status(200).json({
      success: true,
      total: items.length,
      posts: items
    });
  } catch (error) {
    console.error('RSS Fetch error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
