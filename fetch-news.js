const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser();

async function getNews() {
  console.log("Fetching Iran news...");

  const url =
    "https://news.google.com/rss/search?q=ایران+OR+خبر+فوری&hl=fa&gl=IR&ceid=IR:fa";

  const feed = await parser.parseURL(url);

  let html = `
<div style="
direction:rtl;
font-family:tahoma;
max-width:600px;
margin:20px auto;
padding:15px;
border:1px solid #ddd;
border-radius:10px;
background:#fff;
">
<h2 style="color:#c00;">📰 اخبار فوری ایران - دیار قدمگاه</h2>
<ul>
`;

  feed.items.slice(0,10).forEach(item => {
    html += `
<li style="margin-bottom:12px;">
<a href="${item.link}" target="_blank">
${item.title}
</a>
</li>
`;
  });

  html += `
</ul>
<p style="font-size:12px;color:#777;">
آخرین بروزرسانی: ${new Date().toLocaleString("fa-IR")}
</p>
</div>
`;

  fs.writeFileSync("news.html", html);

  console.log("News updated successfully.");
}

getNews();
