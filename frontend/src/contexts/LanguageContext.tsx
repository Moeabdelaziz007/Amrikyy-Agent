import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.search': 'البحث',
    'nav.bookings': 'حجوزاتي',
    'nav.chat': 'المساعد الذكي',
    
    // Landing Page
    'landing.hero.title': 'رحلتك تبدأ من هنا',
    'landing.hero.subtitle': 'احجز رحلاتك بسهولة. بدعم من الذكاء الاصطناعي. مصمم للمسافرين.',
    'landing.hero.cta': 'ابدأ الآن',
    'landing.hero.search': 'ابحث عن رحلات',
    
    // Features
    'features.title': 'كيف يعمل النظام',
    'features.subtitle': 'احجز رحلتك المثالية في ثلاث خطوات بسيطة',
    'features.search.title': 'ابحث',
    'features.search.desc': 'أدخل وجهتك وتواريخ سفرك للعثور على أفضل الرحلات',
    'features.select.title': 'اختر',
    'features.select.desc': 'اختر من مجموعة واسعة من الرحلات التي تناسب تفضيلاتك',
    'features.book.title': 'احجز',
    'features.book.desc': 'أكمل حجزك بأمان واحصل على تأكيد فوري',
    
    // Voice AI
    'voice.title': 'مايا - المساعد الذكي',
    'voice.listening': 'أستمع...',
    'voice.thinking': 'أفكر...',
    'voice.ready': 'جاهزة للمساعدة',
    'voice.you.said': 'قلت:',
    'voice.maya.says': 'مايا:',
    'voice.tooltip': 'تحدث مع مايا',
    'voice.processing': 'جاري المعالجة...',
    'voice.speak': 'اضغط للتحدث',
    'voice.stop': 'إيقاف الاستماع',
    
    // Chat
    'chat.title': 'المساعد الذكي للسفر',
    'chat.placeholder': 'اكتب رسالتك هنا...',
    'chat.send': 'إرسال',
    'chat.greeting': 'مرحباً! أنا مايا، مساعدك الذكي للسفر. كيف يمكنني مساعدتك اليوم؟',
    'chat.hint': '💡 استخدم الميكروفون للتحدث أو اكتب رسالتك',
    'chat.error': 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.finish': 'إنهاء',
    
    // Stats
    'stats.flights': 'رحلة',
    'stats.countries': 'دولة',
    'stats.travelers': 'مسافر',
    'stats.satisfaction': 'رضا العملاء',
    
    // CTA
    'cta.title': 'جاهز لحجز مغامرتك القادمة؟',
    'cta.subtitle': 'انضم إلى آلاف المسافرين الذين يثقون في أمريكي لحجوزاتهم',
    'cta.button': 'ابدأ البحث الآن',
    
    // Footer
    'footer.company': 'الشركة',
    'footer.about': 'من نحن',
    'footer.careers': 'الوظائف',
    'footer.press': 'الأخبار',
    'footer.support': 'الدعم',
    'footer.help': 'المساعدة',
    'footer.contact': 'اتصل بنا',
    'footer.legal': 'قانوني',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    'footer.rights': 'جميع الحقوق محفوظة',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.bookings': 'My Bookings',
    'nav.chat': 'AI Assistant',
    
    // Landing Page
    'landing.hero.title': 'Your Journey Starts Here',
    'landing.hero.subtitle': 'Book flights with ease. Powered by AI. Built for travelers.',
    'landing.hero.cta': 'Get Started',
    'landing.hero.search': 'Search Flights',
    
    // Features
    'features.title': 'How It Works',
    'features.subtitle': 'Book your perfect flight in three simple steps',
    'features.search.title': 'Search',
    'features.search.desc': 'Enter your destination and travel dates to find the best flights',
    'features.select.title': 'Select',
    'features.select.desc': 'Choose from a wide range of flights that match your preferences',
    'features.book.title': 'Book',
    'features.book.desc': 'Complete your booking securely and receive instant confirmation',
    
    // Voice AI
    'voice.title': 'Maya AI Assistant',
    'voice.listening': 'Listening...',
    'voice.thinking': 'Thinking...',
    'voice.ready': 'Ready to help',
    'voice.you.said': 'You said:',
    'voice.maya.says': 'Maya:',
    'voice.tooltip': 'Talk to Maya AI',
    'voice.processing': 'Processing...',
    'voice.speak': 'Click to speak',
    'voice.stop': 'Stop listening',
    
    // Chat
    'chat.title': 'AI Travel Assistant',
    'chat.placeholder': 'Type your message here...',
    'chat.send': 'Send',
    'chat.greeting': 'Hello! I\'m Maya, your AI travel assistant. How can I help you today?',
    'chat.hint': '💡 Use the microphone to speak or type your message',
    'chat.error': 'Sorry, an error occurred. Please try again.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.finish': 'Finish',
    
    // Stats
    'stats.flights': 'Flights',
    'stats.countries': 'Countries',
    'stats.travelers': 'Travelers',
    'stats.satisfaction': 'Satisfaction',
    
    // CTA
    'cta.title': 'Ready to Book Your Next Adventure?',
    'cta.subtitle': 'Join thousands of travelers who trust Amrikyy for their flight bookings',
    'cta.button': 'Start Searching',
    
    // Footer
    'footer.company': 'Company',
    'footer.about': 'About Us',
    'footer.careers': 'Careers',
    'footer.press': 'Press',
    'footer.support': 'Support',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.rights': 'All rights reserved',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar'; // Default to Arabic
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'ar' ? 'en' : 'ar';
      localStorage.setItem('language', newLang);
      
      // Update document direction and lang
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      
      return newLang;
    });
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  // Set initial direction
  useState(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  });

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
