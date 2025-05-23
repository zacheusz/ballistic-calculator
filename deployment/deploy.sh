#!/bin/bash
set -e

# Configuration
STACK_NAME="snipe-ballistics-web-ui"
STAGE=${1:-prod}
REGION=${2:-eu-central-1}
DEPLOY_CLOUDFRONT=${3:-false}
S3_BUCKET_NAME="snipe-ballistics-web-ui-${STAGE}"
BUILD_DIR="dist"

echo "Deploying Snipe Ballistics Web UI to stage: ${STAGE} in region: ${REGION} with CloudFront: ${DEPLOY_CLOUDFRONT}"

# Build the React application
echo "Building React application..."
npm run build

# Deploy with SAM
echo "Deploying with SAM..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

sam deploy \
  --template-file "${SCRIPT_DIR}/template.yaml" \
  --stack-name ${STACK_NAME} \
  --parameter-overrides StageName=${STAGE} DeployCloudFront=${DEPLOY_CLOUDFRONT} \
  --capabilities CAPABILITY_IAM \
  --region ${REGION} \
  --no-fail-on-empty-changeset

# Get the S3 bucket name from the stack outputs
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" \
  --output text \
  --region ${REGION})

CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text \
  --region ${REGION})

WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text \
  --region ${REGION})

# Upload the built files to S3
echo "Uploading files to S3 bucket: ${S3_BUCKET}..."
aws s3 sync ${BUILD_DIR} s3://${S3_BUCKET} --delete --region ${REGION}

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DIST_ID} \
  --paths "/*" \
  --region ${REGION}

echo "Deployment completed successfully!"
echo "Website URL: ${WEBSITE_URL}"
