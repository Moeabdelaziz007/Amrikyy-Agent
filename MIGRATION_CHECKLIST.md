# 🔄 v0 to React Migration Checklist

## Files to Fix:

### ✅ Components with "use client":
1. ✅ agent-grid.tsx
2. ✅ desktop-os.tsx
3. ✅ desktop.tsx
4. ✅ floating-ai-chat.tsx
5. ✅ interactive-activity.tsx
6. ✅ live-analytics-overview.tsx
7. ✅ taskbar.tsx

### ❌ Missing Components (need to copy or create):
- [ ] dashboard-mini-app.tsx (exists in v0)
- [ ] chat-mini-app.tsx (exists in v0)
- [ ] settings-mini-app.tsx (exists in v0)
- [ ] analytics-mini-app.tsx (exists in v0)

### ❌ Missing Hooks:
- [ ] hooks/use-sound.ts
- [ ] hooks/use-real-time-data.ts

### ❌ Missing Lib:
- [ ] lib/api/client.ts
- [ ] lib/utils.ts (partially exists)

### ✅ Already Have:
- ✅ All UI components (17 files)
- ✅ types/desktop.ts
- ✅ Window.tsx (from Cursor)
- ✅ Our Mini Apps (Luna, Karim, Kody)

## Changes Needed:

### 1. Remove "use client" directive
```diff
- "use client"
(just delete the line)
```

### 2. Fix @/ imports (already configured in tsconfig.json)
```typescript
// Should work as-is with Vite
import { Button } from "@/components/ui/button"
```

### 3. Replace Next.js Image
```diff
- import Image from 'next/image'
+ // Use regular <img> tag
```

### 4. Replace Next.js Router
```diff
- import { useRouter } from 'next/navigation'
+ import { useNavigate } from 'react-router-dom'
```

## Priority Order:

1. Copy missing mini-app components
2. Create missing hooks (with mock implementations)
3. Create missing lib files
4. Remove "use client" from all files
5. Test compilation
