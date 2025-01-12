
# export PROJECT_ID and REGION before calling
echo $PROJECT_ID
NAME=beam

gcloud builds submit --tag "europe-west4-docker.pkg.dev/$PROJECT_ID/docker-registry/$NAME" --project $PROJECT_ID

gcloud compute instances update-container beamvm2 --zone europe-west1-c --project $PROJECT_ID --container-env=[PRIMARY_PORT=80] --container-image=europe-west4-docker.pkg.dev/apigee-tlab1/docker-registry/beam