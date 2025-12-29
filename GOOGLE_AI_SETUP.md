# 🔑 دليل إعداد Google AI Studio - خطوة بخطوة

## المشكلة الشائعة: "Invalid API key"

إذا واجهت هذا الخطأ، السبب غالباً:
- ❌ الـ API key غير مفعّل
- ❌ الـ Gemini API غير مُفعّلة في المشروع
- ❌ في حدود استخدام (quota limits)
- ❌ البيلينق (Billing) غير مفعّل (للنماذج المدفوعة)

---

## ✅ الحل الكامل

### الخطوة 1: تأكد من Google AI Studio

1. **افتح Google AI Studio:**
   - روح: [https://aistudio.google.com/](https://aistudio.google.com/)
   - سجل دخول بحساب Google

2. **جرّب النموذج مباشرة:**
   - في الصفحة الرئيسية، جرب كتابة أي سؤال
   - إذا اشتغل = حسابك شغال ✅
   - إذا ما اشتغل = في مشكلة بالحساب ❌

---

### الخطوة 2: تأكد من API Key

1. **افتح صفحة API Keys:**
   - [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **شوف الـ API Keys الموجودة:**
   - إذا في key موجود، تأكد إنه نفس اللي تستخدمه
   - إذا ما في، اضغط **"Create API key"**

3. **إنشاء API Key جديد (إذا لزم):**
   - اضغط **"Create API key"**
   - اختر **"Create API key in new project"** أو اختر مشروع موجود
   - انسخ الـ key الجديد **فوراً** (ما بيطلع مرة ثانية!)

---

### الخطوة 3: اختبر الـ API Key من المتصفح

افتح أي صفحة ويب وروح Console (F12)، ثم الصق هذا الكود:

```javascript
// استبدل YOUR_API_KEY بالـ key الحقيقي
const API_KEY = "AIzaSyCbYt-_9YvEs05FxQmq7FHOmqjB_9ZTVHU";

fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: "Say: API is working!" }]
    }]
  })
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.error("❌ ERROR:", data.error.message);
    console.error("Status:", data.error.status);

    if (data.error.status === "PERMISSION_DENIED") {
      console.log("\n🔍 الحل: الـ API key غير صالح أو الـ API غير مفعّلة");
      console.log("1. جرب إنشاء API key جديد");
      console.log("2. تأكد من تفعيل Gemini API في المشروع");
    } else if (data.error.status === "RESOURCE_EXHAUSTED") {
      console.log("\n🔍 الحل: وصلت لحد الاستخدام (Quota)");
      console.log("1. انتظر شوية وحاول مرة ثانية");
      console.log("2. أو فعّل البيلينق إذا تبي حد أعلى");
    }
  } else {
    console.log("✅ SUCCESS! API Key شغال:");
    console.log(data.candidates[0].content.parts[0].text);
  }
})
.catch(err => console.error("Network Error:", err));
```

---

### الخطوة 4: تفعيل الـ Gemini API (إذا لزم)

إذا طلع خطأ `PERMISSION_DENIED`:

1. **روح Google Cloud Console:**
   - [https://console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)

2. **دوّر على "Gemini API":**
   - في خانة البحث، اكتب: `Generative Language API`
   - أو: `Google AI API`

3. **فعّل الـ API:**
   - اضغط على الـ API
   - اضغط **"Enable"**
   - انتظر دقيقة لحد ما تتفعل

---

### الخطوة 5: تحقق من حدود الاستخدام (Quotas)

1. **روح Quotas:**
   - [https://console.cloud.google.com/iam-admin/quotas](https://console.cloud.google.com/iam-admin/quotas)

2. **شوف استخدامك:**
   - دوّر على "Generative Language API"
   - شوف كم باقي لك من الـ requests

3. **Free Tier Limits:**
   - Google AI Studio المجاني: **15 requests/minute** تقريباً
   - إذا وصلت للحد، انتظر دقيقة وجرب مرة ثانية

---

### الخطوة 6: تفعيل البيلينق (اختياري - للاستخدام المكثف)

إذا تبي حد أعلى:

1. **روح Billing:**
   - [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing)

2. **ربط بطاقة دفع:**
   - اضغط **"Link a billing account"**
   - أضف بطاقة ائتمان

**ملاحظة:** الـ free tier كافي للتجربة والاستخدام الخفيف!

---

## 🧪 اختبر من الموقع

بعد ما تتأكد من الإعدادات:

1. افتح: `http://localhost:3000/`
2. افتح Console (F12) → تبويب Console
3. حاول ترفع ملف PDF
4. شوف الرسائل في Console:
   - ✅ `✅ Gemini analysis successful!` = نجح!
   - ❌ `❌ File upload error:` = شوف التفاصيل

---

## 📊 أكثر الأخطاء شيوعاً والحلول

| الخطأ | السبب | الحل |
|-------|-------|------|
| `Invalid API key` | Key خاطئ أو غير مفعّل | جرب key جديد |
| `PERMISSION_DENIED` | API غير مفعّلة | فعّل Generative Language API |
| `RESOURCE_EXHAUSTED` | وصلت للحد الأقصى | انتظر دقيقة |
| `Model not found` | اسم الموديل خاطئ | استخدم `gemini-2.0-flash` |
| `Quota exceeded` | استخدام مكثف | انتظر أو فعّل البيلينق |

---

## 💡 نصائح

1. **استخدم Free Tier أول شي:**
   - كافي للتجربة
   - 15 requests/minute تقريباً
   - ما يحتاج بطاقة ائتمان

2. **للإنتاج (Production):**
   - فعّل البيلينق
   - استخدم backend API (مو frontend)
   - راقب الاستخدام

3. **Test قبل Deploy:**
   - تأكد كل شي شغال محلياً
   - بعدين انشر على Vercel

---

## 🆘 لو لسا ما اشتغل؟

إذا جربت كل شي وما اشتغل:

1. **انسخ الخطأ الكامل** من Console
2. **صوّر الشاشة** من Google AI Studio
3. **شارك التفاصيل** معنا

الخطأ الدقيق يساعدنا نحدد المشكلة بالضبط! 🔍
