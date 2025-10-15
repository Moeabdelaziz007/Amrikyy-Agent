import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authService: AuthService
    @StateObject private var telegramService = TelegramIntegrationService.shared
    @State private var showingDeleteConfirmation = false
    @State private var showingUnlinkConfirmation = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                
                // MARK: - Profile Header
                VStack(spacing: 16) {
                    // Avatar
                    if let avatar = authService.currentUser?.avatar, let url = URL(string: avatar) {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .foregroundColor(.gray)
                        }
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.blue, lineWidth: 3))
                    } else {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .foregroundColor(.blue)
                            .frame(width: 100, height: 100)
                    }
                    
                    // Name
                    Text(authService.currentUser?.name ?? "Guest")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    // Email
                    if let email = authService.currentUser?.email {
                        Text(email)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                }
                .padding(.top, 20)
                
                // MARK: - Telegram Integration
                VStack(alignment: .leading, spacing: 12) {
                    Text("Connected Accounts")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    // Telegram Connection Card
                    HStack(spacing: 16) {
                        // Telegram Icon
                        Image(systemName: "paperplane.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.blue)
                            .frame(width: 50, height: 50)
                            .background(Color.blue.opacity(0.1))
                            .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Telegram")
                                .font(.headline)
                            
                            if telegramService.isLinked {
                                if let user = telegramService.telegramUser {
                                    Text("@\(user.username ?? user.firstName)")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                Text("Connected")
                                    .font(.caption)
                                    .foregroundColor(.green)
                            } else {
                                Text("Not connected")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        Spacer()
                        
                        if telegramService.isLoading {
                            ProgressView()
                        } else if telegramService.isLinked {
                            Button("Unlink") {
                                showingUnlinkConfirmation = true
                            }
                            .foregroundColor(.red)
                        } else {
                            Button("Connect") {
                                telegramService.openTelegramToLink()
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(Color.blue)
                            .cornerRadius(20)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
                
                // MARK: - Settings Sections
                VStack(alignment: .leading, spacing: 12) {
                    Text("Settings")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    VStack(spacing: 0) {
                        // Notifications
                        SettingsRow(
                            icon: "bell.fill",
                            title: "Notifications",
                            color: .orange,
                            action: {}
                        )
                        
                        Divider().padding(.leading, 60)
                        
                        // Language & Currency
                        SettingsRow(
                            icon: "globe",
                            title: "Language & Currency",
                            color: .blue,
                            action: {}
                        )
                        
                        Divider().padding(.leading, 60)
                        
                        // Privacy
                        SettingsRow(
                            icon: "lock.fill",
                            title: "Privacy & Security",
                            color: .green,
                            action: {}
                        )
                        
                        Divider().padding(.leading, 60)
                        
                        // Help & Support
                        SettingsRow(
                            icon: "questionmark.circle.fill",
                            title: "Help & Support",
                            color: .purple,
                            action: {}
                        )
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
                .padding(.top)
                
                // MARK: - Danger Zone
                VStack(alignment: .leading, spacing: 12) {
                    Text("Danger Zone")
                        .font(.headline)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                    
                    Button(action: {
                        showingDeleteConfirmation = true
                    }) {
                        HStack {
                            Image(systemName: "trash.fill")
                                .foregroundColor(.red)
                            Text("Delete Account")
                                .foregroundColor(.red)
                            Spacer()
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
                .padding(.top)
                
                // MARK: - Logout
                Button(action: {
                    authService.logout()
                }) {
                    HStack {
                        Image(systemName: "arrow.right.square.fill")
                        Text("Sign Out")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .padding(.top, 20)
                
                Spacer(minLength: 40)
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            Task {
                await telegramService.checkLinkStatus()
            }
        }
        .alert("Unlink Telegram?", isPresented: $showingUnlinkConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Unlink", role: .destructive) {
                Task {
                    try? await telegramService.unlinkTelegram()
                }
            }
        } message: {
            Text("You can reconnect anytime")
        }
        .alert("Delete Account?", isPresented: $showingDeleteConfirmation) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                // TODO: Implement account deletion
            }
        } message: {
            Text("This action cannot be undone. All your data will be permanently deleted.")
        }
    }
}

// MARK: - Settings Row Component
struct SettingsRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                    .frame(width: 28)
                
                Text(title)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.gray)
            }
            .padding()
        }
    }
}

#Preview {
    NavigationStack {
        ProfileView()
            .environmentObject(AuthService.shared)
    }
}

