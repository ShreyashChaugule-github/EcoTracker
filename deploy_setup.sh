#!/bin/bash
set -e

echo "1. Creating Artifact Registry Docker repo (ignoring if already exists)"
gcloud artifacts repositories create ecotracker \
  --repository-format=docker \
  --location=us-central1 \
  --project=ecotracker-499709 || true

echo "2. Storing FIREBASE_API_KEY in Secret Manager"
echo -n "AIzaSyBRF3GyYwzDm32ZXXwoizujx2cX85ARB1k" | \
  gcloud secrets create FIREBASE_API_KEY --data-file=- \
  --project=ecotracker-499709 || true

echo "3. Granting Cloud Build SA access to secrets, Cloud Run, and Vertex AI"
PROJECT_NUMBER=$(gcloud projects describe ecotracker-499709 --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding ecotracker-499709 \
  --member="serviceAccount:${CB_SA}" --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding ecotracker-499709 \
  --member="serviceAccount:${CB_SA}" --role="roles/run.admin"

gcloud projects add-iam-policy-binding ecotracker-499709 \
  --member="serviceAccount:${CB_SA}" --role="roles/iam.serviceAccountUser"

echo "4. Granting Cloud Run SA Vertex AI User role"
CR_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding ecotracker-499709 \
  --member="serviceAccount:${CR_SA}" --role="roles/aiplatform.user"

echo "5. Submitting build to Cloud Build..."
gcloud builds submit --config cloudbuild.yaml . --project=ecotracker-499709
