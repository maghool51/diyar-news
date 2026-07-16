const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
  },
  timeout: 15000
});

const sources = [
  {
    name: "ایرنا",
    url: "https://www.irna.ir/rss"
  },
  {
    name: "ایسنا",
    url: "https://www.isna.ir/rss"
  },
  {
    name: "مهر",
    url: "https://www.mehrnews.com/rss"
  },
  {
    name: "تسنیم",
    url: "https://www.tasnimnews.com/fa/rss"
  },
  {
    name: "فارس",
    url: "https://www.farsnews.ir/rss"
  }
];

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await parser.parseURL(url);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

async function getNews() {
  console.log("در حال دریافت اخبار ایران...");
  
  let allNews = [];
  const failedSources = [];

  for (const source of sources) {
    try {
      const feed = await fetchWithRetry(source.url);
      
      feed.items.slice(0, 20).forEach(item => {
        // پیشنهاد ۱: فیلتر کردن لینک‌های نامعتبر
        if (!item.title || !item.link) return;
        
        allNews.push({
          title: item.title.trim(),
          link: item.link,
          date: item.pubDate || item.isoDate || "",
          source: source.name
        });
      });
      
      console.log(`✅ ${source.name} دریافت شد`);
    } catch (e) {
      console.log(`❌ ${source.name} ناموفق`);
      failedSources.push(source.name);
    }
  }

  // حذف اخبار تکراری با روش پیشرفته
  const seenTitles = new Set();
  allNews = allNews
    .filter(n => n.title && /[\u0600-\u06FF]/.test(n.title))
    .filter(n => {
      const key = n.title
        .replace(/\s+/g, " ")
        .replace(/[«»،:؛!?]/g, "")
        .trim()
        .toLowerCase();

      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    })
    .slice(0, 30);

  if (allNews.length === 0) {
    console.log("⚠️ هیچ خبری دریافت نشد!");
    return;
  }

  // ================ ساخت فایل news.json ================
  const jsonData = {
    lastUpdate: new Date().toISOString(),
    lastUpdatePersian: new Date().toLocaleString("fa-IR"),
    totalNews: allNews.length,
    failedSources: failedSources,
    news: allNews.map(n => ({
      title: n.title,
      link: n.link,
      date: n.date,
      source: n.source
    }))
  };

  fs.writeFileSync("news.json", JSON.stringify(jsonData, null, 2), "utf8");
  console.log(`✅ news.json با ${allNews.length} خبر ذخیره شد`);

  // ================ ساخت فایل news.html ================
  let html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>اخبار ایران - دیار قدمگاه</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:tahoma;background:#f0f2f5;padding:10px}
.box{max-width:700px;margin:auto}
.header{background:#b30000;color:white;padding:15px;border-radius:12px;font-size:20px;font-weight:bold;text-align:center}
.card{background:white;margin-top:12px;padding:15px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:transform 0.2s}
.card:hover{transform:scale(1.01)}
.title{font-weight:bold;font-size:16px;line-height:1.6}
.title a{color:#222;text-decoration:none}
.title a:hover{color:#b30000}
.source{color:#b30000;font-size:13px;margin-top:8px}
.date{color:#888;font-size:12px;margin-top:4px}
.footer{text-align:center;color:#888;margin:20px 0;font-size:13px}
.count-badge{display:inline-block;background:#fff;color:#b30000;padding:2px 12px;border-radius:20px;font-size:14px;margin-right:10px}
@media(max-width:600px){.card{padding:12px}.title{font-size:14px}}
</style>
</head>
<body>
<div class="box">
<div class="header">
🚨 اخبار فوری ایران | دیار قدمگاه
<span class="count-badge">${allNews.length} خبر</span>
</div>`;

  allNews.forEach(n => {
    html += `
<div class="card">
<div class="title"><a href="${n.link}" target="_blank">${n.title}</a></div>
<div class="source">📰 ${n.source}</div>
${n.date ? `<div class="date">🕐 ${new Date(n.date).toLocaleString("fa-IR")}</div>` : ''}
</div>`;
  });

  html += `
<div class="footer">
🔄 آخرین بروزرسانی: ${new Date().toLocaleString("fa-IR")}<br>
${failedSources.length ? `⚠️ ${failedSources.join('، ')} در دسترس نیستند` : '✅ همه منابع فعال هستند'}
</div>
</div>
</body>
</html>`;

  fs.writeFileSync("news.html", html, "utf8");
  console.log(`✅ news.html با ${allNews.length} خبر ذخیره شد`);
  console.log("🎉 عملیات با موفقیت کامل شد!");
}

getNews().catch(err => {
  console.error("❌ خطا:", err.message);
  process.exit(1);
});
