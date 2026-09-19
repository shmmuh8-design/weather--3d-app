# محطة الرصد ثلاثية الأبعاد

تطبيق ويب تفاعلي (PWA) لعرض درجة الحرارة والرطوبة وسرعة الرياح واتجاهها بأيقونات ثلاثية الأبعاد، مع بيانات حية من [Open-Meteo](https://open-meteo.com).

## عرض الموقع
فعّل GitHub Pages من: Settings → Pages → Branch: main → / (root)

## الإشعارات الحقيقية (تعمل حتى مع إغلاق الموقع)
تُرسل عبر [ntfy.sh](https://ntfy.sh) بواسطة GitHub Actions يعمل كل ١٥ دقيقة (`.github/workflows/weather-notify.yml`).

### الإعداد
1. من إعدادات المستودع: **Settings → Secrets and variables → Actions → Variables** أضف:
   - `NTFY_TOPIC` — اسم فريد وسرّي (مثال: `weather-salem-ddf80910`)
   - `CITY_NAME` — اسم المدينة (مثال: `مسقط`)
   - `CITY_LAT` — خط العرض (مثال: `23.588`)
   - `CITY_LON` — خط الطول (مثال: `58.3829`)
2. ثبّت تطبيق **ntfy** على هاتفك (متوفر لـ iOS و Android) واشترك في نفس اسم `NTFY_TOPIC`.
3. من تبويب **Actions** في GitHub، شغّل workflow "Weather Notify" يدويًا أول مرة (Run workflow) للتأكد من عمله.

⚠️ موضوع ntfy عام افتراضيًا (أي شخص يعرف الاسم يمكنه الاشتراك) — اختر اسمًا عشوائيًا وطويلًا وليس شيئًا يسهل تخمينه.

## الملفات
- `index.html` — التطبيق الكامل (React عبر CDN، بدون خطوة بناء)
- `manifest.json` — إعدادات التثبيت كتطبيق (PWA)
- `icon.svg` — أيقونة التطبيق
- `sw.js` — Service Worker للعمل بدون اتصال
- `scripts/check-weather.mjs` — سكربت فحص الطقس وإرسال إشعار ntfy
- `.github/workflows/weather-notify.yml` — الجدولة التلقائية عبر GitHub Actions
