# دعوت‌نامه‌ی قرار برای GitHub Pages

یک دعوت‌نامه‌ی تعاملی و موبایل‌محور با چهار مرحله:

1. پاسخ بازیگوشانه به دعوت
2. انتخاب تاریخ و ساعت
3. انتخاب خوراکی
4. نمایش خلاصه و ذخیره در تقویم

این پروژه React یا مرحله‌ی build ندارد و با HTML، CSS و JavaScript خالص اجرا می‌شود.

## پیش‌نمایش محلی

```bash
python3 -m http.server 4173
```

سپس به `http://localhost:4173` بروید.

## انتشار رایگان روی GitHub Pages

با هر push روی شاخه‌ی `main`، گردش‌کار
`.github/workflows/pages.yml` فایل‌های سایت را مستقیماً از ریشه‌ی پروژه منتشر می‌کند.

در مخزن GitHub فقط کافی است از مسیر زیر، منبع انتشار را روی GitHub Actions بگذارید:

`Settings → Pages → Build and deployment → Source → GitHub Actions`
