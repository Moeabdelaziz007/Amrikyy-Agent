#!/bin/bash

# Google Cloud Infrastructure Setup for Amrikyy AI Services
# This script sets up secure Google Cloud infrastructure with proper IAM roles and service accounts

set -e

# Configuration
PROJECT_ID="amrikyy-production"
STAGING_PROJECT_ID="amrikyy-staging"
REGION="us-central1"
CLUSTER_NAME="amrikyy-ai-cluster"

echo "🚀 Setting up Google Cloud infrastructure for Amrikyy AI Services..."

# Function to create service account with minimal privileges
create_service_account() {
    local account_name=$1
    local display_name=$2
    local description=$3
    local project_id=$4
    
    echo "🔐 Creating service account: $account_name"
    
    gcloud iam service-accounts create $account_name \
        --project=$project_id \
        --display-name="$display_name" \
        --description="$description" \
        --no-user-output-enabled
    
    # Generate and download key
    gcloud iam service-accounts keys create ./secrets/${account_name}-key.json \
        --project=$project_id \
        --iam-account=${account_name}@${project_id}.iam.gserviceaccount.com
    
    echo "✅ Service account $account_name created successfully"
}

# Function to assign minimal IAM roles
assign_iam_role() {
    local service_account=$1
    local role=$2
    local project_id=$3
    
    echo "🔑 Assigning role $role to $service_account"
    
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account}@${project_id}.iam.gserviceaccount.com" \
        --role="$role" \
        --condition=None
}

# Create secrets directory
mkdir -p ./secrets

# Production Setup
echo "🏭 Setting up Production Environment..."

# Create service accounts for different AI services
create_service_account "amrikyy-nlp-sa" "NLP Service Account" "Natural Language API service for Amrikyy" $PROJECT_ID
create_service_account "amrikyy-translation-sa" "Translation Service Account" "Cloud Translation API service for Amrikyy" $PROJECT_ID
create_service_account "amrikyy-vision-sa" "Vision Service Account" "Cloud Vision API service for Amrikyy" $PROJECT_ID
create_service_account "amrikyy-vertexai-sa" "Vertex AI Service Account" "Vertex AI and ML services for Amrikyy" $PROJECT_ID
create_service_account "amrikyy-bigquery-sa" "BigQuery Service Account" "BigQuery analytics service for Amrikyy" $PROJECT_ID

# Assign minimal privileges for production
assign_iam_role "amrikyy-nlp-sa" "roles/language.serviceUser" $PROJECT_ID
assign_iam_role "amrikyy-translation-sa" "roles/cloudtranslate.user" $PROJECT_ID
assign_iam_role "amrikyy-vision-sa" "roles/vision.imageAnnotator" $PROJECT_ID
assign_iam_role "amrikyy-vertexai-sa" "roles/aiplatform.user" $PROJECT_ID
assign_iam_role "amrikyy-bigquery-sa" "roles/bigquery.dataEditor" $PROJECT_ID
assign_iam_role "amrikyy-bigquery-sa" "roles/bigquery.jobUser" $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling Google Cloud APIs..."
gcloud services enable language.googleapis.com --project=$PROJECT_ID
gcloud services enable translate.googleapis.com --project=$PROJECT_ID
gcloud services enable vision.googleapis.com --project=$PROJECT_ID
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID
gcloud services enable bigquery.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable container.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Create BigQuery datasets
echo "📊 Setting up BigQuery datasets..."
bq --project_id=$PROJECT_ID mk --dataset amrikyy_analytics
bq --project_id=$PROJECT_ID mk --dataset amrikyy_ml

# Create tables for analytics
bq query --project_id=$PROJECT_ID --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS amrikyy_analytics.user_interactions (
    user_id STRING,
    agent_id STRING,
    interaction_type STRING,
    timestamp TIMESTAMP,
    session_id STRING,
    sentiment_score FLOAT64,
    language STRING,
    request_text STRING,
    response_text STRING
) PARTITION BY TIMESTAMP(timestamp);

