/**
 * Revenue Calculator Service
 * Calculates and projects revenue from multiple sources
 * Integrates travel bookings and freelance opportunities
 */

const winston = require('winston');

class RevenueCalculator {
  constructor(supabaseClient, moneyHunterSystem) {
    this.supabase = supabaseClient;
    this.moneyHunter = moneyHunterSystem;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/revenue-calculator.log' }),
        new winston.transports.Console()
      ]
    });

    this.revenueData = {
      travel: {
        current: 0,
        projected: 0,
        bookings: []
      },
      freelance: {
        current: 0,
        projected: 0,
        opportunities: []
      },
      combined: {
        current: 0,
        projected: 0,
        growth_rate: 0
      }
    };

    this.initializeRevenueTracking();
  }

  async initializeRevenueTracking() {
    try {
      // Load existing revenue data
      await this.loadTravelRevenue();
      await this.loadFreelanceRevenue();
      this.calculateCombinedRevenue();
      
      this.logger.info('Revenue tracking initialized', {
        travel_current: this.revenueData.travel.current,
        freelance_current: this.revenueData.freelance.current,
        combined_current: this.revenueData.combined.current
      });
    } catch (error) {
      this.logger.error('Failed to initialize revenue tracking', { error: error.message });
    }
  }

  // Travel Revenue Calculations
  async loadTravelRevenue() {
    try {
      if (!this.supabase) {
        this.logger.warn('Supabase client not available, using mock data');
        this.generateMockTravelRevenue();
        return;
      }

      // Get completed bookings
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('status', 'completed');

      if (error) {
        this.logger.error('Failed to load travel bookings', { error: error.message });
        this.generateMockTravelRevenue();
        return;
      }

      this.revenueData.travel.bookings = bookings || [];
      this.revenueData.travel.current = bookings?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0) || 0;

      // Calculate projected revenue
      this.calculateTravelProjection();

      this.logger.info('Travel revenue loaded', {
        bookings_count: bookings?.length || 0,
        current_revenue: this.revenueData.travel.current
      });
    } catch (error) {
      this.logger.error('Error loading travel revenue', { error: error.message });
      this.generateMockTravelRevenue();
    }
  }

  generateMockTravelRevenue() {
    // Generate realistic travel booking data
    const mockBookings = Array.from({ length: 15 }, (_, i) => ({
      id: `booking_${i + 1}`,
      total_amount: Math.floor(Math.random() * 2000) + 300,
      currency: 'USD',
      status: 'completed',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      destination: ['Dubai', 'Istanbul', 'Paris', 'London', 'Tokyo'][Math.floor(Math.random() * 5)],
      trip_type: ['business', 'leisure', 'family'][Math.floor(Math.random() * 3)]
    }));

    this.revenueData.travel.bookings = mockBookings;
    this.revenueData.travel.current = mockBookings.reduce((sum, booking) => 
      sum + booking.total_amount, 0);
    
    this.calculateTravelProjection();
  }

  calculateTravelProjection() {
    const bookings = this.revenueData.travel.bookings;
    const currentMonthRevenue = this.calculateMonthlyRevenue(bookings);
    
    // Project based on growth trends
    const growthRate = 0.15; // 15% monthly growth
    this.revenueData.travel.projected = currentMonthRevenue * (1 + growthRate) * 12; // Annual projection
    
    this.logger.info('Travel projection calculated', {
      current_month: currentMonthRevenue,
      projected_annual: this.revenueData.travel.projected
    });
  }

  calculateMonthlyRevenue(bookings) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + booking.total_amount, 0);
  }

  // Freelance Revenue Calculations
  async loadFreelanceRevenue() {
    try {
      if (!this.moneyHunter) {
        this.logger.warn('Money Hunter system not available, using mock data');
        this.generateMockFreelanceRevenue();
        return;
      }

      const opportunities = this.moneyHunter.getOpportunities();
      const validatedOpportunities = this.moneyHunter.getValidatedOpportunities();
      
      this.revenueData.freelance.opportunities = validatedOpportunities;
      
      // Calculate current revenue from completed projects
      this.revenueData.freelance.current = validatedOpportunities
        .filter(opp => opp.status === 'completed')
        .reduce((sum, opp) => sum + (opp.budget || 0), 0);

      // Calculate projected revenue
      this.calculateFreelanceProjection();

      this.logger.info('Freelance revenue loaded', {
        opportunities_count: opportunities.length,
        validated_count: validatedOpportunities.length,
        current_revenue: this.revenueData.freelance.current
      });
    } catch (error) {
      this.logger.error('Error loading freelance revenue', { error: error.message });
      this.generateMockFreelanceRevenue();
    }
  }

  generateMockFreelanceRevenue() {
    // Generate realistic freelance opportunity data
    const mockOpportunities = Array.from({ length: 25 }, (_, i) => ({
      id: `freelance_${i + 1}`,
      budget: Math.floor(Math.random() * 8000) + 1000,
      platform: ['upwork', 'fiverr', 'freelancer'][Math.floor(Math.random() * 3)],
      status: ['completed', 'in_progress', 'pending'][Math.floor(Math.random() * 3)],
      validated_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: ['AI Development', 'Web Development', 'Data Analysis', 'Consulting'][Math.floor(Math.random() * 4)],
      client_rating: 4.2 + Math.random() * 0.8,
      profitability_score: Math.floor(Math.random() * 30) + 70
    }));

    this.revenueData.freelance.opportunities = mockOpportunities;
    this.revenueData.freelance.current = mockOpportunities
      .filter(opp => opp.status === 'completed')
      .reduce((sum, opp) => sum + opp.budget, 0);
    
    this.calculateFreelanceProjection();
  }

  calculateFreelanceProjection() {
    const opportunities = this.revenueData.freelance.opportunities;
    const completedProjects = opportunities.filter(opp => opp.status === 'completed');
    const averageProjectValue = completedProjects.length > 0 
      ? completedProjects.reduce((sum, opp) => sum + opp.budget, 0) / completedProjects.length
      : 3000; // Default average

    // Project based on validation rate and completion rate
    const validationRate = 0.75; // 75% of detected opportunities get validated
    const completionRate = 0.60; // 60% of validated opportunities get completed
    const monthlyOpportunities = 20; // Expected monthly opportunities
    
    const monthlyRevenue = monthlyOpportunities * validationRate * completionRate * averageProjectValue;
    this.revenueData.freelance.projected = monthlyRevenue * 12; // Annual projection
    
    this.logger.info('Freelance projection calculated', {
      average_project_value: averageProjectValue,
      monthly_revenue: monthlyRevenue,
      projected_annual: this.revenueData.freelance.projected
    });
  }

  // Combined Revenue Calculations
  calculateCombinedRevenue() {
    this.revenueData.combined.current = 
      this.revenueData.travel.current + this.revenueData.freelance.current;
    
    this.revenueData.combined.projected = 
      this.revenueData.travel.projected + this.revenueData.freelance.projected;
    
    // Calculate growth rate
    const currentAnnual = this.revenueData.combined.current * 12; // Rough annual from current
    this.revenueData.combined.growth_rate = 
      (this.revenueData.combined.projected - currentAnnual) / currentAnnual * 100;
    
    this.logger.info('Combined revenue calculated', {
      current_total: this.revenueData.combined.current,
      projected_annual: this.revenueData.combined.projected,
      growth_rate: this.revenueData.combined.growth_rate
    });
  }

  // Public API Methods
  async getCurrentRevenue() {
    await this.refreshRevenueData();
    return {
      travel: this.revenueData.travel.current,
      freelance: this.revenueData.freelance.current,
      combined: this.revenueData.combined.current,
      breakdown: {
        travel_percentage: (this.revenueData.travel.current / this.revenueData.combined.current) * 100,
        freelance_percentage: (this.revenueData.freelance.current / this.revenueData.combined.current) * 100
      },
      timestamp: new Date().toISOString()
    };
  }

  async getProjectedRevenue() {
    await this.refreshRevenueData();
    return {
      annual_projection: this.revenueData.combined.projected,
      monthly_projection: this.revenueData.combined.projected / 12,
      growth_rate: this.revenueData.combined.growth_rate,
      breakdown: {
        travel_projected: this.revenueData.travel.projected,
        freelance_projected: this.revenueData.freelance.projected,
        travel_percentage: (this.revenueData.travel.projected / this.revenueData.combined.projected) * 100,
        freelance_percentage: (this.revenueData.freelance.projected / this.revenueData.combined.projected) * 100
      },
      forecast_months: this.generateMonthlyForecast(),
      timestamp: new Date().toISOString()
    };
  }

  generateMonthlyForecast() {
    const months = [];
    const currentMonth = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const monthlyTravel = this.revenueData.travel.projected / 12;
      const monthlyFreelance = this.revenueData.freelance.projected / 12;
      
      months.push({
        month: month.toISOString().substring(0, 7), // YYYY-MM format
        travel_revenue: monthlyTravel,
        freelance_revenue: monthlyFreelance,
        total_revenue: monthlyTravel + monthlyFreelance,
        cumulative_total: (monthlyTravel + monthlyFreelance) * (i + 1)
      });
    }
    
    return months;
  }

  async getRevenueBreakdown() {
    await this.refreshRevenueData();
    return {
      travel: {
        current: this.revenueData.travel.current,
        projected: this.revenueData.travel.projected,
        bookings_count: this.revenueData.travel.bookings.length,
        average_booking_value: this.revenueData.travel.bookings.length > 0 
          ? this.revenueData.travel.current / this.revenueData.travel.bookings.length 
          : 0,
        top_destinations: this.getTopDestinations()
      },
      freelance: {
        current: this.revenueData.freelance.current,
        projected: this.revenueData.freelance.projected,
        opportunities_count: this.revenueData.freelance.opportunities.length,
        average_project_value: this.revenueData.freelance.opportunities.length > 0
          ? this.revenueData.freelance.current / this.revenueData.freelance.opportunities.length
          : 0,
        top_platforms: this.getTopPlatforms(),
        top_project_types: this.getTopProjectTypes()
      },
      combined: {
        current: this.revenueData.combined.current,
        projected: this.revenueData.combined.projected,
        growth_rate: this.revenueData.combined.growth_rate,
        revenue_diversification: {
          travel_share: (this.revenueData.travel.current / this.revenueData.combined.current) * 100,
          freelance_share: (this.revenueData.freelance.current / this.revenueData.combined.current) * 100
        }
      }
    };
  }

  getTopDestinations() {
    const destinations = {};
    this.revenueData.travel.bookings.forEach(booking => {
      destinations[booking.destination] = (destinations[booking.destination] || 0) + booking.total_amount;
    });
    
    return Object.entries(destinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, revenue]) => ({ destination, revenue }));
  }

  getTopPlatforms() {
    const platforms = {};
    this.revenueData.freelance.opportunities.forEach(opp => {
      platforms[opp.platform] = (platforms[opp.platform] || 0) + opp.budget;
    });
    
    return Object.entries(platforms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform, revenue]) => ({ platform, revenue }));
  }

  getTopProjectTypes() {
    const projectTypes = {};
    this.revenueData.freelance.opportunities.forEach(opp => {
      projectTypes[opp.project_type] = (projectTypes[opp.project_type] || 0) + 1;
    });
    
    return Object.entries(projectTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  async refreshRevenueData() {
    try {
      await this.loadTravelRevenue();
      await this.loadFreelanceRevenue();
      this.calculateCombinedRevenue();
    } catch (error) {
      this.logger.error('Failed to refresh revenue data', { error: error.message });
    }
  }

  // Revenue Update Methods (called by external systems)
  updateTravelRevenue(booking) {
    this.revenueData.travel.bookings.push(booking);
    this.revenueData.travel.current += booking.total_amount || 0;
    this.calculateCombinedRevenue();
    
    this.logger.info('Travel revenue updated', {
      booking_id: booking.id,
      amount: booking.total_amount,
      new_total: this.revenueData.travel.current
    });
  }

  updateFreelanceRevenue(opportunity) {
    this.revenueData.freelance.opportunities.push(opportunity);
    if (opportunity.status === 'completed') {
      this.revenueData.freelance.current += opportunity.budget || 0;
    }
    this.calculateCombinedRevenue();
    
    this.logger.info('Freelance revenue updated', {
      opportunity_id: opportunity.id,
      budget: opportunity.budget,
      status: opportunity.status,
      new_total: this.revenueData.freelance.current
    });
  }

  // Analytics and Insights
  async getRevenueInsights() {
    await this.refreshRevenueData();
    
    const insights = {
      performance_summary: {
        total_current_revenue: this.revenueData.combined.current,
        total_projected_annual: this.revenueData.combined.projected,
        growth_trajectory: this.revenueData.combined.growth_rate > 0 ? 'positive' : 'negative',
        revenue_diversification_score: this.calculateDiversificationScore()
      },
      recommendations: this.generateRecommendations(),
      trends: this.analyzeTrends(),
      risk_assessment: this.assessRevenueRisks()
    };

    return insights;
  }

  calculateDiversificationScore() {
    const travelShare = this.revenueData.travel.current / this.revenueData.combined.current;
    const freelanceShare = this.revenueData.freelance.current / this.revenueData.combined.current;
    
    // Higher score for better diversification (closer to 50/50 split)
    const idealSplit = 0.5;
    const travelDeviation = Math.abs(travelShare - idealSplit);
    const freelanceDeviation = Math.abs(freelanceShare - idealSplit);
    
    return Math.max(0, 100 - ((travelDeviation + freelanceDeviation) * 100));
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.revenueData.combined.growth_rate < 10) {
      recommendations.push('Consider expanding into new revenue streams to improve growth rate');
    }
    
    if (this.revenueData.travel.current > this.revenueData.freelance.current * 3) {
      recommendations.push('Diversify revenue by increasing freelance opportunity focus');
    }
    
    if (this.revenueData.freelance.current > this.revenueData.travel.current * 3) {
      recommendations.push('Consider expanding travel services to balance revenue streams');
    }
    
    recommendations.push('Optimize high-value opportunities for maximum ROI');
    recommendations.push('Implement automated revenue tracking for better insights');
    
    return recommendations;
  }

  analyzeTrends() {
    return {
      revenue_growth: this.revenueData.combined.growth_rate > 0 ? 'increasing' : 'decreasing',
      diversification_trend: this.calculateDiversificationScore() > 70 ? 'well_diversified' : 'needs_improvement',
      platform_performance: this.getTopPlatforms(),
      seasonal_patterns: 'stable_growth' // Could be enhanced with historical data
    };
  }

  assessRevenueRisks() {
    return {
      concentration_risk: this.calculateDiversificationScore() < 60 ? 'high' : 'low',
      growth_sustainability: this.revenueData.combined.growth_rate > 20 ? 'moderate' : 'low',
      market_dependency: 'moderate',
      overall_risk_level: 'low'
    };
  }
}

module.exports = RevenueCalculator;

