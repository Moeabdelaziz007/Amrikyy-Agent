import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Globe, Bookmark, Star } from 'lucide-react';

const BrowserApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();

  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([
    'https://www.google.com',
    'https://www.github.com',
    'https://www.youtube.com',
  ]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = inputUrl.trim();
    
    // Add https:// if no protocol specified
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    
    setUrl(newUrl);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleBack = () => {
    // Browser back functionality (placeholder)
    console.log('Navigate back');
  };

  const handleForward = () => {
    // Browser forward functionality (placeholder)
    console.log('Navigate forward');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setInputUrl(homeUrl);
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(url)) {
      setBookmarks(bookmarks.filter(b => b !== url));
    } else {
      setBookmarks([...bookmarks, url]);
    }
  };

  const isBookmarked = bookmarks.includes(url);
  const isSecure = url.startsWith('https://');

  return (
    <div className="h-full flex flex-col bg-background text-text">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b" style={{ borderColor: theme.colors.border }}>
        {/* Navigation Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleBack}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            title={lang === 'en' ? 'Back' : 'رجوع'}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={handleForward}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            title={lang === 'en' ? 'Forward' : 'إلى الأمام'}
          >
            <ArrowRight size={18} />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            title={lang === 'en' ? 'Refresh' : 'تحديث'}
          >
            <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleHome}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            title={lang === 'en' ? 'Home' : 'الصفحة الرئيسية'}
          >
            <Home size={18} />
          </button>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-background border" style={{ borderColor: theme.colors.border }}>
            {isSecure ? (
              <Lock size={16} className="text-green-500" />
            ) : (
              <Globe size={16} className="text-text-secondary" />
            )}
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder={lang === 'en' ? 'Enter URL or search...' : 'أدخل عنوان URL أو ابحث...'}
            />
            <button
              type="button"
              onClick={toggleBookmark}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title={lang === 'en' ? 'Bookmark' : 'إضافة إلى الإشارات المرجعية'}
            >
              <Star size={16} className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Bookmarks Bar */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto" style={{ borderColor: theme.colors.border }}>
          <Bookmark size={14} className="text-text-secondary flex-shrink-0" />
          {bookmarks.map((bookmark, index) => (
            <button
              key={index}
              onClick={() => {
                setUrl(bookmark);
                setInputUrl(bookmark);
              }}
              className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {new URL(bookmark).hostname.replace('www.', '')}
            </button>
          ))}
        </div>
      )}

      {/* Browser Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RotateCw className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center p-8">
              <Globe className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {lang === 'en' ? 'Browser Placeholder' : 'عنصر نائب للمتصفح'}
              </h3>
              <p className="text-gray-500 mb-4">
                {lang === 'en' 
                  ? 'This is a browser UI mockup. In a production environment, you would integrate with a web rendering engine.'
                  : 'هذا نموذج واجهة مستخدم للمتصفح. في بيئة الإنتاج، ستقوم بالتكامل مع محرك عرض الويب.'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Lock size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">{url}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1 border-t text-xs text-text-secondary" style={{ borderColor: theme.colors.border }}>
        {lang === 'en' ? 'Ready' : 'جاهز'} | {isSecure ? (lang === 'en' ? 'Secure Connection' : 'اتصال آمن') : (lang === 'en' ? 'Not Secure' : 'غير آمن')}
      </div>
    </div>
  );
};

export default BrowserApp;
