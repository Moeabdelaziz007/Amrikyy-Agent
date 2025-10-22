/**
 * مسارات تحسين محركات البحث (SEO Routes)
 * 
 * نقاط النهاية:
 * - POST /api/seo/sitemap/generate - توليد خريطة الموقع
 * - POST /api/seo/sitemap/submit - إرسال خريطة الموقع لجوجل
 * - GET /api/seo/analytics/summary - ملخص الأداء
 * - GET /api/seo/analytics/pages - أفضل الصفحات
 * - GET /api/seo/analytics/queries - أفضل الاستعلامات
 * - POST /api/seo/inspect - فحص رابط واحد
 * - POST /api/seo/inspect/batch - فحص روابط متعددة
 * - GET /api/seo/report - تقرير يومي
 * - GET /api/seo/stats - إحصائيات النظام
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const express = require('express');
const router = express.Router();
const SitemapGenerator = require('../src/services/SitemapGenerator');
const SEOMonitor = require('../src/services/SEOMonitor');

// تهيئة الخدمات
let sitemapGenerator = null;
let seoMonitor = null;

function initServices() {
  if (!sitemapGenerator) {
    sitemapGenerator = new SitemapGenerator();
  }
  if (!seoMonitor) {
    seoMonitor = new SEOMonitor();
  }
}

// Middleware للتحقق من المصادقة (اختياري)
function authMiddleware(req, res, next) {
  const adminToken = process.env.SEO_ADMIN_TOKEN;
  
  // إذا لم يتم تعيين رمز المشرف، السماح بالوصول
  if (!adminToken) {
    return next();
  }
  
  const providedToken = req.header('x-admin-token');
  if (providedToken !== adminToken) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح - رمز المشرف غير صحيح'
    });
  }
  
  next();
}

// تطبيق المصادقة على جميع المسارات (اختياري)
// router.use(authMiddleware);

/**
 * POST /api/seo/sitemap/generate
 * توليد خريطة الموقع من المسارات
 */
router.post('/sitemap/generate', async (req, res) => {
  try {
    initServices();
    
    const { routes } = req.body;
    
    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير مصفوفة المسارات (routes)'
      });
    }
    
    const result = await sitemapGenerator.generateAndSubmit(routes);
    
    res.json({
      success: true,
      message: 'تم توليد خريطة الموقع بنجاح',
      ...result
    });
  } catch (error) {
    console.error('❌ خطأ في توليد خريطة الموقع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/sitemap/submit
 * إرسال خريطة الموقع لجوجل
 */
router.post('/sitemap/submit', async (req, res) => {
  try {
    initServices();
    
    const { sitemapUrl } = req.body;
    
    if (!sitemapUrl) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير رابط خريطة الموقع (sitemapUrl)'
      });
    }
    
    const result = await sitemapGenerator.submitToGoogle(sitemapUrl);
    
    res.json({
      success: true,
      message: 'تم إرسال خريطة الموقع لجوجل',
      ...result
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال خريطة الموقع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/analytics/summary
 * الحصول على ملخص الأداء
 */
router.get('/analytics/summary', async (req, res) => {
  try {
    initServices();
    
    const days = parseInt(req.query.days) || 7;
    const result = await seoMonitor.getPerformanceSummary(days);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب ملخص الأداء:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/analytics/pages
 * الحصول على أفضل الصفحات
 */
router.get('/analytics/pages', async (req, res) => {
  try {
    initServices();
    
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await seoMonitor.getTopPages(days, limit);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب أفضل الصفحات:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/analytics/queries
 * الحصول على أفضل الاستعلامات
 */
router.get('/analytics/queries', async (req, res) => {
  try {
    initServices();
    
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await seoMonitor.getTopQueries(days, limit);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب أفضل الاستعلامات:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/inspect
 * فحص رابط واحد
 */
router.post('/inspect', async (req, res) => {
  try {
    initServices();
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير الرابط (url)'
      });
    }
    
    const result = await seoMonitor.inspectURL(url);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في فحص الرابط:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/inspect/batch
 * فحص روابط متعددة
 */
router.post('/inspect/batch', async (req, res) => {
  try {
    initServices();
    
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير مصفوفة الروابط (urls)'
      });
    }
    
    const result = await seoMonitor.inspectURLs(urls);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في فحص الروابط:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/report
 * الحصول على التقرير اليومي
 */
router.get('/report', async (req, res) => {
  try {
    initServices();
    
    const result = await seoMonitor.generateDailyReport();
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في توليد التقرير:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/comparison
 * مقارنة الأداء بين فترتين
 */
router.get('/comparison', async (req, res) => {
  try {
    initServices();
    
    const currentDays = parseInt(req.query.currentDays) || 7;
    const previousDays = parseInt(req.query.previousDays) || 7;
    
    const result = await seoMonitor.comparePerformance(currentDays, previousDays);
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في مقارنة الأداء:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/sites
 * الحصول على قائمة المواقع المتحقق منها
 */
router.get('/sites', async (req, res) => {
  try {
    initServices();
    
    const result = await seoMonitor.listSites();
    
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب قائمة المواقع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/sitemaps
 * الحصول على قائمة خرائط الموقع المرسلة
 */
router.get('/sitemaps', async (req, res) => {
  try {
    initServices();
    
    const sitemaps = await sitemapGenerator.listSitemaps();
    
    res.json({
      success: true,
      sitemaps
    });
  } catch (error) {
    console.error('❌ خطأ في جلب خرائط الموقع:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/health
 * فحص صحة خدمات SEO
 */
router.get('/health', async (req, res) => {
  try {
    initServices();
    
    const sites = await seoMonitor.listSites();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        sitemapGenerator: 'active',
        seoMonitor: 'active',
        googleSearchConsole: sites.success ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
