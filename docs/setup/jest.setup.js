// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn().mockResolvedValue({ response: 'mocked' }),
    })),
  })),
}));
