# 📰 دیار قدمگاه - اخبار فوری ایران

 aggregator خودکار اخبار ایران از ۵ منبع معتبر:

- **ایرنا** (IRNA)
- **ایسنا** (ISNA)  
- **مهر** (Mehr)
- **تسنیم** (Tasnim)
- **فارس** (Fars)

## 📁 خروجی‌ها

| فایل | توضیح |
|------|--------|
| `index.html` | صفحه اصلی با نمایش کامل اخبار |
| `news.html` | کپی از index.html برای سازگاری |
| `news.json` | داده‌های ساختاریافته برای API |
| `news-ticker.html` | نوار اخبار متحرک برای Blogfa |

## ⏰ بروزرسانی

هر ۳۰ دقیقه یکبار با GitHub Actions به‌طور خودکار بروز می‌شود.

## 🚀 استفاده در Blogfa

### نوار اخبار متحرک:
```html
<iframe src="news-ticker.html" style="width:100%;height:50px;border:none;overflow:hidden;"></iframe>
