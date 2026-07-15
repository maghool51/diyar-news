const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser();

async function getNews() {

  console.log("Fetching Iran news...");

  const query = encodeURIComponent(
    "ایران OR خبر فوری OR اخبار ایران"
  );

  const url =
    `https://news.google.com/rss/search?q=${query}&hl=fa&gl=IR&ceid=IR:fa`;

  const feed = await parser.parseURL(url);

  const keywords = [
    "ایران",
    "فوری",
    "لحظه",
    "دولت",
    "رئیس",
    "وزیر",
    "مجلس",
    "بانک",
    "اقتصاد",
    "قیمت",
    "بازار",
    "استان",
    "گرگان"
  ];

  const news = feed.items
    .filter(item => {
      const text = item.title || "";

      // حذف خبرهای انگلیسی
      if (!/[\u0600-\u06FF]/.test(text)) {
        return false;
      }

      return true;
    })
    .map(item => {

      let score = 0;

      keywords.forEach(k => {
        if (item.title.includes(k)) {
          score++;
        }
      });

      return {
        title: item.title,
        link: item.link,
        date: item.pubDate,
        score
      };

    })
    .sort((a,b)=> b.score - a.score)
    .slice(0,12);


  let html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>اخبار فوری ایران</title>

<style>

body{
background:#f3f3f3;
font-family:tahoma;
margin:0;
padding:10px;
}

.box{
max-width:650px;
margin:auto;
}

.header{
background:#b30000;
color:white;
padding:15px;
border-radius:12px;
font-size:20px;
font-weight:bold;
}

.card{
background:white;
margin-top:12px;
padding:15px;
border-radius:12px;
box-shadow:0 2px 6px #ccc;
}

a{
color:#222;
text-decoration:none;
font-size:16px;
font-weight:bold;
}

.time{
font-size:12px;
color:#777;
margin-top:8px;
}

</style>

</head>


<body>

<div class="box">

<div class="header">
🚨 اخبار فوری ایران | دیار قدمگاه
</div>

`;

news.forEach(n => {

html += `

<div class="card">

<a href="${n.link}" target="_blank">
${n.title}
</a>

<div class="time">
${n.date || ""}
</div>

</div>

`;

});


html += `

<div class="time" style="text-align:center;margin:20px;">
آخرین بروزرسانی:
${new Date().toLocaleString("fa-IR")}
</div>

</div>

</body>
</html>

`;


fs.writeFileSync(
  "news.html",
  html,
  "utf8"
);


console.log("News updated successfully.");

}


getNews().catch(err=>{
console.error(err);
process.exit(1);
});
