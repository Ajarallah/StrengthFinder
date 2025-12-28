
import { Language } from './types';

export const translations = {
  en: {
    appTitle: "StrengthsCoach AI",
    badge: "AI-Powered Coaching",
    uploadNew: "New Report",
    heroTitle: "Unlock your potential with",
    heroHighlight: "Expert AI Coaching",
    heroSubtitle: "Upload your official CliftonStrengths PDF report for deep, personalized, and actionable coaching.",
    trustedBy: "Trusted by 10k+ Leaders",
    themes: "themes",
    steps: {
      upload: "Upload",
      extract: "Extract",
      analyze: "Analyze",
      coach: "Coach"
    },
    progressSteps: {
      upload: "UPLOAD",
      extract: "EXTRACT",
      analyze: "ANALYZE",
      coach: "COACH"
    },
    themeToggle: {
      light: "Light Mode",
      dark: "Dark Mode"
    },
    features: {
      launch: { title: "Launch Potential", desc: "Turn talents into performance." },
      target: { title: "Target Success", desc: "Precision coaching for goals." },
      shine: { title: "Shine Bright", desc: "Stand out with your profile." },
      deepAnalysis: { title: "Deep Analysis", desc: "Understand the nuances of your themes." },
      blindSpots: { title: "Blind Spots", desc: "Identify risks and how to mitigate them." },
      habits: { title: "Action Plans", desc: "Daily habits to build true strength." },
      visualIntelligence: { title: "Visual Intelligence", desc: "We map your strategic thinking against your execution skills to reveal your unique \"Strength DNA\"." },
      personalCoach: { title: "Personal Coach", desc: "24/7 Guidance via Chat & Voice." }
    },
    upload: {
      title: "Upload Report",
      subtitle: "PDF only",
      button: "Select File",
      inputPlaceholder: "Upload PDF report to start analysis...",
      processing: "Analyzing report...",
      extracting: "Extracting your strengths data...",
      analyzing: "Analyzing your unique profile...",
      error: "Please upload a valid text-based PDF.",
      errorFriendlyTitle: "Hmm, we couldn't read that file",
      errorFriendlyBody: "Make sure you're uploading the official CliftonStrengths PDF report (not a screenshot or image).",
      errorSuggestions: [
        "Check that the file is not corrupted",
        "Try downloading the report again from Gallup",
        "Contact support if the issue persists"
      ],
      supported: "CliftonStrengths Top 5 • CliftonStrengths 34",
      privacy: "Processed securely in your browser.",
      secureBadge: "Your data is encrypted and private"
    },
    profile: {
      title: "Profile Summary",
      top5: "Top 5 Themes",
      full34: "Full 34 Profile",
      listView: "List View",
      chartView: "Chart View",
      chartPlaceholder: "Visual analytics coming soon. Your strengths will be displayed as interactive charts.",
      domainDistribution: "Domain Distribution",
      profileGeometry: "Profile Geometry",
      primaryDriver: "Primary Driver",
      coreAdvantage: "Core Advantage",
      coreAdvantageDesc: "This is your \"Default Mode\" of operating. You likely solve problems by",
      blindSpot: "Potential Blind Spot",
      blindSpotDesc: "You have less emphasis on this domain. It may require more conscious energy.",
      basedOn34: "Based on 34 themes",
      basedOn5: "Based on 5 themes",
      authenticProfile: "Authentic Profile",
      authenticProfileDesc: "Your profile displays {count} official talents identified in the report."
    },
    sidebar: {
      authenticProfile: "AUTHENTIC PROFILE",
      profileDescription: "Your profile displays {count} official talents identified in the report."
    },
    domains: {
      executing: "Executing",
      influencing: "Influencing",
      relationship: "Relationship Building",
      strategic: "Strategic Thinking"
    },
    chat: {
      title: "Coaching Session",
      concise: "Concise",
      detailed: "Detailed",
      deepAnalysis: "Deep Think",
      placeholder: "Ask your coach...",
      inputPlaceholder: "Ask your coach...",
      placeholderWaiting: "Waiting for response...",
      shortcutHint: "Press Enter to send • Shift+Enter for new line",
      disclaimer: "AI can make mistakes. Verify important info.",
      loading: "Preparing summary...",
      thinking: "Thinking...",
      thinkingProcess: "Thinking Process",
      stopGeneration: "Stop Generating",
      error: "Connection error. Please try again.",
      startVoice: "Start Voice Session",
      export: "Export Chat",
      save: "Save Session",
      saved: "Session Saved",
      comingSoon: "Coming Soon",
      starterQuestions: [
        "Explain my top 5 strengths in simple terms",
        "What are my blind spots?",
        "Suggest a career path for my profile",
        "How can I use my strengths in team settings?"
      ]
    },
    buttons: {
      exportChat: "Export Chat",
      saveSession: "Save Session",
      deepThink: "Deep Think",
      detailed: "Detailed",
      concise: "Concise"
    },
    exportModal: {
      title: "Export Conversation",
      pdf: "Export as PDF",
      markdown: "Export as Markdown",
      copy: "Copy to Clipboard",
      copySuccess: "Copied to clipboard!",
      pdfSuccess: "PDF downloaded!",
      mdSuccess: "Markdown downloaded!"
    },
    history: {
      title: "Recent Sessions",
      rename: "Rename",
      delete: "Delete"
    },
    insights: {
      dailyTipTitle: "Strength Tip of the Day",
      dailyTips: [
        "Achievers thrive on completing tasks. Start your day by listing 3 small wins.",
        "Strategic thinkers see patterns where others see complexity. Dedicate 10 minutes to 'future-mapping' today.",
        "Relators value depth. Reach out to one key colleague for a 1:1 catch-up."
      ],
      quickActions: "Quick Actions",
      actions: [
        { label: "Generate 30-Day Plan", prompt: "Create a 30-day development plan based on my strengths" },
        { label: "Suggest Careers", prompt: "Based on my strengths profile, suggest suitable career paths" },
        { label: "Practice Scenarios", prompt: "Give me practical scenarios to practice using my top strengths" }
      ],
      overview: "Overview",
      deepDive: "Deep Dive",
      roadmap: "Roadmap",
      smartInsights: "AI Insights",
      topThemes: "Top Themes",
      combinations: "Powerful Combinations",
      teamFit: "Team Compatibility",
      careerAlignment: "Career Alignment",
      strengthDNA: "Strength DNA",
      generating: "Generating personalized insights...",
      complements: "You complement well with:",
      conflicts: "Watch for friction with:",
      idealFor: "Ideal for:"
    }
  },
  ar: {
    appTitle: "مدرب نقاط القوة",
    badge: "تدريب مدعوم بالذكاء الاصطناعي",
    uploadNew: "تقرير جديد",
    heroTitle: "اكتشف إمكاناتك مع",
    heroHighlight: "التوجيه الذكي",
    heroSubtitle: "قم بتحميل تقرير CliftonStrengths الرسمي بصيغة PDF للحصول على توجيه دقيق وشخصي.",
    trustedBy: "موثوق من قبل 10 آلاف+ قائد",
    themes: "سمات",
    steps: {
      upload: "رفع",
      extract: "استخراج",
      analyze: "تحليل",
      coach: "تدريب"
    },
    progressSteps: {
      upload: "رفع",
      extract: "استخراج",
      analyze: "تحليل",
      coach: "تدريب"
    },
    themeToggle: {
      light: "الوضع النهاري",
      dark: "الوضع الليلي"
    },
    features: {
      launch: { title: "أطلق إمكاناتك", desc: "حول مواهبك إلى أداء." },
      target: { title: "استهدف النجاح", desc: "تدريب دقيق للأهداف." },
      shine: { title: "تألق بتميزك", desc: "تميز بملفك الشخصي." },
      deepAnalysis: { title: "تحليل عميق", desc: "افهم الفروق الدقيقة لسماتك الشخصية." },
      blindSpots: { title: "النقاط العمياء", desc: "حدد المخاطر المحتملة وكيفية التعامل معها." },
      habits: { title: "خطط عمل", desc: "عادات يومية لبناء نقاط قوة حقيقية." },
      visualIntelligence: { title: "الذكاء البصري", desc: "نقوم برسم خريطة لتفكيرك الاستراتيجي مقابل مهارات التنفيذ للكشف عن 'هندسة القوة' الفريدة لديك." },
      personalCoach: { title: "مدرب شخصي", desc: "توجيه 24/7 عبر الدردشة والصوت." }
    },
    upload: {
      title: "رفع التقرير",
      subtitle: "ملفات PDF فقط",
      button: "اختر الملف",
      inputPlaceholder: "ارفع ملف PDF لبدء التحليل...",
      processing: "جاري تحليل التقرير...",
      extracting: "جارٍ استخراج بيانات نقاط قوتك...",
      analyzing: "جارٍ تحليل ملفك الشخصي...",
      error: "يرجى رفع ملف PDF صالح.",
      errorFriendlyTitle: "لم نتمكن من قراءة هذا الملف",
      errorFriendlyBody: "تأكد من أنك ترفع تقرير CliftonStrengths الرسمي بصيغة PDF (وليس صورة أو لقطة شاشة).",
      errorSuggestions: [
        "تأكد من أن الملف ليس تالفًا",
        "حاول تحميل التقرير مرة أخرى من Gallup",
        "اتصل بالدعم إذا استمرت المشكلة"
      ],
      supported: "أهم 5 سمات • التقرير الكامل 34",
      privacy: "تتم المعالجة بشكل آمن في متصفحك.",
      secureBadge: "بياناتك مشفرة وخاصة"
    },
    profile: {
      title: "ملخص الملف",
      top5: "أهم 5 سمات",
      full34: "الملف الكامل 34",
      listView: "عرض القائمة",
      chartView: "عرض الرسم",
      chartPlaceholder: "التحليلات المرئية قريباً. ستُعرض نقاط قوتك كرسوم بيانية تفاعلية.",
      domainDistribution: "توزيع المجالات",
      profileGeometry: "توازن الملف الشخصي",
      primaryDriver: "المحرك الأساسي",
      coreAdvantage: "الميزة الأساسية",
      coreAdvantageDesc: "هذا هو 'الوضع الافتراضي' لعملك. أنت على الأرجح تحل المشاكل عن طريق",
      blindSpot: "نقطة عمياء محتملة",
      blindSpotDesc: "لديك تركيز أقل على هذا المجال. قد يتطلب المزيد من الطاقة الواعية.",
      basedOn34: "بناءً على 34 سمة",
      basedOn5: "بناءً على 5 سمات",
      authenticProfile: "ملف موثوق",
      authenticProfileDesc: "يعرض ملفك الشخصي {count} موهبة رسمية تم تحديدها في التقرير."
    },
    sidebar: {
      authenticProfile: "ملف موثوق",
      profileDescription: "يعرض ملفك الشخصي {count} موهبة رسمية تم تحديدها في التقرير."
    },
    domains: {
      executing: "التنفيذ",
      influencing: "التأثير",
      relationship: "بناء العلاقات",
      strategic: "التفكير الاستراتيجي"
    },
    chat: {
      title: "جلسة التدريب",
      concise: "موجز",
      detailed: "مفصل",
      deepAnalysis: "تحليل عميق",
      placeholder: "اسأل المدرب...",
      inputPlaceholder: "اسأل المدرب...",
      placeholderWaiting: "بانتظار الرد...",
      shortcutHint: "اضغط Enter للإرسال • Shift+Enter لسطر جديد",
      disclaimer: "قد يخطئ الذكاء الاصطناعي. تحقق من المعلومات.",
      loading: "جاري تحضير الملخص...",
      thinking: "جارٍ التفكير...",
      thinkingProcess: "عملية التفكير",
      stopGeneration: "إيقاف التوليد",
      error: "خطأ في الاتصال. حاول مرة أخرى.",
      startVoice: "ابدأ جلسة صوتية",
      export: "تصدير المحادثة",
      save: "حفظ الجلسة",
      saved: "تم حفظ الجلسة",
      comingSoon: "قريباً",
      starterQuestions: [
        "اشرح نقاط قوتي الخمس الأولى بشكل مبسط",
        "ما هي نقاط ضعفي المحتملة؟",
        "اقترح مسارًا مهنيًا يناسب ملفي",
        "كيف أستخدم نقاط قوتي في العمل الجماعي؟"
      ]
    },
    buttons: {
      exportChat: "تصدير المحادثة",
      saveSession: "حفظ الجلسة",
      deepThink: "تفكير عميق",
      detailed: "مفصل",
      concise: "موجز"
    },
    exportModal: {
      title: "تصدير المحادثة",
      pdf: "تصدير كملف PDF",
      markdown: "تصدير كملف Markdown",
      copy: "نسخ إلى الحافظة",
      copySuccess: "تم النسخ إلى الحافظة!",
      pdfSuccess: "تم تحميل ملف PDF!",
      mdSuccess: "تم تحميل ملف Markdown!"
    },
    history: {
      title: "الجلسات الأخيرة",
      rename: "إعادة تسمية",
      delete: "حذف"
    },
    insights: {
      dailyTipTitle: "نصيحة نقطة القوة لليوم",
      dailyTips: [
        "المنجزون يزدهرون بإتمام المهام. ابدأ يومك بتحديد 3 إنجازات صغيرة.",
        "المفكرون الاستراتيجيون يرون الأنماط حيث يرى الآخرون التعقيد. خصص 10 دقائق لـ 'رسم خرائط المستقبل' اليوم.",
        "أصحاب سمة 'الارتباط' يقدرون العمق. تواصل مع زميل رئيسي واحد للقاء اليوم."
      ],
      quickActions: "إجراءات سريعة",
      actions: [
        { label: "أنشئ خطة 30 يوم", prompt: "أنشئ لي خطة تطوير لمدة 30 يوماً بناءً على نقاط قوتي" },
        { label: "اقترح مسارات مهنية", prompt: "بناءً على ملف نقاط قوتي، اقترح مسارات مهنية مناسبة" },
        { label: "سيناريوهات تدريبية", prompt: "أعطني سيناريوهات عملية لممارسة استخدام نقاط قوتي الأساسية" }
      ],
      overview: "نظرة عامة",
      deepDive: "تحليل عميق",
      roadmap: "خارطة الطريق",
      smartInsights: "رؤى ذكية",
      topThemes: "السمات الرئيسية",
      combinations: "تركيبات قوية",
      teamFit: "التوافق مع الفريق",
      careerAlignment: "المسارات المهنية",
      strengthDNA: "حمض القوة النووي",
      generating: "جاري توليد رؤى مخصصة...",
      complements: "أنت تكمّل جيداً مع:",
      conflicts: "احذر من الاحتكاك مع:",
      idealFor: "مثالي لـ:"
    }
  }
};
