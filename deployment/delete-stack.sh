#!/bin/bash
set -e

function show_usage {
  echo "Usage: $0 [STACK_NAME] [REGION] [--force|-f] [--env|-e ENV]"
  echo "  STACK_NAME: Name of the CloudFormation stack (default: snipe-ballistics-web-ui)"
  echo "  REGION: AWS region (default: eu-central-1)"
  echo "  --force|-f: Skip confirmation prompts and automatically delete resources"
  echo "  --env|-e: Environment (dev, stage, prod) - will be appended to stack name if provided"
  exit 1
}

# Parse arguments
FORCE=false
STACK_NAME="snipe-ballistics-web-ui"
REGION="eu-central-1"
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --force|-f)
      FORCE=true
      shift
      ;;
    --env|-e)
      shift
      ENVIRONMENT=$1
      shift
      ;;
    --help|-h)
      show_usage
      ;;
    *)
      if [[ -z "$STACK_NAME" || "$STACK_NAME" == "snipe-ballistics-web-ui" ]]; then
        STACK_NAME=$1
      elif [[ -z "$REGION" || "$REGION" == "eu-central-1" ]]; then
        REGION=$1
      else
        echo "Unknown argument: $1"
        show_usage
      fi
      shift
      ;;
  esac
done

# Append environment to stack name if provided
if [[ -n "$ENVIRONMENT" ]]; then
  STACK_NAME="${STACK_NAME}-${ENVIRONMENT}"
  echo "Using environment-specific stack name: ${STACK_NAME}"
fi

echo "Deleting CloudFormation stack: ${STACK_NAME} in region: ${REGION}"

# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name ${STACK_NAME} --region ${REGION}

echo "Stack deletion initiated. Waiting for deletion to complete..."

# Wait for the stack to be deleted
while true; do
  # Check if the stack still exists
  if ! aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} 2>/dev/null; then
    echo "Stack ${STACK_NAME} has been successfully deleted."
    break
  fi
  
  # Get the stack status
  STATUS=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "STACK_NOT_FOUND")
  
  if [ "$STATUS" == "STACK_NOT_FOUND" ]; then
    echo "Stack ${STACK_NAME} has been successfully deleted."
    break
  fi
  
  echo "Current stack status: ${STATUS}. Waiting..."
  sleep 10
done

# Check for any orphaned resources
echo "Checking for orphaned S3 buckets..."

# Extract the stack name without environment suffix for bucket name pattern
BASE_STACK_NAME=$(echo "$STACK_NAME" | sed -E 's/-(dev|stage|prod)$//')
BUCKET_NAME="$STACK_NAME"

echo "Looking for bucket: $BUCKET_NAME"

if aws s3 ls "s3://${BUCKET_NAME}" --region ${REGION} 2>/dev/null; then
  echo "Found orphaned S3 bucket: ${BUCKET_NAME}"
  
  # Ask for confirmation before deleting the bucket (unless force flag is set)
  if [[ "$FORCE" == true ]]; then
    REPLY="y"
    echo "Force flag set, automatically deleting bucket."
  else
    read -p "Do you want to delete the orphaned S3 bucket? (y/n): " -n 1 -r
    echo
  fi
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Emptying bucket ${BUCKET_NAME}..."
    aws s3 rm "s3://${BUCKET_NAME}" --recursive --region ${REGION}
    
    echo "Deleting bucket ${BUCKET_NAME}..."
    aws s3 rb "s3://${BUCKET_NAME}" --region ${REGION}
    
    echo "Bucket deleted successfully."
  else
    echo "Skipping bucket deletion."
  fi
else
  echo "No orphaned S3 bucket found with name: ${BUCKET_NAME}"
fi

echo "Stack cleanup completed. You can now deploy a new stack."
