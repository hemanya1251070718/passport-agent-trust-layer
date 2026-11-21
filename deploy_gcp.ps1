# Google Cloud Run Deployment Script for Passport Trust Layer
# Enforces scale-to-zero and cost guardrails under $25 budget

$PROJECT_ID = "project-c678e6e8-2896-441b-a53"
$REGION = "asia-south1"
$SERVICE_NAME = "passport-trust-gateway"

Write-Host "Configuring active project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

Write-Host "Enabling required Google Cloud APIs..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

Write-Host "Deploying Backend Service to Cloud Run (Scale-to-Zero)..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --min-instances 0 `
  --max-instances 2 `
  --memory 512Mi `
  --cpu 1 `
  --port 8000 `
  --set-env-vars ENVIRONMENT=production,GCP_PROJECT_ID=$PROJECT_ID,GCP_REGION=$REGION

Write-Host "Deployment complete. Querying service URL..." -ForegroundColor Green
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-Host "Live Passport Gateway URL: $SERVICE_URL" -ForegroundColor Green
