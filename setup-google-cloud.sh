#!/bin/bash

# 🚀 Maya Travel Agent - Google Cloud Setup Script
# Complete setup for Google Cloud Platform deployment
# Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100

set -e  # Exit on any error

# ============================================
# 🎨 Colors for Output
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# 📋 Configuration
# ============================================
PROJECT_ID="maya-travel-agent-prod"
PROJECT_NAME="Maya Travel Agent"
REGION="me-central1"  # Middle East Central 1 (Dammam)
ZONE="me-central1-a"
SERVICE_ACCOUNT_NAME="github-actions-sa"
WORKLOAD_IDENTITY_POOL="github-pool"
WORKLOAD_IDENTITY_PROVIDER="github-provider"
REPOSITORY="maya-travel-agent"
IMAGE_NAME="maya-travel-agent"
GITHUB_REPO="your-username/maya-travel-agent"  # Replace with your actual repo

# ============================================
# 🎯 Functions
# ============================================

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# 🔧 Setup Functions
# ============================================

# Install Google Cloud CLI
install_gcloud() {
    print_header "Installing Google Cloud CLI"
    
    if command_exists gcloud; then
        print_warning "Google Cloud CLI is already installed"
        return 0
    fi
    
    print_status "Installing Google Cloud CLI..."
    
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install --cask google-cloud-sdk
        else
            print_error "Homebrew not found. Please install Google Cloud CLI manually."
            exit 1
        fi
    # For Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl https://sdk.cloud.google.com | bash
        exec -l $SHELL
        gcloud init
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Google Cloud CLI installed successfully"
}

# Authenticate with Google Cloud
authenticate_gcloud() {
    print_header "Authenticating with Google Cloud"
    
    print_status "Please authenticate with Google Cloud..."
    gcloud auth login
    
    print_status "Setting up application default credentials..."
    gcloud auth application-default login
    
    print_success "Authentication completed successfully"
}

# Create Google Cloud Project
create_project() {
    print_header "Creating Google Cloud Project"
    
    # Check if project exists
    if gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
        print_warning "Project $PROJECT_ID already exists"
    else
        print_status "Creating new project: $PROJECT_ID"
        gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME"
        print_success "Project created successfully"
    fi
    
    # Set project as default
    print_status "Setting project as default..."
    gcloud config set project "$PROJECT_ID"
    
    # Enable billing (user needs to do this manually)
    print_warning "Please enable billing for project $PROJECT_ID in the Google Cloud Console"
    print_warning "Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    read -p "Press Enter when billing is enabled..."
}

