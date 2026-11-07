/**
 * Vercel Serverless Function: /api/scan.js
 * Chạy trên máy chủ Vercel (Node.js) giúp quét danh sách video Fanpage công khai
 * hoặc gọi Meta Graph API mà không bị trình duyệt chặn CORS.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const page = (req.query.page || "").trim();
  const token = (req.query.token || process.env.FB_ACCESS_TOKEN || "").trim();
  const cookie = (req.headers["x-fb-cookie"] || process.env.FB_COOKIE || "").trim();

  if (!page) {
    return res.status(400).json({ error: "Thiếu tên hoặc ID Fanpage" });
  }

  try {
    // 1. Nếu có Access Token -> Gọi Meta Graph API v19.0
    if (token) {
      const apiUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(page)}/videos?fields=id,title,description,created_time,permalink_url,views,likes.summary(true),comments.summary(true)&limit=50&access_token=${encodeURIComponent(token)}`;
      const r = await fetch(apiUrl);
      const data = await r.json();
      return res.status(200).json({ source: "graph_api", data: data.data || [] });
    }

    // 2. Quét trực tiếp trang Fanpage công khai từ máy chủ Vercel
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
    };
    if (cookie) headers["Cookie"] = cookie;

    const targetUrl = `https://www.facebook.com/${encodeURIComponent(page)}/videos`;
    const htmlResp = await fetch(targetUrl, { headers });
    const html = await htmlResp.text();

    const regex = /\/(?:videos|reel)\/(\d{8,22})/g;
    const ids = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (!ids.includes(match[1])) ids.push(match[1]);
      if (ids.length >= 50) break;
    }

    const videos = ids.map(id => ({
      id,
      permalink_url: `https://www.facebook.com/${page}/videos/${id}`,
      title: `Video #${id} (${page})`,
      created_time: null,
      views: null
    }));

    return res.status(200).json({ source: "public_html", data: videos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
