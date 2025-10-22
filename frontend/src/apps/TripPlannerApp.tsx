/**
 * Trip Planner App - Multi-Destination Trip Planning
 * 
 * Features:
 * - Multi-destination trip builder
 * - Date picker for travel dates
 * - Budget calculator
 * - Google Maps preview
 * - Save/Load trips
 * - Export itinerary
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  Save,
  FolderOpen,
  Download,
  Plane,
  Hotel,
  Car,
  Utensils,
  Palmtree,
  ArrowRight,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Destination {
  id: string
  name: string
  country: string
  arrivalDate: string
  departureDate: string
  budget: number
  notes: string
  activities: string[]
}

interface Trip {
  id: string
  name: string
  destinations: Destination[]
  totalBudget: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

interface TripPlannerAppProps {
  className?: string
  onClose?: () => void
}

export function TripPlannerApp({ className, onClose }: TripPlannerAppProps) {
  const [tripName, setTripName] = useState('My Amazing Trip')
  const [currency, setCurrency] = useState('USD')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [savedTrips, setSavedTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [showSavedTrips, setShowSavedTrips] = useState(false)

  // Load saved trips from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('amrikyy_trips')
    if (stored) {
      try {
        const trips = JSON.parse(stored)
        setSavedTrips(trips)
      } catch (error) {
        console.error('Failed to load trips:', error)
      }
    }
  }, [])

  /**
   * Add a new destination
   */
  const addDestination = () => {
    const newDestination: Destination = {
      id: Date.now().toString(),
      name: '',
      country: '',
      arrivalDate: '',
      departureDate: '',
      budget: 0,
      notes: '',
      activities: []
    }

    setDestinations([...destinations, newDestination])
  }

  /**
   * Update a destination
   */
  const updateDestination = (id: string, updates: Partial<Destination>) => {
    setDestinations(destinations.map(dest => 
      dest.id === id ? { ...dest, ...updates } : dest
    ))
  }

  /**
   * Remove a destination
   */
  const removeDestination = (id: string) => {
    setDestinations(destinations.filter(dest => dest.id !== id))
  }

  /**
   * Calculate total budget
   */
  const calculateTotalBudget = (): number => {
    return destinations.reduce((total, dest) => total + (dest.budget || 0), 0)
  }

  /**
   * Calculate trip duration
   */
  const calculateDuration = (): number => {
    if (destinations.length === 0) return 0

    const dates = destinations
      .filter(d => d.arrivalDate && d.departureDate)
      .flatMap(d => [new Date(d.arrivalDate), new Date(d.departureDate)])

    if (dates.length === 0) return 0

    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))

    return Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Save trip
   */
  const saveTrip = () => {
    const trip: Trip = {
      id: selectedTrip || Date.now().toString(),
      name: tripName,
      destinations,
      totalBudget: calculateTotalBudget(),
      currency,
      createdAt: selectedTrip 
        ? savedTrips.find(t => t.id === selectedTrip)?.createdAt || new Date()
        : new Date(),
      updatedAt: new Date()
    }

    const updatedTrips = selectedTrip
      ? savedTrips.map(t => t.id === selectedTrip ? trip : t)
      : [...savedTrips, trip]

    setSavedTrips(updatedTrips)
    localStorage.setItem('amrikyy_trips', JSON.stringify(updatedTrips))
    setSelectedTrip(trip.id)

    alert('Trip saved successfully!')
  }

  /**
   * Load trip
   */
  const loadTrip = (trip: Trip) => {
    setTripName(trip.name)
    setCurrency(trip.currency)
    setDestinations(trip.destinations)
    setSelectedTrip(trip.id)
    setShowSavedTrips(false)
  }

  /**
   * Delete trip
   */
  const deleteTrip = (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    const updatedTrips = savedTrips.filter(t => t.id !== id)
    setSavedTrips(updatedTrips)
    localStorage.setItem('amrikyy_trips', JSON.stringify(updatedTrips))

    if (selectedTrip === id) {
      setSelectedTrip(null)
    }
  }

  /**
   * Export trip as JSON
   */
  const exportTrip = () => {
    const trip: Trip = {
      id: selectedTrip || Date.now().toString(),
      name: tripName,
      destinations,
      totalBudget: calculateTotalBudget(),
      currency,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const dataStr = JSON.stringify(trip, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${tripName.replace(/\s+/g, '_')}_trip.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  /**
   * New trip
   */
  const newTrip = () => {
    if (destinations.length > 0 && !confirm('Start a new trip? Unsaved changes will be lost.')) {
      return
    }

    setTripName('My Amazing Trip')
    setCurrency('USD')
    setDestinations([])
    setSelectedTrip(null)
  }

  const totalBudget = calculateTotalBudget()
  const duration = calculateDuration()

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Globe className="w-8 h-8 text-blue-500" />
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Trip Planner</h2>
            <p className="text-xs text-muted-foreground">
              Plan your perfect journey
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={newTrip} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button 
            onClick={() => setShowSavedTrips(!showSavedTrips)} 
            variant="outline" 
            size="sm"
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            Load ({savedTrips.length})
          </Button>
          <Button onClick={saveTrip} variant="default" size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Saved Trips Panel */}
      <AnimatePresence>
        {showSavedTrips && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-muted/30 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3">Saved Trips</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedTrips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved trips yet</p>
                ) : (
                  savedTrips.map(trip => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{trip.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.destinations.length} destinations • {trip.currency} {trip.totalBudget}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => loadTrip(trip)}
                          variant="ghost"
                          size="sm"
                        >
                          Load
                        </Button>
                        <Button
                          onClick={() => deleteTrip(trip.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Info */}
      <div className="p-4 space-y-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Europe Adventure 2025"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="SAR">SAR (﷼)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4">
          <Badge variant="outline" className="gap-2">
            <MapPin className="w-3 h-3" />
            {destinations.length} Destinations
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Calendar className="w-3 h-3" />
            {duration} Days
          </Badge>
          <Badge variant="outline" className="gap-2">
            <DollarSign className="w-3 h-3" />
            {currency} {totalBudget.toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* Destinations */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Destinations</h3>
            <Button onClick={addDestination} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Destination
            </Button>
          </div>

          {destinations.length === 0 ? (
            <Card className="p-8 text-center">
              <Palmtree className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No destinations yet. Start building your trip!
              </p>
              <Button onClick={addDestination} variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Destination
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {destinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{index + 1}</span>
                            </div>
                            <CardTitle className="text-base">
                              Destination {index + 1}
                            </CardTitle>
                          </div>
                          <Button
                            onClick={() => removeDestination(destination.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>City</Label>
                            <Input
                              placeholder="e.g., Paris"
                              value={destination.name}
                              onChange={(e) => updateDestination(destination.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Input
                              placeholder="e.g., France"
                              value={destination.country}
                              onChange={(e) => updateDestination(destination.id, { country: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Arrival Date</Label>
                            <Input
                              type="date"
                              value={destination.arrivalDate}
                              onChange={(e) => updateDestination(destination.id, { arrivalDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Departure Date</Label>
                            <Input
                              type="date"
                              value={destination.departureDate}
                              onChange={(e) => updateDestination(destination.id, { departureDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Budget ({currency})</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={destination.budget || ''}
                            onChange={(e) => updateDestination(destination.id, { budget: parseFloat(e.target.value) || 0 })}
                          />
                        </div>

                        <div>
                          <Label>Notes & Activities</Label>
                          <Textarea
                            placeholder="e.g., Visit Eiffel Tower, Try local cuisine..."
                            value={destination.notes}
                            onChange={(e) => updateDestination(destination.id, { notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {index < destinations.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {destinations.length > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button onClick={exportTrip} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Trip
            </Button>
            <Button onClick={saveTrip} variant="default" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Trip
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripPlannerApp
