/**
 * Settings App - OS Settings and Preferences
 * 
 * Features:
 * - Theme selector (light/dark/custom)
 * - Language toggle
 * - Wallpaper picker
 * - Notification settings
 * - About section with system info
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings,
  Palette,
  Globe,
  Image,
  Bell,
  Info,
  Sun,
  Moon,
  Monitor,
  Check,
  Volume2,
  VolumeX,
  Wifi,
  Keyboard,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SettingsAppProps {
  className?: string
  onClose?: () => void
}

interface SystemInfo {
  osName: string
  osVersion: string
  aiModel: string
  initialized: boolean
  uptime: number
  windowsOpen: number
  appsRunning: number
}

export function SettingsApp({ className, onClose }: SettingsAppProps) {
  // Theme settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [accentColor, setAccentColor] = useState('blue')
  
  // Language settings
  const [language, setLanguage] = useState('en')
  
  // Wallpaper settings
  const [wallpaper, setWallpaper] = useState('gradient-1')
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  
  // Accessibility settings
  const [reducedMotion, setReducedMotion] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  
  // System info
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('amrikyy_settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        setTheme(parsed.theme || 'system')
        setAccentColor(parsed.accentColor || 'blue')
        setLanguage(parsed.language || 'en')
        setWallpaper(parsed.wallpaper || 'gradient-1')
        setNotificationsEnabled(parsed.notificationsEnabled ?? true)
        setSoundEnabled(parsed.soundEnabled ?? true)
        setDesktopNotifications(parsed.desktopNotifications ?? true)
        setReducedMotion(parsed.reducedMotion ?? false)
        setLargeText(parsed.largeText ?? false)
        setHighContrast(parsed.highContrast ?? false)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  // Fetch system info
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('/api/os/status')
        const data = await response.json()
        
        if (data.success) {
          setSystemInfo({
            osName: data.data.systemInfo?.name || 'Amrikyy AI OS',
            osVersion: data.data.systemInfo?.version || '1.0.0',
            aiModel: data.data.systemInfo?.aiModel || 'gemini-2.0-flash-exp',
            initialized: data.data.initialized,
            uptime: Date.now() - new Date().getTime(),
            windowsOpen: data.data.windows || 0,
            appsRunning: data.data.runningApps || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch system info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemInfo()
  }, [])

  // Save settings
  const saveSettings = () => {
    const settings = {
      theme,
      accentColor,
      language,
      wallpaper,
      notificationsEnabled,
      soundEnabled,
      desktopNotifications,
      reducedMotion,
      largeText,
      highContrast
    }
    
    localStorage.setItem('amrikyy_settings', JSON.stringify(settings))
    
    // Apply theme
    document.documentElement.classList.remove('light', 'dark')
    if (theme !== 'system') {
      document.documentElement.classList.add(theme)
    }
    
    alert('Settings saved successfully!')
  }

  // Apply theme immediately
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    if (theme !== 'system') {
      document.documentElement.classList.add(theme)
    }
  }, [theme])

  // Wallpaper options
  const wallpapers = [
    { id: 'gradient-1', name: 'Blue Gradient', color: 'from-blue-500 to-purple-600' },
    { id: 'gradient-2', name: 'Sunset', color: 'from-orange-400 to-pink-600' },
    { id: 'gradient-3', name: 'Forest', color: 'from-green-400 to-teal-600' },
    { id: 'gradient-4', name: 'Ocean', color: 'from-cyan-400 to-blue-600' },
    { id: 'gradient-5', name: 'Aurora', color: 'from-purple-400 to-pink-600' },
    { id: 'solid-dark', name: 'Dark', color: 'bg-gray-900' },
    { id: 'solid-light', name: 'Light', color: 'bg-gray-100' }
  ]

  // Accent colors
  const accentColors = [
    { id: 'blue', name: 'Blue', hex: '#3b82f6' },
    { id: 'purple', name: 'Purple', hex: '#a855f7' },
    { id: 'green', name: 'Green', hex: '#10b981' },
    { id: 'orange', name: 'Orange', hex: '#f97316' },
    { id: 'pink', name: 'Pink', hex: '#ec4899' },
    { id: 'teal', name: 'Teal', hex: '#14b8a6' }
  ]

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Settings className="w-8 h-8 text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Settings</h2>
            <p className="text-xs text-muted-foreground">
              Customize your OS experience
            </p>
          </div>
        </div>

        <Button onClick={saveSettings} variant="default" size="sm">
          <Check className="w-4 h-4 mr-1" />
          Save Changes
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="language">
                <Globe className="w-4 h-4 mr-2" />
                Language
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="about">
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 mt-4">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theme</CardTitle>
                  <CardDescription>
                    Choose your preferred color scheme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="h-24 flex-col gap-2"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-6 h-6" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="h-24 flex-col gap-2"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-6 h-6" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="h-24 flex-col gap-2"
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className="w-6 h-6" />
                      System
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Accent Color */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Accent Color</CardTitle>
                  <CardDescription>
                    Personalize your interface color
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setAccentColor(color.id)}
                        className={cn(
                          'w-12 h-12 rounded-full transition-all',
                          accentColor === color.id && 'ring-2 ring-offset-2 ring-primary scale-110'
                        )}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {accentColor === color.id && (
                          <Check className="w-5 h-5 text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Wallpaper */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Desktop Wallpaper</CardTitle>
                  <CardDescription>
                    Choose your desktop background
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {wallpapers.map(wp => (
                      <button
                        key={wp.id}
                        onClick={() => setWallpaper(wp.id)}
                        className={cn(
                          'h-24 rounded-lg transition-all border-2',
                          wallpaper === wp.id ? 'border-primary scale-105' : 'border-transparent',
                          'bg-gradient-to-br',
                          wp.color
                        )}
                      >
                        <div className="flex items-center justify-center h-full">
                          {wallpaper === wp.id && (
                            <Check className="w-6 h-6 text-white drop-shadow-lg" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Accessibility</CardTitle>
                  <CardDescription>
                    Make the OS easier to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">Large Text</Label>
                    <Switch
                      id="large-text"
                      checked={largeText}
                      onCheckedChange={setLargeText}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Switch
                      id="high-contrast"
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language Tab */}
            <TabsContent value="language" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Display Language</CardTitle>
                  <CardDescription>
                    Choose your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Current language: <strong>{language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Some features may require a restart to apply language changes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Keyboard Layout</CardTitle>
                  <CardDescription>
                    Configure your keyboard preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-muted-foreground" />
                      <Label>Auto-detect keyboard layout</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                    <Switch
                      id="desktop-notifications"
                      checked={desktopNotifications}
                      onCheckedChange={setDesktopNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Label htmlFor="sound">Notification Sounds</Label>
                    </div>
                    <Switch
                      id="sound"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Do Not Disturb</CardTitle>
                  <CardDescription>
                    Silence notifications during specific times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Configure Schedule
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>Amrikyy AI OS</CardTitle>
                      <CardDescription>
                        First AI-Native Operating System
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Version</Label>
                      <p className="text-sm font-medium">{systemInfo?.osVersion || 'Loading...'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">AI Model</Label>
                      <p className="text-sm font-medium">{systemInfo?.aiModel || 'Loading...'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge variant={systemInfo?.initialized ? 'default' : 'secondary'}>
                        {systemInfo?.initialized ? 'Running' : 'Starting...'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Windows Open</Label>
                      <p className="text-sm font-medium">{systemInfo?.windowsOpen || 0}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground mb-2 block">Powered By</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Google Gemini Pro</Badge>
                      <Badge variant="outline">React 18</Badge>
                      <Badge variant="outline">Node.js</Badge>
                      <Badge variant="outline">Supabase</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    <p>© 2025 Mohamed Hossameldin Abdelaziz</p>
                    <p>AMRIKYY AI Solutions</p>
                    <p className="mt-2">All rights reserved.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Apps Running</span>
                    <span className="font-medium">{systemInfo?.appsRunning || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-500">Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Check for Updates
                </Button>
                <Button variant="outline" className="flex-1">
                  Documentation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <Button onClick={saveSettings} className="w-full">
          <Check className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  )
}

export default SettingsApp
