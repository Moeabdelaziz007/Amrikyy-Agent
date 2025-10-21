#!/bin/bash

# Comprehensive Markdown Analysis Script
# Analyzes all MD files for duplicates, outdated content, and redundancy

OUTPUT_FILE="md_analysis_comprehensive_report.txt"
ROOT_DIR="/workspaces/Amrikyy-Agent"

echo "==============================================================================" > $OUTPUT_FILE
echo "COMPREHENSIVE MARKDOWN FILES ANALYSIS REPORT" >> $OUTPUT_FILE
echo "Generated: $(date)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 1. SUMMARY STATISTICS
echo "1. SUMMARY STATISTICS" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
TOTAL_MD=$(find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | wc -l)
TOTAL_LINES=$(find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs wc -l | tail -1 | awk '{print $1}')
ROOT_LEVEL=$(find $ROOT_DIR -maxdepth 1 -name "*.md" -type f | wc -l)
DOCS_DIR=$(find $ROOT_DIR/docs -name "*.md" -type f 2>/dev/null | wc -l)

echo "Total MD Files: $TOTAL_MD" >> $OUTPUT_FILE
echo "Total Lines: $TOTAL_LINES" >> $OUTPUT_FILE
echo "Root Level Files: $ROOT_LEVEL" >> $OUTPUT_FILE
echo "Docs Directory Files: $DOCS_DIR" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 2. ROOT LEVEL FILES
echo "2. ROOT LEVEL FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -maxdepth 1 -name "*.md" -type f -exec ls -lh {} \; | awk '{print $9, "(" $5 ")"}' >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 3. EXACT DUPLICATES (by hash)
echo "3. EXACT DUPLICATES (by MD5 hash)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs md5sum | sort | awk '{print $1}' | uniq -c | sort -rn | grep -v "^ *1 " > /tmp/dup_hashes.txt
if [ -s /tmp/dup_hashes.txt ]; then
    while read count hash; do
        echo "Found $count files with same hash:" >> $OUTPUT_FILE
        find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs md5sum | grep "^$hash" | awk '{print "  - " $2}' >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
    done < /tmp/dup_hashes.txt
else
    echo "No exact duplicates found." >> $OUTPUT_FILE
fi
echo "" >> $OUTPUT_FILE

# 4. EMPTY OR NEAR-EMPTY FILES
echo "4. EMPTY OR NEAR-EMPTY FILES (< 10 lines)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | while read file; do
    lines=$(wc -l < "$file")
    if [ "$lines" -lt 10 ]; then
        echo "$file ($lines lines)" >> $OUTPUT_FILE
    fi
done
echo "" >> $OUTPUT_FILE

# 5. LARGEST FILES
echo "5. LARGEST FILES (Top 20)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs wc -l | sort -rn | head -21 | tail -20 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 6. FILES WITH "MAYA" (old name)
echo "6. FILES REFERENCING OLD NAME 'MAYA' (should be Amrikyy)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs grep -l -i "maya" | head -50 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 7. FILES WITH TODO/FIXME/WIP
echo "7. FILES WITH TODO/FIXME/WIP MARKERS" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs grep -l -i -E "(TODO|FIXME|WIP)" | head -50 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 8. FILES WITH "DEPRECATED"
echo "8. FILES MARKED AS DEPRECATED" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs grep -l -i "deprecated" | head -30 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 9. DEPLOYMENT-RELATED FILES
echo "9. DEPLOYMENT-RELATED FILES (potential duplicates)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | grep -i deploy >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 10. README FILES
echo "10. README FILES (potential duplicates)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "README*.md" -type f | grep -v node_modules | grep -v .git >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 11. CURSOR-RELATED FILES
echo "11. CURSOR-RELATED FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | grep -i cursor >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 12. REPORT FILES
echo "12. REPORT FILES (in docs/reports)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR/docs/reports -name "*.md" -type f 2>/dev/null | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 13. GUIDE FILES
echo "13. GUIDE FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*GUIDE*.md" -type f | grep -v node_modules | grep -v .git | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 14. STATUS/SUMMARY FILES
echo "14. STATUS/SUMMARY FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*STATUS*.md" -o -name "*SUMMARY*.md" | grep -v node_modules | grep -v .git | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 15. FILES BY DIRECTORY
echo "15. FILES BY DIRECTORY" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 16. FILES WITH DATES IN NAME
echo "16. FILES WITH DATES IN NAME (potential outdated)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | grep -E "[0-9]{4}|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 17. SIMILAR FILENAMES (potential duplicates)
echo "17. SIMILAR FILENAMES (potential duplicates)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
echo "Files with similar names:" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f | grep -v node_modules | grep -v .git | xargs -n1 basename | sort | uniq -c | sort -rn | grep -v "^ *1 " >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 18. AIX-RELATED FILES
echo "18. AIX-RELATED FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*AIX*.md" -type f | grep -v node_modules | grep -v .git | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 19. AGENT-RELATED FILES
echo "19. AGENT-RELATED FILES" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*AGENT*.md" -type f | grep -v node_modules | grep -v .git | sort >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 20. RECENTLY MODIFIED FILES (last 30 days)
echo "20. RECENTLY MODIFIED FILES (last 30 days)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f -mtime -30 | grep -v node_modules | grep -v .git | xargs ls -lt | head -20 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# 21. OLD FILES (not modified in 90+ days)
echo "21. OLD FILES (not modified in 90+ days)" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f -mtime +90 | grep -v node_modules | grep -v .git | wc -l | xargs echo "Count:" >> $OUTPUT_FILE
find $ROOT_DIR -name "*.md" -type f -mtime +90 | grep -v node_modules | grep -v .git | head -30 >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "==============================================================================" >> $OUTPUT_FILE
echo "ANALYSIS COMPLETE" >> $OUTPUT_FILE
echo "==============================================================================" >> $OUTPUT_FILE

cat $OUTPUT_FILE
