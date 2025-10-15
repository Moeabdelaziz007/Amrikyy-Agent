import SwiftUI

struct TravelPlanView: View {
    let travelPlan: TravelPlan

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(travelPlan.title)
                        .font(.title)
                        .fontWeight(.bold)

                    Text(travelPlan.description)
                        .font(.body)
                        .foregroundColor(.gray)

                    // Trip dates
                    HStack {
                        Image(systemName: "calendar")
                        Text("\(travelPlan.startDate.formatted(date: .short, time: .omitted)) - \(travelPlan.endDate.formatted(date: .short, time: .omitted))")
                    }
                    .font(.subheadline)
                    .foregroundColor(.blue)
                }
                .padding()

                // Destinations
                VStack(alignment: .leading, spacing: 15) {
                    Text("Destinations")
                        .font(.headline)

                    ForEach(travelPlan.destinations) { destination in
                        DestinationCard(destination: destination)
                    }
                }
                .padding(.horizontal)

                // Budget Summary
                VStack(alignment: .leading, spacing: 10) {
                    Text("Budget Summary")
                        .font(.headline)

                    BudgetSummaryView(budget: travelPlan.budget)
                }
                .padding(.horizontal)

                Spacer()
            }
        }
        .navigationTitle("Travel Plan")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DestinationCard: View {
    let destination: Destination

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(destination.name)
                .font(.headline)

            Text("\(destination.city), \(destination.country)")
                .font(.subheadline)
                .foregroundColor(.gray)

            Text(destination.description)
                .font(.body)
                .lineLimit(2)

            HStack {
                Text("Activities: \(destination.activities.count)")
                Spacer()
                Text("\(destination.currency) \(destination.estimatedCost, specifier: "%.0f")")
                    .fontWeight(.semibold)
            }
            .font(.caption)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
    }
}

struct BudgetSummaryView: View {
    let budget: Budget

    var body: some View {
        VStack(spacing: 15) {
            HStack {
                Text("Total Budget")
                    .font(.headline)
                Spacer()
                Text("\(budget.currency) \(budget.total, specifier: "%.2f")")
                    .fontWeight(.bold)
                    .foregroundColor(.green)
            }

            VStack(alignment: .leading, spacing: 8) {
                BudgetRow(title: "Accommodation", amount: budget.breakdown.accommodation, currency: budget.currency)
                BudgetRow(title: "Transportation", amount: budget.breakdown.transportation, currency: budget.currency)
                BudgetRow(title: "Activities", amount: budget.breakdown.activities, currency: budget.currency)
                BudgetRow(title: "Food", amount: budget.breakdown.food, currency: budget.currency)
                BudgetRow(title: "Miscellaneous", amount: budget.breakdown.miscellaneous, currency: budget.currency)
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(10)
    }
}

struct BudgetRow: View {
    let title: String
    let amount: Double
    let currency: String

    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text("\(currency) \(amount, specifier: "%.2f")")
        }
        .font(.subheadline)
    }
}

struct TravelPlanView_Previews: PreviewProvider {
    static var previews: some View {
        TravelPlanView(travelPlan: TravelPlan(
            id: "1",
            userId: "user1",
            title: "Sample Trip",
            description: "A sample travel plan",
            destinations: [],
            startDate: Date(),
            endDate: Date().addingTimeInterval(86400 * 7),
            budget: Budget(
                total: 2000,
                currency: "USD",
                breakdown: BudgetBreakdown(
                    accommodation: 800,
                    transportation: 400,
                    activities: 300,
                    food: 400,
                    miscellaneous: 100
                )
            ),
            status: .planning,
            createdAt: Date(),
            updatedAt: Date()
        ))
    }
}