# Enable required APIs
enable_apis() {
    print_header "Enabling Required APIs"
    
    local apis=(
        "artifactregistry.googleapis.com"
        "run.googleapis.com"
        "iamcredentials.googleapis.com"
        "cloudbuild.googleapis.com"
        "containerregistry.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable "$api"
    done
    
    print_success "All APIs enabled successfully"
}

# Create Artifact Registry repository
create_artifact_registry() {
    print_header "Creating Artifact Registry Repository"
    
    print_status "Creating Docker repository in Artifact Registry..."
    gcloud artifacts repositories create "$REPOSITORY" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for Maya Travel Agent"
    
    print_success "Artifact Registry repository created successfully"
}

# Create Service Account
create_service_account() {
    print_header "Creating Service Account"
    
    print_status "Creating service account: $SERVICE_ACCOUNT_NAME"
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --display-name="GitHub Actions Service Account" \
        --description="Service account for GitHub Actions deployment"
    
    # Grant necessary roles
    local roles=(
        "roles/artifactregistry.writer"
        "roles/run.admin"
        "roles/iam.serviceAccountUser"
        "roles/storage.admin"
    )
    
    for role in "${roles[@]}"; do
        print_status "Granting role: $role"
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
            --role="$role"
    done
    
    print_success "Service account created and configured successfully"
}

# Setup Workload Identity Federation
setup_workload_identity() {
    print_header "Setting up Workload Identity Federation"
    
    # Create workload identity pool
    print_status "Creating workload identity pool..."
    gcloud iam workload-identity-pools create "$WORKLOAD_IDENTITY_POOL" \
        --location="global" \
        --description="Workload Identity Pool for GitHub Actions"
    
    # Create workload identity provider
    print_status "Creating workload identity provider..."
    gcloud iam workload-identity-pools providers create-oidc "$WORKLOAD_IDENTITY_PROVIDER" \
        --workload-identity-pool="$WORKLOAD_IDENTITY_POOL" \
        --location="global" \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --attribute-condition="assertion.repository=='$GITHUB_REPO'"
    
    # Allow GitHub Actions to impersonate service account
    print_status "Allowing GitHub Actions to impersonate service account..."
    gcloud iam service-accounts add-iam-policy-binding \
        "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/iam.workloadIdentityUser" \
        --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$WORKLOAD_IDENTITY_POOL/attribute.repository/$GITHUB_REPO"
    
    print_success "Workload Identity Federation configured successfully"
}

# Create Cloud Run service
create_cloud_run_service() {
    print_header "Creating Cloud Run Service"
    
    print_status "Creating Cloud Run service..."
    gcloud run deploy "$IMAGE_NAME" \
        --image="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest" \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --port=5000 \
        --memory=1Gi \
        --cpu=1 \
        --max-instances=10 \
        --set-env-vars="NODE_ENV=production,PORT=5000" \
        --service-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
        --no-traffic
    
    print_success "Cloud Run service created successfully"
}

# Setup monitoring and logging
setup_monitoring() {
    print_header "Setting up Monitoring and Logging"
    
    # Create log sink
    print_status "Creating log sink..."
    gcloud logging sinks create maya-travel-agent-sink \
        bigquery.googleapis.com/projects/$PROJECT_ID/datasets/maya_travel_agent_logs \
        --log-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="maya-travel-agent"'
    
    # Create BigQuery dataset for logs
    print_status "Creating BigQuery dataset for logs..."
    bq mk --dataset --location="$REGION" "$PROJECT_ID:maya_travel_agent_logs"
    
    print_success "Monitoring and logging configured successfully"
}

# Generate GitHub Secrets
generate_github_secrets() {
    print_header "Generating GitHub Secrets"
    
    print_status "Generating GitHub secrets configuration..."
    
    cat << EOF
# 🔐 GitHub Secrets Configuration
# Add these secrets to your GitHub repository:
# Settings > Secrets and variables > Actions > New repository secret

# Google Cloud Configuration
PROJECT_ID=$PROJECT_ID
GAR_LOCATION=$REGION
REPOSITORY=$REPOSITORY
IMAGE_NAME=$IMAGE_NAME

# Service Account (for Workload Identity)
SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com

# Workload Identity Provider
WORKLOAD_IDENTITY_PROVIDER=projects/$PROJECT_ID/locations/global/workloadIdentityPools/$WORKLOAD_IDENTITY_POOL/providers/$WORKLOAD_IDENTITY_PROVIDER

# Cloud Run Service
CLOUD_RUN_SERVICE=$IMAGE_NAME
CLOUD_RUN_REGION=$REGION

# Production URLs (update these after deployment)
PRODUCTION_API_URL=https://$IMAGE_NAME-$REGION-$PROJECT_ID.a.run.app
PRODUCTION_FRONTEND_URL=https://your-frontend-domain.com

# Notification Secrets (optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TO=admin@yourcompany.com
EMAIL_FROM=noreply@yourcompany.com

# Other Platform Secrets (optional)
RAILWAY_TOKEN=your_railway_token
DIGITALOCEAN_ACCESS_TOKEN=your_do_token
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
EOF

    print_success "GitHub secrets configuration generated"
    print_warning "Please add these secrets to your GitHub repository"
}

# Show setup summary
show_summary() {
    print_header "Setup Summary"
    
    echo -e "${CYAN}Project Information:${NC}"
    echo "Project ID: $PROJECT_ID"
    echo "Project Name: $PROJECT_NAME"
    echo "Region: $REGION"
    echo "Zone: $ZONE"
    
    echo -e "\n${CYAN}Service Account:${NC}"
    echo "Name: $SERVICE_ACCOUNT_NAME"
    echo "Email: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    echo -e "\n${CYAN}Artifact Registry:${NC}"
    echo "Repository: $REPOSITORY"
    echo "Location: $REGION"
    echo "Full Path: $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY"
    
    echo -e "\n${CYAN}Cloud Run Service:${NC}"
    echo "Service Name: $IMAGE_NAME"
    echo "Region: $REGION"
    echo "URL: https://$IMAGE_NAME-$REGION-$PROJECT_ID.a.run.app"
    
    echo -e "\n${CYAN}Next Steps:${NC}"
    echo "1. Add GitHub secrets to your repository"
    echo "2. Update .github/workflows/cd.yml with your repository name"
    echo "3. Push your code to trigger the deployment"
    echo "4. Monitor the deployment in GitHub Actions"
    
    print_success "🎉 Google Cloud setup completed successfully!"
}

# ============================================
# 🚀 Main Setup Process
# ============================================

main() {
    print_header "🚀 Maya Travel Agent - Google Cloud Setup"
    
    # Check if gcloud is installed
    if ! command_exists gcloud; then
        install_gcloud
    fi
    
    # Authenticate
    authenticate_gcloud
    
    # Create project
    create_project
    
    # Enable APIs
    enable_apis
    
    # Create Artifact Registry
    create_artifact_registry
    
    # Create service account
    create_service_account
    
    # Setup Workload Identity
    setup_workload_identity
    
    # Create Cloud Run service
    create_cloud_run_service
    
    # Setup monitoring
    setup_monitoring
    
    # Generate GitHub secrets
    generate_github_secrets
    
    # Show summary
    show_summary
}

# ============================================
# 🎯 Execute Main Function
# ============================================
main "$@"

