import { BaseAgent } from './BaseAgent';

// Mocking the old agents for capability integration
const Luna = { planTrip: (req: any) => `Itinerary for ${req.destination}` };
const Karim = { optimizeBudget: (req: any) => `Budget optimized for ${req.budget}` };
const Scout = { findDeals: (req: any) => `Deals found for ${req.destination}` };

export class TravelAgent extends BaseAgent {
  constructor() {
    super('TravelAgent', ['plan_trip', 'optimize_budget', 'find_deals', 'full_travel_service']);
  }

  async execute(request: { type: string; payload: any }): Promise<any> {
    switch (request.type) {
      case 'plan_trip':
        return Luna.planTrip(request.payload);

      case 'optimize_budget':
        return Karim.optimizeBudget(request.payload);

      case 'find_deals':
        return Scout.findDeals(request.payload);

      case 'full_travel_service':
        const itinerary = await Luna.planTrip(request.payload);
        const budgetAnalysis = await Karim.optimizeBudget(request.payload);
        const deals = await Scout.findDeals(request.payload);
        return {
          itinerary,
          budgetAnalysis,
          deals,
          summary: 'Full travel package created successfully.',
        };

      default:
        throw new Error(`Unsupported request type: ${request.type}`);
    }
  }
}
