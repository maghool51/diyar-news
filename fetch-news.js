const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser();

async function getNews() {
  console.log("Fetching Iran news...");

  const query = encodeURIComponent("ایران OR خبر فوری");
  const url = `https://news.google.com/rss/search?q=${query}&hl=fa&gl=IR&ceid=IR:fa`;

  const feed = await parser.parseURL(url);

  let html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>اخبار فوری ایران</title>
</head>

<body style="font-family:tahoma;background:#f5f5f5;">

<div style="
max-width:650px;
margin:20px auto;
background:white;
padding:15px;
border-radius:12px;
">

<h2 style="color:#c00;">
🚨 اخبار فوری ایران | دیار قدمگاه
</h2>

<ul>
`;

  feed.items.slice(0, 10).forEach(item => {
    html += `
<li style="margin:15px 0;">
<a href="${item.link}" target="_blank">
${item.title}
</a>
</li>
`;
  });

  html += `
</ul>

<p style="color:#777;font-size:12px;">
آخرین بروزرسانی: ${new Date().toLocaleString("fa-IR")}
</p>

</div>

</body>
</html>
`;

  fs.writeFileSync("news.html", html, "utf8");

  console.log("News updated successfully.");
}

getNews().catch(err => {
  console.error(err);
  process.exit(1);
});
