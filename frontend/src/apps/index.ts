/**
 * OS Applications Index
 * Export all OS applications
 */

export { MayaTravelApp } from './MayaTravelApp'
export { TripPlannerApp } from './TripPlannerApp'
export { SettingsApp } from './SettingsApp'

// App metadata for OS registration
export const appRegistry = [
  {
    id: 'maya-travel',
    name: 'Maya Travel Assistant',
    icon: '✈️',
    component: 'MayaTravelApp',
    description: 'AI-powered travel planning and booking',
    permissions: ['ai', 'booking', 'maps']
  },
  {
    id: 'trip-planner',
    name: 'Trip Planner',
    icon: '🗺️',
    component: 'TripPlannerApp',
    description: 'Multi-destination trip planning',
    permissions: ['maps', 'booking']
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    component: 'SettingsApp',
    description: 'System settings and preferences',
    permissions: ['system']
  }
]
