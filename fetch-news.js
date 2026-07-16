const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  timeout: 15000
});

// ================ دسته‌بندی با کلمات کلیدی ================
const categories = {
  "سیاسی": [
    "سیاست", "رئیسی", "وزیر", "رئیس‌جمهور", "مجلس", "نماینده", "انتخابات",
    "جنگ", "غزه", "فلسطین", "اسرائیل", "حماس", "حزب‌الله", "لبنان", "سوریه",
    "آمریکا", "روسیه", "چین", "انگلیس", "فرانسه", "آلمان", "ترکیه", "عربستان",
    "آتش‌بس", "صلح", "درگیری", "عملیات", "شهادت", "ترور", "موشک", "هواپیما",
    "خارجی", "سفارت", "کنگره", "پارلمان", "تحریم", "مذاکره", "برجام"
  ],
  "اقتصادی": [
    "اقتصاد", "دلار", "طلا", "سکه", "ارز", "بانک", "پول", "بورس", "سهام",
    "قیمت", "تورم", "گرانی", "ارزان", "کالا", "صادرات", "واردات", "نفت",
    "گاز", "پتروشیمی", "معادن", "صنعت", "کشاورزی", "بازار", "تجارت",
    "بودجه", "مالیات", "یارانه", "فقر", "اشتغال"
  ],
  "ورزشی": [
    "ورزش", "فوتبال", "تیم ملی", "استقلال", "پرسپولیس", "سپاهان", "تراکتور",
    "لیگ برتر", "جام جهانی", "المپیک", "کشتی", "وزنه‌برداری", "والیبال",
    "بسکتبال", "تنیس", "شطرنج", "قهرمانی", "مسابقه", "گل", "دربی",
    "المپیک", "پارالمپیک", "مدال", "مربی", "داور"
  ],
  "فرهنگی و هنری": [
    "فیلم", "سینما", "تلویزیون", "سریال", "هنر", "موسیقی", "کنسرت", "خواننده",
    "بازیگر", "کارگردان", "نمایش", "تئاتر", "کتاب", "نویسنده", "شعر", "ادبیات",
    "جشنواره", "فرهنگ", "هنرمند", "جوایز", "نگارخانه", "موزه", "عروسکی"
  ],
  "اجتماعی": [
    "آموزش", "دانشگاه", "مدرسه", "دانش‌آموز", "دانشجو", "تحصیل", "کنکور",
    "بیمه", "درمان", "سلامت", "بیمارستان", "پزشک", "دارو", "واکسن",
    "حوادث", "تصادف", "زلزله", "سیل", "آتش‌سوزی", "نجات", "جاده",
    "ازدواج", "طلاق", "جمعیت", "مهاجرت", "کار", "بیکاری", "حقوق",
    "آسیب‌های اجتماعی", "اعتیاد", "فقر", "مسکن"
  ],
  "علمی و فناوری": [
    "فناوری", "علم", "فضا", "ماهواره", "موشک", "رایانه", "هوش مصنوعی",
    "پزشکی", "پژوهش", "تحقیق", "کشف", "اختراع", "نوآوری", "دانشگاه",
    "اینترنت", "موبایل", "تلفن", "نرم‌افزار", "سخت‌افزار", "ربات",
    "نانو", "زیست‌فناوری", "هسته‌ای", "انرژی", "نوین"
  ],
  "بین‌الملل": [
    "جهان", "بین‌الملل", "سازمان ملل", "یونسکو", "یورو", "اروپا",
    "آسیا", "آفریقا", "آمریکای لاتین", "کانادا", "استرالیا", "ژاپن",
    "کره", "هند", "پاکستان", "افغانستان", "عراق", "یمن", "قطر", "امارات",
    "شیخ", "امیر", "پادشاه", "سلطان", "دبیرکل"
  ]
};

// تابع تشخیص دسته‌بندی خبر
function detectCategory(title) {
  const lowerTitle = title.toLowerCase();
  const scores = {};
  
  for (const [category, keywords] of Object.entries(categories)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        scores[category] += 1;
      }
    }
  }
  
  let bestCategory = "متفرقه";
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return maxScore > 0 ? bestCategory : "متفرقه";
}

// ================ منابع ================
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
    url: "https://www.tasnimnews.com/fa/rss/feed/0/0/0/0"
  },
  {
    name: "فارس",
    url: "https://www.farsnews.ir/rss"
  }
];

