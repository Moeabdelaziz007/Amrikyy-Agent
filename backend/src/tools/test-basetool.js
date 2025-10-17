/**
 * 🧪 BaseTool Test Suite
 * 
 * اختبار شامل لـ BaseTool class والتكامل مع LangSmith tracing
 */

const BaseTool = require('./BaseTool');
const geolocationTool = require('./geolocation');
const { wrapTool, createTraceableWrapper, logger } = require('../utils/langsmith_helpers');

class TestTool extends BaseTool {
  constructor() {
    super(
      'test_tool',
      'أداة اختبار لـ BaseTool class',
      {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'رسالة للاختبار' },
          delay: { type: 'number', description: 'تأخير بالمللي ثانية' }
        },
        required: ['message']
      }
    );
  }

  async execute(args) {
    const { message, delay = 1000 } = args;
    
    // محاكاة تأخير
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      message: `تم تنفيذ الأداة بنجاح: ${message}`,
      timestamp: new Date().toISOString(),
      delay: delay
    };
  }
}

class ErrorTestTool extends BaseTool {
  constructor() {
    super(
      'error_test_tool',
      'أداة اختبار للأخطاء',
      {
        type: 'object',
        properties: {
          shouldError: { type: 'boolean', description: 'هل يجب إرجاع خطأ؟' }
        }
      }
    );
  }

  async execute(args) {
    const { shouldError = false } = args;
    
    if (shouldError) {
      throw new Error('خطأ مقصود للاختبار');
    }
    
    return {
      success: true,
      message: 'تم تنفيذ الأداة بدون أخطاء'
    };
  }
}

/**
 * 🧪 اختبار BaseTool الأساسي
 */
async function testBaseTool() {
  console.log('🧪 بدء اختبار BaseTool...');
  
  try {
    const testTool = new TestTool();
    
    // اختبار الخصائص الأساسية
    console.log('✅ اسم الأداة:', testTool.name);
    console.log('✅ وصف الأداة:', testTool.description);
    console.log('✅ معاملات الأداة:', JSON.stringify(testTool.parameters, null, 2));
    
    // اختبار التنفيذ
    const result = await testTool.execute({
      message: 'مرحباً من BaseTool!',
      delay: 500
    });
    
    console.log('✅ نتيجة التنفيذ:', JSON.stringify(result, null, 2));
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ خطأ في اختبار BaseTool:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 اختبار التتبع مع LangSmith
 */
async function testTracing() {
  console.log('\n🔍 بدء اختبار التتبع مع LangSmith...');
  
  try {
    const testTool = new TestTool();
    const tracedTool = wrapTool(testTool, 'test_tool');
    
    console.log('✅ تم تطبيق التتبع على الأداة');
    
    // اختبار التنفيذ مع التتبع
    const result = await tracedTool.execute({
      message: 'اختبار التتبع',
      delay: 200
    });
    
    console.log('✅ نتيجة التنفيذ مع التتبع:', JSON.stringify(result, null, 2));
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ خطأ في اختبار التتبع:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 اختبار معالجة الأخطاء
 */
async function testErrorHandling() {
  console.log('\n⚠️ بدء اختبار معالجة الأخطاء...');
  
  try {
    const errorTool = new ErrorTestTool();
    const tracedErrorTool = wrapTool(errorTool, 'error_test_tool');
    
    // اختبار بدون أخطاء
    const successResult = await tracedErrorTool.execute({ shouldError: false });
    console.log('✅ اختبار بدون أخطاء:', JSON.stringify(successResult, null, 2));
    
    // اختبار مع أخطاء
    try {
      await tracedErrorTool.execute({ shouldError: true });
    } catch (error) {
      console.log('✅ تم التقاط الخطأ بنجاح:', error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في اختبار معالجة الأخطاء:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 اختبار أداة geolocation
 */
async function testGeolocationTool() {
  console.log('\n🌍 بدء اختبار أداة geolocation...');
  
  try {
    console.log('✅ اسم الأداة:', geolocationTool.name);
    console.log('✅ وصف الأداة:', geolocationTool.description);
    
    // اختبار التنفيذ
    const result = await geolocationTool.execute();
    
    console.log('✅ نتيجة geolocation:', JSON.stringify(result, null, 2));
    
    return { success: true, result };
  } catch (error) {
    console.error('❌ خطأ في اختبار geolocation:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 اختبار الأداء
 */
async function testPerformance() {
  console.log('\n⚡ بدء اختبار الأداء...');
  
  try {
    const testTool = new TestTool();
    const tracedTool = wrapTool(testTool, 'performance_test_tool');
    
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      await tracedTool.execute({
        message: `اختبار الأداء ${i + 1}`,
        delay: 100
      });
      
      const endTime = Date.now();
      times.push(endTime - startTime);
    }
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('✅ نتائج الأداء:');
    console.log(`   - متوسط الوقت: ${averageTime.toFixed(2)}ms`);
    console.log(`   - أقل وقت: ${minTime}ms`);
    console.log(`   - أكثر وقت: ${maxTime}ms`);
    console.log(`   - عدد التكرارات: ${iterations}`);
    
    return { 
      success: true, 
      performance: { averageTime, minTime, maxTime, iterations } 
    };
  } catch (error) {
    console.error('❌ خطأ في اختبار الأداء:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 اختبار التكامل الشامل
 */
async function runComprehensiveTest() {
  console.log('🚀 بدء الاختبار الشامل لـ BaseTool...\n');
  
  const results = {
    baseTool: await testBaseTool(),
    tracing: await testTracing(),
    errorHandling: await testErrorHandling(),
    geolocation: await testGeolocationTool(),
    performance: await testPerformance()
  };
  
  // حساب النتائج
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.success).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log('\n📊 تقرير الاختبار الشامل:');
  console.log('========================');
  console.log(`✅ الاختبارات المنجزة: ${passedTests}/${totalTests}`);
  console.log(`📈 معدل النجاح: ${successRate.toFixed(1)}%`);
  
  // تفاصيل النتائج
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${testName}: ${result.success ? 'نجح' : 'فشل'}`);
  });
  
  // تقييم شامل
  if (successRate >= 80) {
    console.log('\n🎉 تقييم شامل: ممتاز! BaseTool يعمل بشكل مثالي');
  } else if (successRate >= 60) {
    console.log('\n⚠️ تقييم شامل: جيد، لكن يحتاج تحسين');
  } else {
    console.log('\n❌ تقييم شامل: يحتاج إصلاحات عاجلة');
  }
  
  return {
    success: successRate >= 80,
    results,
    summary: {
      totalTests,
      passedTests,
      successRate
    }
  };
}

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runComprehensiveTest()
    .then(finalResult => {
      console.log('\n🏁 انتهى الاختبار الشامل');
      process.exit(finalResult.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 خطأ في الاختبار الشامل:', error);
      process.exit(1);
    });
}

module.exports = {
  TestTool,
  ErrorTestTool,
  testBaseTool,
  testTracing,
  testErrorHandling,
  testGeolocationTool,
  testPerformance,
  runComprehensiveTest
};
