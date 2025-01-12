
cd ../client
./build.sh
cd ../service


# docker build -t local/$name .
# docker tag local/$name eu.gcr.io/$1/$name
# docker push eu.gcr.io/$1/$name

# update VM deployment


# Build and publish image to our cloud registry
# gcloud builds submit --tag eu.gcr.io/$1/$name

# gcloud run deploy $name --image eu.gcr.io/$1/$name --platform managed --project $1 --region europe-west3 --memory 2Gi --cpu 4 --max-instances 1 --allow-unauthenticated