// منابع پشتیبان
const backupSources = [
  {
    name: "تسنیم",
    url: "https://www.tasnimnews.com/fa/rss"
  },
  {
    name: "فارس",
    url: "https://farsnews.ir/rss"
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
  console.log("📰 در حال دریافت اخبار ایران...");
  
  let allNews = [];
  const failedSources = [];

  // دریافت از منابع اصلی
  for (const source of sources) {
    try {
      const feed = await fetchWithRetry(source.url);
      
      feed.items.slice(0, 20).forEach(item => {
        if (!item.title || !item.link) return;
        
        const title = item.title.trim();
        const category = detectCategory(title);
        
        allNews.push({
          title: title,
          link: item.link.startsWith("http") ? item.link : "#",
          date: item.pubDate || item.isoDate || "",
          source: source.name,
          category: category
        });
      });
      
      console.log(`✅ ${source.name} دریافت شد`);
    } catch (e) {
      console.log(`❌ ${source.name} ناموفق: ${e.message}`);
      failedSources.push(source.name);
    }
  }

  // منابع پشتیبان
  for (const backup of backupSources) {
    if (failedSources.includes(backup.name)) {
      try {
        const feed = await fetchWithRetry(backup.url);
        feed.items.slice(0, 20).forEach(item => {
          if (!item.title || !item.link) return;
          const title = item.title.trim();
          const category = detectCategory(title);
          allNews.push({
            title: title,
            link: item.link.startsWith("http") ? item.link : "#",
            date: item.pubDate || item.isoDate || "",
            source: backup.name,
            category: category
          });
        });
        console.log(`✅ ${backup.name} (پشتیبان) دریافت شد`);
        const index = failedSources.indexOf(backup.name);
        if (index > -1) failedSources.splice(index, 1);
      } catch (e) {
        console.log(`❌ ${backup.name} (پشتیبان) نیز ناموفق بود`);
      }
    }
  }

  // پردازش نهایی
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
    .slice(0, 50);

  if (allNews.length === 0) {
    console.log("⚠️ هیچ خبری دریافت نشد!");
    return;
  }

  // ================ دسته‌بندی اخبار ================
  const categorizedNews = {};
  for (const news of allNews) {
    if (!categorizedNews[news.category]) {
      categorizedNews[news.category] = [];
    }
    categorizedNews[news.category].push(news);
  }

  // ================ ساخت فایل news.json ================
  const jsonData = {
    lastUpdate: new Date().toISOString(),
    lastUpdatePersian: new Date().toLocaleString("fa-IR"),
    totalNews: allNews.length,
    failedSources: failedSources,
    categories: Object.keys(categorizedNews),
    news: allNews,
    categorizedNews: categorizedNews
  };

  fs.writeFileSync("news.json", JSON.stringify(jsonData, null, 2), "utf8");
  console.log(`✅ news.json با ${allNews.length} خبر ذخیره شد`);

  // ================ ساخت index.html با دسته‌بندی ================
  let html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>اخبار دسته‌بندی شده ایران - دیار قدمگاه</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:tahoma;background:#f0f2f5;padding:10px}
.box{max-width:900px;margin:auto}
.header{background:#b30000;color:white;padding:15px;border-radius:12px;font-size:20px;font-weight:bold;text-align:center}
.category-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0;justify-content:center}
.category-tab{background:#eee;padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;transition:all 0.3s;border:none}
.category-tab:hover{background:#ddd}
.category-tab.active{background:#b30000;color:white}
.category-section{margin-top:15px}
.category-title{background:#b30000;color:white;padding:10px 15px;border-radius:8px;font-size:16px;font-weight:bold;margin-bottom:10px}
.card{background:white;margin-top:8px;padding:12px 15px;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.1);transition:transform 0.2s}
.card:hover{transform:scale(1.01)}
.card .title{font-weight:bold;font-size:15px;line-height:1.6}
.card .title a{color:#222;text-decoration:none}
.card .title a:hover{color:#b30000}
.card .meta{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:12px}
.card .source{color:#b30000}
.card .date{color:#888}
.footer{text-align:center;color:#888;margin:20px 0;font-size:13px}
.count-badge{display:inline-block;background:#fff;color:#b30000;padding:2px 12px;border-radius:20px;font-size:14px;margin-right:10px}
.hidden{display:none}
@media(max-width:600px){.card{padding:10px}.card .title{font-size:13px}}
</style>
</head>
<body>
<div class="box">
<div class="header">
📰 اخبار دسته‌بندی شده ایران | دیار قدمگاه
<span class="count-badge">${allNews.length} خبر</span>
</div>

<div class="category-tabs">
  <button class="category-tab active" onclick="filterCategory('all')">📋 همه</button>
  ${Object.keys(categorizedNews).map(cat => 
    `<button class="category-tab" onclick="filterCategory('${cat}')">${cat}</button>`
  ).join('')}
</div>

<div id="news-container">`;

  // نمایش همه اخبار
  for (const [category, newsList] of Object.entries(categorizedNews)) {
    html += `
  <div class="category-section" data-category="${category}">
    <div class="category-title">📌 ${category} <span style="font-size:13px;background:#fff;color:#b30000;padding:0 10px;border-radius:12px;margin-right:8px;">${newsList.length}</span></div>`;
    
    for (const news of newsList) {
      const dateDisplay = news.date && !isNaN(new Date(news.date))
        ? new Date(news.date).toLocaleString("fa-IR")
        : "";
      html += `
    <div class="card">
      <div class="title"><a href="${news.link}" target="_blank">${news.title}</a></div>
      <div class="meta">
        <span class="source">📰 ${news.source}</span>
        ${dateDisplay ? `<span class="date">🕐 ${dateDisplay}</span>` : ''}
      </div>
    </div>`;
    }
    html += `
  </div>`;
  }

  html += `
</div>

<div class="footer">
🔄 آخرین بروزرسانی: ${new Date().toLocaleString("fa-IR")}<br>
${failedSources.length ? `⚠️ ${failedSources.join('، ')} در دسترس نیستند` : '✅ همه منابع فعال هستند'}
</div>
</div>

<script>
function filterCategory(category) {
  document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.category-tab').forEach(tab => {
    if (tab.textContent.includes(category === 'all' ? 'همه' : category)) {
      tab.classList.add('active');
    }
  });
  
  document.querySelectorAll('.category-section').forEach(section => {
    if (category === 'all' || section.dataset.category === category) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
}
</script>

</body>
</html>`;

  fs.writeFileSync("index.html", html, "utf8");
  console.log(`✅ index.html با ${allNews.length} خبر ذخیره شد`);

  // ================ ساخت news.html ================
  fs.writeFileSync("news.html", html, "utf8");
  console.log(`✅ news.html با ${allNews.length} خبر ذخیره شد`);

  // ================ ساخت news-ticker.html ================
  const tickerHtml = `<!DOCTYPE html>
<html>
<head>
<style>
.news-ticker {
  direction: rtl;
  font-family: Tahoma, sans-serif;
  background: #b30000;
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}
.news-ticker-content {
  display: inline-block;
  animation: tickerScroll 40s linear infinite;
}
.news-ticker-content a {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  font-size: 13px;
}
.news-ticker-content a:hover {
  text-decoration: underline;
}
.news-ticker .category-badge {
  background: rgba(255,255,255,0.2);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  margin-left: 5px;
}
.news-ticker .separator {
  color: #ff6b6b;
  margin: 0 8px;
}
@keyframes tickerScroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.news-ticker:hover .news-ticker-content {
  animation-play-state: paused;
}
</style>
</head>
<body>
<div class="news-ticker">
  <div class="news-ticker-content">
    ${allNews.map(n => 
      `<a href="${n.link}" target="_blank"><span class="category-badge">${n.category}</span> ${n.title}</a><span class="separator">|</span>`
    ).join('')}
    <span style="color:#ff6b6b;">●</span>
    آخرین بروزرسانی: ${new Date().toLocaleString("fa-IR")}
  </div>
</div>
</body>
</html>`;

  fs.writeFileSync("news-ticker.html", tickerHtml, "utf8");
  console.log(`✅ news-ticker.html با ${allNews.length} خبر ذخیره شد`);
  
  console.log("🎉 عملیات با موفقیت کامل شد!");
}

getNews().catch(err => {
  console.error("❌ خطا:", err.message);
  process.exit(1);
});
