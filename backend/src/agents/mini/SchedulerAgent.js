/**
 * Scheduler Agent - Calendar & Time Management
 * Specialization: Event scheduling and time management
 */

const logger = require('../../utils/logger');

class SchedulerAgent {
  constructor() {
    this.name = 'Scheduler';
    this.icon = '📅';
    this.events = new Map(); // In-memory storage (replace with DB in production)
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[SchedulerAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'CREATE_EVENT':
          return await this.createEvent(task.event);
        case 'GET_EVENTS':
          return await this.getEvents(task.startDate, task.endDate);
        case 'UPDATE_EVENT':
          return await this.updateEvent(task.eventId, task.updates);
        case 'DELETE_EVENT':
          return await this.deleteEvent(task.eventId);
        case 'CHECK_AVAILABILITY':
          return await this.checkAvailability(task.date, task.duration);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[SchedulerAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create event
   */
  async createEvent(eventData) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      title: eventData.title,
      description: eventData.description || '',
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      location: eventData.location || '',
      attendees: eventData.attendees || [],
      reminders: eventData.reminders || [],
      createdAt: new Date()
    };

    this.events.set(eventId, event);

    return {
      success: true,
      event,
      message: 'Event created successfully'
    };
  }

  /**
   * Get events in date range
   */
  async getEvents(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const events = Array.from(this.events.values())
      .filter(event => 
        event.startTime >= start && event.startTime <= end
      )
      .sort((a, b) => a.startTime - b.startTime);

    return {
      success: true,
      events,
      count: events.length,
      dateRange: { start: startDate, end: endDate }
    };
  }

  /**
   * Update event
   */
  async updateEvent(eventId, updates) {
    const event = this.events.get(eventId);
    
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date()
    };

    this.events.set(eventId, updatedEvent);

    return {
      success: true,
      event: updatedEvent,
      message: 'Event updated successfully'
    };
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId) {
    const event = this.events.get(eventId);
    
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    this.events.delete(eventId);

    return {
      success: true,
      eventId,
      message: 'Event deleted successfully'
    };
  }

  /**
   * Check availability
   */
  async checkAvailability(date, duration) {
    const checkDate = new Date(date);
    const endTime = new Date(checkDate.getTime() + duration * 60000); // duration in minutes

    const conflicts = Array.from(this.events.values())
      .filter(event => {
        return (
          (checkDate >= event.startTime && checkDate < event.endTime) ||
          (endTime > event.startTime && endTime <= event.endTime) ||
          (checkDate <= event.startTime && endTime >= event.endTime)
        );
      });

    return {
      success: true,
      available: conflicts.length === 0,
      conflicts,
      suggestedTimes: conflicts.length > 0 ? this.suggestAlternativeTimes(checkDate, duration) : []
    };
  }

  /**
   * Suggest alternative times
   */
  suggestAlternativeTimes(requestedTime, duration) {
    const suggestions = [];
    const baseTime = new Date(requestedTime);

    // Suggest 3 alternative times (1 hour before, 2 hours after, next day same time)
    suggestions.push(new Date(baseTime.getTime() - 60 * 60000)); // 1 hour before
    suggestions.push(new Date(baseTime.getTime() + 2 * 60 * 60000)); // 2 hours after
    suggestions.push(new Date(baseTime.getTime() + 24 * 60 * 60000)); // next day

    return suggestions.map(time => ({
      time: time.toISOString(),
      available: true // Simplified - should check actual availability
    }));
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: 'active',
      capabilities: [
        'CREATE_EVENT',
        'GET_EVENTS',
        'UPDATE_EVENT',
        'DELETE_EVENT',
        'CHECK_AVAILABILITY'
      ],
      totalEvents: this.events.size
    };
  }
}

module.exports = SchedulerAgent;
