import SwiftUI

struct TravelPlanDetailView: View {
    let travelPlan: TravelPlan
    @State private var selectedTab = 0
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                headerSection
                
                // Tab Selection
                Picker("View", selection: $selectedTab) {
                    Text("Overview").tag(0)
                    Text("Activities").tag(1)
                    Text("Expenses").tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                
                // Content based on selected tab
                Group {
                    switch selectedTab {
                    case 0:
                        overviewSection
                    case 1:
                        activitiesSection
                    case 2:
                        expensesSection
                    default:
                        EmptyView()
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle(travelPlan.destination)
        .navigationBarTitleDisplayMode(.large)
    }
    
    // MARK: - Header Section
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Destination Image Placeholder
            Rectangle()
                .fill(LinearGradient(
                    colors: [.blue, .purple],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .frame(height: 200)
                .overlay {
                    VStack {
                        Image(systemName: "airplane")
                            .font(.system(size: 50))
                            .foregroundColor(.white)
                        Text(travelPlan.destination)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                }
            
            // Key Info
            HStack(spacing: 20) {
                InfoPill(
                    icon: "calendar",
                    text: "\(travelPlan.duration) days"
                )
                
                InfoPill(
                    icon: "person.2",
                    text: "\(travelPlan.travelers) travelers"
                )
                
                InfoPill(
                    icon: travelPlan.status.icon,
                    text: travelPlan.status.displayName
                )
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Overview Section
    
    private var overviewSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Dates
            InfoCard(title: "Dates") {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Start")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(travelPlan.startDate, style: .date)
                            .font(.headline)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "arrow.right")
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    VStack(alignment: .trailing) {
                        Text("End")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(travelPlan.endDate, style: .date)
                            .font(.headline)
                    }
                }
            }
            
            // Budget
            InfoCard(title: "Budget") {
                VStack(spacing: 12) {
                    ProgressView(value: min(travelPlan.totalExpenses / travelPlan.budget, 1.0)) {
                        HStack {
                            Text("Spent")
                            Spacer()
                            Text("\(Int((travelPlan.totalExpenses / travelPlan.budget) * 100))%")
                        }
                        .font(.caption)
                    }
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Total Budget")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(travelPlan.budget.formattedCurrency(travelPlan.currency))
                                .font(.headline)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing) {
                            Text("Remaining")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(travelPlan.remainingBudget.formattedCurrency(travelPlan.currency))
                                .font(.headline)
                                .foregroundColor(travelPlan.isOverBudget ? .red : .green)
                        }
                    }
                }
            }
            
            // Description
            if let description = travelPlan.description {
                InfoCard(title: "About") {
                    Text(description)
                        .font(.body)
                }
            }
        }
    }
    
    // MARK: - Activities Section
    
    private var activitiesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if travelPlan.activities.isEmpty {
                Text("No activities planned yet")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(travelPlan.activities) { activity in
                    ActivityRow(activity: activity)
                }
            }
        }
    }
    
    // MARK: - Expenses Section
    
    private var expensesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if travelPlan.expenses.isEmpty {
                Text("No expenses recorded yet")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(travelPlan.expenses) { expense in
                    ExpenseRow(expense: expense)
                }
            }
        }
    }
}

// MARK: - Supporting Views

struct InfoPill: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption)
            Text(text)
                .font(.caption)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(20)
    }
}

struct InfoCard<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            content
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct ActivityRow: View {
    let activity: Activity
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: activity.category.icon)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(activity.name)
                    .font(.headline)
                
                if let description = activity.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }
            
            Spacer()
            
            if let cost = activity.cost {
                Text(cost.formattedCurrency("USD"))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.tertiarySystemBackground))
        .cornerRadius(8)
    }
}

struct ExpenseRow: View {
    let expense: Expense
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: expense.category.icon)
                .foregroundColor(.green)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(expense.description)
                    .font(.headline)
                
                Text(expense.date, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(expense.amount.formattedCurrency(expense.currency))
                .font(.headline)
        }
        .padding()
        .background(Color(.tertiarySystemBackground))
        .cornerRadius(8)
    }
}

#Preview {
    NavigationStack {
        TravelPlanDetailView(
            travelPlan: TravelPlan(
                destination: "Tokyo, Japan",
                startDate: Date(),
                endDate: Date().addingTimeInterval(86400 * 7),
                budget: 3000,
                travelers: 2,
                status: .planned,
                description: "Explore the vibrant city of Tokyo"
            )
        )
    }
}