CREATE TABLE IF NOT EXISTS amrikyy_analytics.travel_patterns (
    user_id STRING,
    destination STRING,
    budget_range STRING,
    travel_dates ARRAY<DATE>,
    booking_status STRING,
    created_at TIMESTAMP
) PARTITION BY TIMESTAMP(created_at);
"

# Staging Setup
echo "🧪 Setting up Staging Environment..."

create_service_account "amrikyy-nlp-sa" "NLP Service Account" "Natural Language API service for Amrikyy Staging" $STAGING_PROJECT_ID
create_service_account "amrikyy-translation-sa" "Translation Service Account" "Cloud Translation API service for Amrikyy Staging" $STAGING_PROJECT_ID
create_service_account "amrikyy-vision-sa" "Vision Service Account" "Cloud Vision API service for Amrikyy Staging" $STAGING_PROJECT_ID

# Assign minimal privileges for staging
assign_iam_role "amrikyy-nlp-sa" "roles/language.serviceUser" $STAGING_PROJECT_ID
assign_iam_role "amrikyy-translation-sa" "roles/cloudtranslate.user" $STAGING_PROJECT_ID
assign_iam_role "amrikyy-vision-sa" "roles/vision.imageAnnotator" $STAGING_PROJECT_ID

# Enable APIs for staging
gcloud services enable language.googleapis.com --project=$STAGING_PROJECT_ID
gcloud services enable translate.googleapis.com --project=$STAGING_PROJECT_ID
gcloud services enable vision.googleapis.com --project=$STAGING_PROJECT_ID
gcloud services enable run.googleapis.com --project=$STAGING_PROJECT_ID

# Create GKE cluster for production
echo "🎯 Creating GKE cluster..."
gcloud container clusters create $CLUSTER_NAME \
    --project=$PROJECT_ID \
    --region=$REGION \
    --num-nodes=3 \
    --machine-type=e2-standard-2 \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=10 \
    --enable-autorepair \
    --enable-autoupgrade \
    --workload-pool=${PROJECT_ID}.svc.id.goog

# Configure kubectl
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION --project=$PROJECT_ID

# Create namespaces
echo "🏷️ Creating Kubernetes namespaces..."
kubectl create namespace amrikyy-production
kubectl create namespace amrikyy-staging
kubectl create namespace amrikyy-monitoring

# Store secrets in Kubernetes
echo "🔒 Storing secrets in Kubernetes..."
kubectl create secret generic google-nlp-credentials \
    --from-file=credentials.json=./secrets/amrikyy-nlp-sa-key.json \
    --namespace=amrikyy-production

kubectl create secret generic google-translation-credentials \
    --from-file=credentials.json=./secrets/amrikyy-translation-sa-key.json \
    --namespace=amrikyy-production

kubectl create secret generic google-vision-credentials \
    --from-file=credentials.json=./secrets/amrikyy-vision-sa-key.json \
    --namespace=amrikyy-production

kubectl create secret generic google-vertexai-credentials \
    --from-file=credentials.json=./secrets/amrikyy-vertexai-sa-key.json \
    --namespace=amrikyy-production

kubectl create secret generic google-bigquery-credentials \
    --from-file=credentials.json=./secrets/amrikyy-bigquery-sa-key.json \
    --namespace=amrikyy-production

# Set up monitoring
echo "📈 Setting up monitoring..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace amrikyy-monitoring \
    --create-namespace \
    --set grafana.adminPassword=admin123 \
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Set up Cloud Build triggers
echo "🔧 Setting up Cloud Build triggers..."
gcloud builds triggers create github \
    --repo-name="maya-travel-agent" \
    --repo-owner="your-github-username" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --project=$PROJECT_ID

echo "✅ Google Cloud infrastructure setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Review and test the service accounts"
echo "2. Configure CI/CD pipelines"
echo "3. Set up monitoring dashboards"
echo "4. Deploy AI services using the provided manifests"
echo ""
echo "🔐 Security Notes:"
echo "- Service account keys are stored in ./secrets/ directory"
echo "- Keys have been uploaded to Kubernetes secrets"
echo "- IAM roles follow principle of least privilege"
echo "- Monitoring and logging are enabled"