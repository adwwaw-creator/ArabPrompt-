# ArabPrompt Cloud Functions - Backend Gemini Proxy
# الخادم السحابي الخلفي الآمن لحماية مفاتيح الذكاء الاصطناعي (Cloud Functions)

هذا المجلد (`functions/`) يحتوي على دوال سحابية بدون خادم (Serverless Cloud Functions) مبنية بـ Node.js و TypeScript باستخدام الجيل الحديث من **Firebase Functions v2** ومكتبة `@google/genai`.

---

## 🔒 لماذا هذا المجلد ولماذا تم بناؤه؟ (The Security Architecture)

1. **حماية مفتاح الـ API بشكل نهائي من التسريب (Zero Client-Side Exposure):**
   - في الواجهات الأمامية (Frontend)، إذا تم وضع مفتاح الـ API داخل كود المتصفح، يمكن لأي شخص استخراجه من أدوات فحص المطور (Inspect / Network tab) واستخدامه لتوليد مقاطع فيديو أو نصوص مكلفة على حسابك.
   - هذا المجلد يعمل كـ **وسيط أمني (Backend Proxy)**: الواجهة الأمامية ترسل الطلب فقط إلى الخادم السحابي، والخادم السحابي هو الوحيد الذي يمتلك المفتاح السري، ويتصل بـ Gemini ثم يعيد النتيجة الآمنة إلى المتصفح.

2. **درع الحماية من الفواتير غير المتوقعة (Billing & Model Firewall):**
   - تم تزويد هذا البروكسي بحاجز أمني يمنع تماماً استدعاء نماذج الفيديو الباهظة مثل `Veo` أو `gemini-omni-1.1-flash` (التي سببت سابقاً خصم الـ 12.44$).
   - النماذج المصرح بها محصورة في النماذج الفعالة اقتصادياً والمجانية (مثل `gemini-3.8-flash` و `gemini-3.1-flash-lite`).

---

## 📦 محتويات الدوال المتاحة (Available Cloud Endpoints)

| الدالة (Function) | الطريقة (Method) | الوصف |
| :--- | :--- | :--- |
| `/api/generate-prompt` | `POST` | هندسة البرومبت وتوليد الخيارين (المباشر والمطور بالكامل) |
| `/api/refine-prompt` | `POST` | تنقيح وتوسيع مسودة الأمر وتزويده بالقيود الهندسية |
| `/api/translate-prompt` | `POST` | ترجمة الأوامر العربية لهندسة برومبتات إنجليزية احترافية |
| `/api/reverse-prompt` | `POST` | فك تشفير الصور واستخلاص البصمة البصرية والـ DNA والألوان |
| `/api/suggest-tags` | `POST` | تصنيف وتحليل محتوى الأوامر وتوليد وسوم ذكية |
| `/api/cinema-generate-story` | `POST` | تفكيك الأفكار إلى مشاهد سينمائية ومثبت ملامح شخصية موحد |
| `/api/health` | `GET` | فحص صحة الخدمة والتأكد من إعداد المفتاح دون كشفه |

---

## 🚀 كيفية التثبيت والنشر إلى الإنتاج (Deployment Guide)

### 1. تثبيت الحزم محلياً:
```bash
cd functions
npm install
```

### 2. تخزين مفتاح API في مدير الأسرار السحابي (Google Cloud Secret Manager):
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
*(أدخل مفتاح Gemini API الجديد والمحمي عند السؤال)*

### 3. بناء الكود ونشر الدوال إلى Firebase:
```bash
npm run build
firebase deploy --only functions
```

---

## 💻 التشغيل والتجربة في بيئة التطوير المحلية (Local Emulation)

إذا كنت ترغب في تجربة الدوال محلياً قبل نشرها:
1. انسخ ملف المتغيرات:
   ```bash
   cp .env.example .env
   ```
2. ضع مفتاحك التجريبي في ملف `.env`.
3. شغل المحاكي السحابي:
   ```bash
   npm run serve
   ```
ستحصل على رابط محلي مثل `http://127.0.0.1:5001/<project-id>/us-central1/api` يمكنك توجيه الواجهة الأمامية إليه مباشرة.
