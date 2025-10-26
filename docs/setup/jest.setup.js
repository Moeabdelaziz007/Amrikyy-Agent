// jest.setup.js
// استخدام web-streams-polyfill لتوفير TransformStream في بيئة Jest (Node)
try {
  const ponyfill = require('web-streams-polyfill/ponyfill');
  if (ponyfill && ponyfill.TransformStream) {
    global.TransformStream = ponyfill.TransformStream;
  }
} catch (err) {
  // في حال لم يُثبّت الحزمة، نُظهر تلميحًا واضحًا
  // لكن لا نفشل في الإعداد حتى نتمكن من رؤية الأخطاء في الاختبارات
  // console.warn('web-streams-polyfill not installed — some tests may fail if they use TransformStream.');
}
