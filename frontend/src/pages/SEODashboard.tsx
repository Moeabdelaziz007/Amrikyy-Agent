/**
 * لوحة تحكم تحسين محركات البحث (SEO Dashboard)
 * 
 * المميزات:
 * - عرض ملخص الأداء
 * - أفضل الصفحات والاستعلامات
 * - فحص حالة الفهرسة
 * - توليد التقارير
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  BarChart3,
  Globe,
  Eye,
  MousePointer,
  Download,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// واجهات TypeScript
interface PerformanceSummary {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: string;
  averagePosition: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface PageData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
}

interface QueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
}

interface ComparisonData {
  current: {
    clicks: number;
    impressions: number;
    ctr: string;
    position: string;
  };
  previous: {
    clicks: number;
    impressions: number;
    ctr: string;
    position: string;
  };
  changes: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

interface SEOData {
  summary: PerformanceSummary | null;
  topPages: PageData[];
  topQueries: QueryData[];
  comparison: ComparisonData | null;
}

export default function SEODashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SEOData>({
    summary: null,
    topPages: [],
    topQueries: [],
    comparison: null
  });
  const [days, setDays] = useState(7);
  const [pageSort, setPageSort] = useState<'clicks' | 'impressions' | 'ctr'>('clicks');
  const [querySort, setQuerySort] = useState<'clicks' | 'impressions' | 'ctr'>('clicks');
  const [pageFilter, setPageFilter] = useState('');
  const [queryFilter, setQueryFilter] = useState('');

  // دالة fetchSummary مع معالجة أخطاء متقدمة
  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(`/api/seo/analytics/summary?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('غير مصرح - تحقق من رمز المشرف');
        } else if (response.status === 404) {
          throw new Error('نقطة النهاية غير موجودة');
        } else if (response.status >= 500) {
          throw new Error('خطأ في الخادم - حاول مرة أخرى لاحقاً');
        } else {
          throw new Error(`خطأ HTTP: ${response.status}`);
        }
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل جلب البيانات');
      }

      // التحقق من صحة البيانات
      if (!result.summary) {
        throw new Error('البيانات المستلمة غير صحيحة');
      }

      setData(prev => ({ ...prev, summary: result.summary }));

      const duration = performance.now() - startTime;
      console.log(`✅ تم جلب الملخص في ${duration.toFixed(2)}ms`);

    } catch (err) {
      console.error('❌ خطأ في fetchSummary:', err);
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('فشل الاتصال بالخادم - تحقق من اتصال الإنترنت');
      } else {
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة fetchTopPages مع retry logic
  const fetchTopPages = async (retries = 3, delay = 1000) => {
    setLoading(true);
    setError(null);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`/api/seo/analytics/top-pages?days=${days}&limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit - retry with exponential backoff
            if (attempt < retries) {
              const waitTime = delay * Math.pow(2, attempt - 1);
              console.log(`⏳ Rate limited - محاولة ${attempt}/${retries} - انتظار ${waitTime}ms`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            throw new Error('تم تجاوز حد الطلبات - حاول مرة أخرى لاحقاً');
          }
          
          if (response.status === 403) {
            throw new Error('غير مصرح - تحقق من رمز المشرف');
          } else if (response.status >= 500) {
            // Server error - retry
            if (attempt < retries) {
              console.log(`⚠️ خطأ في الخادم - محاولة ${attempt}/${retries}`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw new Error('خطأ في الخادم - حاول مرة أخرى لاحقاً');
          } else {
            throw new Error(`خطأ HTTP: ${response.status}`);
          }
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'فشل جلب البيانات');
        }

        // التحقق من صحة البيانات
        if (!Array.isArray(result.pages)) {
          throw new Error('البيانات المستلمة غير صحيحة');
        }

        setData(prev => ({ ...prev, topPages: result.pages }));
        console.log(`✅ تم جلب ${result.pages.length} صفحة بنجاح`);
        
        setLoading(false);
        return; // Success - exit function

      } catch (err) {
        console.error(`❌ خطأ في fetchTopPages (محاولة ${attempt}/${retries}):`, err);
        
        // Last attempt - show error
        if (attempt === retries) {
          if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setError('فشل الاتصال بالخادم - تحقق من اتصال الإنترنت');
          } else {
            setError(err instanceof Error ? err.message : 'خطأ غير معروف');
          }
          setLoading(false);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  };

  // دالة fetchTopQueries مع caching
  const fetchTopQueries = async () => {
    setLoading(true);
    setError(null);
    
    // Check cache first (5 minutes TTL)
    const cacheKey = `seo_queries_${days}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
    
    if (cachedData && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < 5 * 60 * 1000) { // 5 minutes
        console.log('✅ استخدام البيانات المخزنة مؤقتاً');
        setData(prev => ({ ...prev, topQueries: JSON.parse(cachedData) }));
        setLoading(false);
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/seo/analytics/top-queries?days=${days}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('غير مصرح - تحقق من رمز المشرف');
        } else if (response.status >= 500) {
          throw new Error('خطأ في الخادم - حاول مرة أخرى لاحقاً');
        } else {
          throw new Error(`خطأ HTTP: ${response.status}`);
        }
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل جلب البيانات');
      }

      // التحقق من صحة البيانات
      if (!Array.isArray(result.queries)) {
        throw new Error('البيانات المستلمة غير صحيحة');
      }

      // Cache the data
      sessionStorage.setItem(cacheKey, JSON.stringify(result.queries));
      sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());

      setData(prev => ({ ...prev, topQueries: result.queries }));
      console.log(`✅ تم جلب ${result.queries.length} استعلام بنجاح`);

    } catch (err) {
      console.error('❌ خطأ في fetchTopQueries:', err);
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('فشل الاتصال بالخادم - تحقق من اتصال الإنترنت');
      } else {
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة fetchComparison للمقارنة بين فترتين
  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/seo/analytics/comparison?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('غير مصرح - تحقق من رمز المشرف');
        } else if (response.status >= 500) {
          throw new Error('خطأ في الخادم - حاول مرة أخرى لاحقاً');
        } else {
          throw new Error(`خطأ HTTP: ${response.status}`);
        }
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل جلب البيانات');
      }

      // التحقق من صحة البيانات
      if (!result.comparison || !result.comparison.current || !result.comparison.previous) {
        throw new Error('البيانات المستلمة غير صحيحة');
      }

      setData(prev => ({ ...prev, comparison: result.comparison }));
      console.log('✅ تم جلب بيانات المقارنة بنجاح');

    } catch (err) {
      console.error('❌ خطأ في fetchComparison:', err);
      
      // Don't show error for comparison - it's optional
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        console.warn('⚠️ فشل جلب بيانات المقارنة');
      }
    } finally {
      setLoading(false);
    }
  };

  // دوال الترتيب والفلترة
  const sortPages = (pages: PageData[]) => {
    return [...pages].sort((a, b) => {
      if (pageSort === 'clicks') return b.clicks - a.clicks;
      if (pageSort === 'impressions') return b.impressions - a.impressions;
      if (pageSort === 'ctr') return parseFloat(b.ctr) - parseFloat(a.ctr);
      return 0;
    });
  };

  const filterPages = (pages: PageData[]) => {
    if (!pageFilter) return pages;
    return pages.filter(page => 
      page.url.toLowerCase().includes(pageFilter.toLowerCase())
    );
  };

  const filterQueries = (queries: QueryData[]) => {
    if (!queryFilter) return queries;
    return queries.filter(query => 
      query.query.toLowerCase().includes(queryFilter.toLowerCase())
    );
  };

  const sortQueries = (queries: QueryData[]) => {
    return [...queries].sort((a, b) => {
      if (querySort === 'clicks') return b.clicks - a.clicks;
      if (querySort === 'impressions') return b.impressions - a.impressions;
      if (querySort === 'ctr') return parseFloat(b.ctr) - parseFloat(a.ctr);
      return 0;
    });
  };

  // دالة تصدير البيانات إلى CSV
  const exportToCSV = () => {
    const csvData = [];
    
    // Header
    csvData.push(['نوع البيانات', 'القيمة', 'التفاصيل']);
    
    // Summary
    if (data.summary) {
      csvData.push(['الملخص', '', '']);
      csvData.push(['النقرات', data.summary.totalClicks, '']);
      csvData.push(['الظهور', data.summary.totalImpressions, '']);
      csvData.push(['نسبة النقر', data.summary.averageCTR, '%']);
      csvData.push(['الموضع', data.summary.averagePosition, '']);
      csvData.push(['', '', '']);
    }
    
    // Top Pages
    csvData.push(['أفضل الصفحات', '', '']);
    csvData.push(['الصفحة', 'النقرات', 'الظهور', 'CTR']);
    data.topPages.forEach(page => {
      csvData.push([page.url, page.clicks, page.impressions, page.ctr]);
    });
    csvData.push(['', '', '']);
    
    // Top Queries
    csvData.push(['أفضل الاستعلامات', '', '']);
    csvData.push(['الاستعلام', 'النقرات', 'الظهور', 'CTR']);
    data.topQueries.forEach(query => {
      csvData.push([query.query, query.clicks, query.impressions, query.ctr]);
    });
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    console.log('✅ تم تصدير البيانات بنجاح');
  };

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchSummary();
    fetchTopPages();
    fetchTopQueries();
    fetchComparison();
  }, [days]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* الرأس */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                لوحة تحكم SEO
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                مراقبة أداء محركات البحث
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* فلتر الفترة الزمنية */}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value={7}>آخر 7 أيام</option>
                <option value={30}>آخر 30 يوم</option>
                <option value={90}>آخر 90 يوم</option>
              </select>
              
              {/* زر التصدير */}
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="gap-2"
                disabled={!data.summary}
              >
                <Download className="w-4 h-4" />
                تصدير
              </Button>
              
              {/* زر التحديث */}
              <Button
                onClick={() => {
                  fetchSummary();
                  fetchTopPages();
                  fetchTopQueries();
                  fetchComparison();
                }}
                variant="outline"
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="container mx-auto px-4 py-8">
        {/* رسالة الخطأ */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* بطاقات الملخص */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">النقرات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : data.summary ? (
                    data.summary.totalClicks.toLocaleString('ar-EG')
                  ) : (
                    '-'
                  )}
                </p>
                {data.comparison && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    data.comparison.changes.clicks >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${data.comparison.changes.clicks < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(data.comparison.changes.clicks).toFixed(1)}%
                  </p>
                )}
              </div>
              <MousePointer className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الظهور</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : data.summary ? (
                    data.summary.totalImpressions.toLocaleString('ar-EG')
                  ) : (
                    '-'
                  )}
                </p>
                {data.comparison && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    data.comparison.changes.impressions >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${data.comparison.changes.impressions < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(data.comparison.changes.impressions).toFixed(1)}%
                  </p>
                )}
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">نسبة النقر</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : data.summary ? (
                    `${data.summary.averageCTR}%`
                  ) : (
                    '-'
                  )}
                </p>
                {data.comparison && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    data.comparison.changes.ctr >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${data.comparison.changes.ctr < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(data.comparison.changes.ctr).toFixed(1)}%
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الموضع</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : data.summary ? (
                    data.summary.averagePosition
                  ) : (
                    '-'
                  )}
                </p>
                {data.comparison && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    data.comparison.changes.position <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${data.comparison.changes.position > 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(data.comparison.changes.position).toFixed(1)}
                  </p>
                )}
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* جداول البيانات */}
        {!loading && data.summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* جدول أفضل الصفحات */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  أفضل الصفحات
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                  <select
                    value={pageSort}
                    onChange={(e) => setPageSort(e.target.value as any)}
                    className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="clicks">النقرات</option>
                    <option value="impressions">الظهور</option>
                    <option value="ctr">CTR</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-right py-2 text-gray-600 dark:text-gray-400">الصفحة</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">النقرات</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">الظهور</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortPages(filterPages(data.topPages)).length > 0 ? (
                      sortPages(filterPages(data.topPages)).map((page, index) => (
                        <tr key={index} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 text-gray-900 dark:text-white truncate max-w-xs" title={page.url}>
                            {page.url}
                          </td>
                          <td className="text-center text-gray-900 dark:text-white font-medium">
                            {page.clicks.toLocaleString('ar-EG')}
                          </td>
                          <td className="text-center text-gray-600 dark:text-gray-400">
                            {page.impressions.toLocaleString('ar-EG')}
                          </td>
                          <td className="text-center text-gray-600 dark:text-gray-400">
                            {page.ctr}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          لا توجد بيانات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* جدول أفضل الاستعلامات */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-600" />
                  أفضل الاستعلامات
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={queryFilter}
                    onChange={(e) => setQueryFilter(e.target.value)}
                    className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                  <select
                    value={querySort}
                    onChange={(e) => setQuerySort(e.target.value as any)}
                    className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="clicks">النقرات</option>
                    <option value="impressions">الظهور</option>
                    <option value="ctr">CTR</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-right py-2 text-gray-600 dark:text-gray-400">الاستعلام</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">النقرات</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">الظهور</th>
                      <th className="text-center py-2 text-gray-600 dark:text-gray-400">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortQueries(filterQueries(data.topQueries)).length > 0 ? (
                      sortQueries(filterQueries(data.topQueries)).map((query, index) => (
                        <tr key={index} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 text-gray-900 dark:text-white">
                            {query.query}
                          </td>
                          <td className="text-center text-gray-900 dark:text-white font-medium">
                            {query.clicks.toLocaleString('ar-EG')}
                          </td>
                          <td className="text-center text-gray-600 dark:text-gray-400">
                            {query.impressions.toLocaleString('ar-EG')}
                          </td>
                          <td className="text-center text-gray-600 dark:text-gray-400">
                            {query.ctr}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          لا توجد بيانات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* حالة التحميل */}
        {loading && (
          <Card className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              جاري التحميل...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              يرجى الانتظار
            </p>
          </Card>
        )}

        {/* رسالة البداية */}
        {!loading && !data.summary && (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              مرحباً بك في لوحة تحكم SEO
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              قم بإعداد Google Search Console أولاً لعرض البيانات
            </p>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              دليل الإعداد
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
