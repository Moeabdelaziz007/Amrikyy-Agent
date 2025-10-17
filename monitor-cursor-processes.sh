#!/bin/bash

# 🔍 Cursor Process Monitor
# مراقب عمليات Cursor لتحسين الأداء

echo "🔍 مراقب عمليات Cursor"
echo "======================"

# Function to get Cursor processes
get_cursor_processes() {
    ps aux | grep -i cursor | grep -v grep
}

# Function to monitor memory usage
monitor_memory() {
    echo "🧠 استهلاك الذاكرة:"
    echo "------------------"
    
    cursor_processes=$(get_cursor_processes)
    
    if [ -z "$cursor_processes" ]; then
        echo "❌ لا توجد عمليات Cursor نشطة"
        return 1
    fi
    
    total_memory=0
    echo "$cursor_processes" | while read line; do
        memory=$(echo "$line" | awk '{print $6}')
        process_name=$(echo "$line" | awk '{print $11}')
        memory_mb=$(echo "scale=2; $memory / 1024" | bc)
        total_memory=$(echo "scale=2; $total_memory + $memory_mb" | bc)
        echo "  $process_name: ${memory_mb} MB"
    done
    
    echo "  إجمالي الذاكرة: ${total_memory} MB"
}

# Function to monitor CPU usage
monitor_cpu() {
    echo "⚡ استهلاك المعالج:"
    echo "------------------"
    
    cursor_processes=$(get_cursor_processes)
    
    if [ -z "$cursor_processes" ]; then
        echo "❌ لا توجد عمليات Cursor نشطة"
        return 1
    fi
    
    total_cpu=0
    echo "$cursor_processes" | while read line; do
        cpu=$(echo "$line" | awk '{print $3}')
        process_name=$(echo "$line" | awk '{print $11}')
        total_cpu=$(echo "scale=2; $total_cpu + $cpu" | bc)
        echo "  $process_name: ${cpu}%"
    done
    
    echo "  إجمالي المعالج: ${total_cpu}%"
}

# Function to monitor file handles
monitor_file_handles() {
    echo "📁 مقابض الملفات:"
    echo "----------------"
    
    cursor_processes=$(get_cursor_processes)
    
    if [ -z "$cursor_processes" ]; then
        echo "❌ لا توجد عمليات Cursor نشطة"
        return 1
    fi
    
    echo "$cursor_processes" | while read line; do
        pid=$(echo "$line" | awk '{print $2}')
        process_name=$(echo "$line" | awk '{print $11}')
        file_handles=$(lsof -p "$pid" 2>/dev/null | wc -l)
        echo "  $process_name (PID: $pid): $file_handles مقبض ملف"
    done
}

# Function to check node_modules watching
check_node_modules_watching() {
    echo "👀 مراقبة node_modules:"
    echo "----------------------"
    
    node_modules_watchers=$(lsof +D "/Users/Shared/maya-travel-agent/node_modules" 2>/dev/null | wc -l)
    
    if [ "$node_modules_watchers" -eq 0 ]; then
        echo "✅ node_modules غير مراقب (ممتاز!)"
    else
        echo "⚠️ node_modules مراقب من $node_modules_watchers عملية"
        echo "   العمليات المراقبة:"
        lsof +D "/Users/Shared/maya-travel-agent/node_modules" 2>/dev/null | head -10
    fi
}

# Function to check extensions
check_extensions() {
    echo "🔌 الإضافات النشطة:"
    echo "------------------"
    
    # Check if Cursor is running
    if ! pgrep -f "Cursor" > /dev/null; then
        echo "❌ Cursor غير نشط"
        return 1
    fi
    
    # Get extension processes
    extension_processes=$(ps aux | grep -i "extension\|language.*server" | grep -v grep)
    
    if [ -z "$extension_processes" ]; then
        echo "✅ لا توجد عمليات إضافات نشطة"
    else
        echo "$extension_processes" | while read line; do
            process_name=$(echo "$line" | awk '{print $11}')
            memory=$(echo "$line" | awk '{print $6}')
            cpu=$(echo "$line" | awk '{print $3}')
            memory_mb=$(echo "scale=2; $memory / 1024" | bc)
            echo "  $process_name: ${memory_mb} MB, ${cpu}% CPU"
        done
    fi
}

# Function to generate performance report
generate_performance_report() {
    echo "📊 تقرير الأداء:"
    echo "================"
    
    report_file="/Users/Shared/maya-travel-agent/cursor-performance-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "🔍 تقرير أداء Cursor"
        echo "==================="
        echo "التاريخ: $(date)"
        echo "المشروع: Maya Travel Agent"
        echo ""
        
        echo "🧠 استهلاك الذاكرة:"
        monitor_memory
        echo ""
        
        echo "⚡ استهلاك المعالج:"
        monitor_cpu
        echo ""
        
        echo "📁 مقابض الملفات:"
        monitor_file_handles
        echo ""
        
        echo "👀 مراقبة node_modules:"
        check_node_modules_watching
        echo ""
        
        echo "🔌 الإضافات النشطة:"
        check_extensions
        echo ""
        
        echo "📋 التوصيات:"
        echo "1. راقب استهلاك الذاكرة والمعالج"
        echo "2. تحقق من الإضافات الثقيلة"
        echo "3. تأكد من عدم مراقبة node_modules"
        echo "4. استخدم Extension Bisect إذا لزم الأمر"
        
    } > "$report_file"
    
    echo "✅ تم إنشاء تقرير الأداء: $report_file"
}

# Function to continuous monitoring
continuous_monitoring() {
    echo "🔄 مراقبة مستمرة (اضغط Ctrl+C للإيقاف)..."
    echo "=========================================="
    
    while true; do
        clear
        echo "🔍 مراقب عمليات Cursor - $(date)"
        echo "================================="
        
        monitor_memory
        echo ""
        
        monitor_cpu
        echo ""
        
        check_node_modules_watching
        echo ""
        
        echo "🔄 التحديث التالي في 5 ثواني..."
        sleep 5
    done
}

# Function to show help
show_help() {
    echo "🔍 مراقب عمليات Cursor"
    echo "======================"
    echo ""
    echo "الاستخدام:"
    echo "  $0 [خيار]"
    echo ""
    echo "الخيارات:"
    echo "  memory      - عرض استهلاك الذاكرة"
    echo "  cpu         - عرض استهلاك المعالج"
    echo "  files       - عرض مقابض الملفات"
    echo "  node        - فحص مراقبة node_modules"
    echo "  extensions  - فحص الإضافات النشطة"
    echo "  report      - إنشاء تقرير الأداء"
    echo "  monitor     - مراقبة مستمرة"
    echo "  help        - عرض هذه المساعدة"
    echo ""
    echo "أمثلة:"
    echo "  $0 memory"
    echo "  $0 report"
    echo "  $0 monitor"
}

# Main function
main() {
    case "${1:-help}" in
        memory)
            monitor_memory
            ;;
        cpu)
            monitor_cpu
            ;;
        files)
            monitor_file_handles
            ;;
        node)
            check_node_modules_watching
            ;;
        extensions)
            check_extensions
            ;;
        report)
            generate_performance_report
            ;;
        monitor)
            continuous_monitoring
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
