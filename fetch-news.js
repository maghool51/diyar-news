const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser();

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


async function getNews() {

  console.log("Fetching Iranian news...");

  let allNews = [];

  for (const source of sources) {

    try {

      const feed = await parser.parseURL(source.url);

      feed.items.slice(0,10).forEach(item => {

        allNews.push({
          title: item.title,
          link: item.link,
          date: item.pubDate || "",
          source: source.name
        });

      });

      console.log(source.name + " OK");

    } catch(e) {

      console.log(source.name + " failed");

    }

  }


  allNews = allNews
    .filter(n => n.title && /[\u0600-\u06FF]/.test(n.title))
    .slice(0,20);



let html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>اخبار ایران - دیار قدمگاه</title>

<style>

body{
font-family:tahoma;
background:#f3f3f3;
padding:10px;
}

.box{
max-width:700px;
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

.title{
font-weight:bold;
font-size:16px;
}

.source{
color:#b30000;
font-size:13px;
margin-top:8px;
}

.date{
color:#777;
font-size:12px;
}

a{
color:#222;
text-decoration:none;
}

</style>

</head>

<body>

<div class="box">

<div class="header">
🚨 اخبار فوری ایران | دیار قدمگاه
</div>

`;


allNews.forEach(n => {

html += `

<div class="card">

<div class="title">
<a href="${n.link}" target="_blank">
${n.title}
</a>
</div>

<div class="source">
منبع: ${n.source}
</div>

<div class="date">
${n.date}
</div>

</div>

`;

});


html += `

<div style="text-align:center;color:#777;margin:20px;">
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


console.log("News created successfully");

}


getNews().catch(err=>{
console.error(err);
process.exit(1);
});
