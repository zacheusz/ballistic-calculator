# AWS Deployment Guide for Snipe Ballistics Web UI

This guide explains how to deploy the Snipe Ballistics Web UI to AWS using the Serverless Application Model (SAM) with S3 and CloudFront.

## Files in this Directory

- **template.yaml**: CloudFormation template that defines the infrastructure (S3 bucket, CloudFront distribution, etc.)
- **deploy.sh**: Deployment script that builds the application and deploys it to AWS
- **delete-stack.sh**: Script to safely delete the CloudFormation stack and clean up resources
- **cloudfront-policy.json**: IAM policy document with the required permissions for deployment

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- AWS SAM CLI installed
- Node.js and npm installed

## Deployment Options

### Option 1: Manual Deployment using deploy.sh

1. Make the deployment script executable:
   ```bash
   chmod +x deployment/deploy.sh
   ```

2. Deploy to the default production environment with S3 only (no CloudFront):
   ```bash
   ./deployment/deploy.sh prod eu-central-1 false
   ```

3. Deploy with CloudFront (requires AWS account verification):
   ```bash
   ./deployment/deploy.sh prod eu-central-1 true
   ```

4. Deploy to a specific stage and region:
   ```bash
   ./deployment/deploy.sh staging us-west-2 false
   ```

### Option 2: GitHub Actions Deployment

1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

2. Optionally, add the following variables to your GitHub repository:
   - `AWS_REGION`: The AWS region to deploy to (defaults to eu-central-1)
   - `STAGE_NAME`: The stage name for the deployment (defaults to prod)
   - `DEPLOY_CLOUDFRONT`: Whether to deploy with CloudFront (defaults to false)

3. Push to the main branch or manually trigger the workflow from the GitHub Actions tab.

## Stack Cleanup

To delete the CloudFormation stack and all associated resources:

1. Make the delete script executable:
   ```bash
   chmod +x deployment/delete-stack.sh
   ```

2. Run the script with interactive prompts:
   ```bash
   ./deployment/delete-stack.sh
   ```

3. Or use the force flag to skip all prompts:
   ```bash
   ./deployment/delete-stack.sh --force
   ```

4. Delete a specific stack in a specific region:
   ```bash
   ./deployment/delete-stack.sh my-stack-name us-east-1 --force
   ```

Note: The S3 bucket will not be automatically deleted due to the `DeletionPolicy: Retain` setting, but the delete script will offer to clean it up for you.

## Custom Domain Setup

To set up a custom domain (requires CloudFront deployment):

1. Register your domain with your preferred DNS provider
2. Create an SSL certificate in AWS Certificate Manager (ACM) for your domain
3. Add the following resources to the `template.yaml` file:

```yaml
CloudFrontDistribution:
  Properties:
    DistributionConfig:
      # Add these properties to the existing configuration
      Aliases:
        - your-domain.com
      ViewerCertificate:
        AcmCertificateArn: !Ref YourCertificate
        SslSupportMethod: sni-only
        MinimumProtocolVersion: TLSv1.2_2021

YourCertificate:
  Type: AWS::CertificateManager::Certificate
  Properties:
    DomainName: your-domain.com
    ValidationMethod: DNS
```

4. Create the appropriate DNS records with your DNS provider to point to the CloudFront distribution

## Stack Resources

The AWS SAM template creates the following resources:

- **S3 Bucket**: Stores the static web files with website hosting enabled
- **Bucket Policy**: Controls access to the S3 bucket
- **CloudFront Distribution** (optional): Serves the website with low latency and HTTPS
- **CloudFront Origin Access Identity** (optional): Secures the S3 bucket when using CloudFront

## Troubleshooting

- **Deployment Fails**: Ensure your AWS credentials have the necessary permissions defined in `cloudfront-policy.json`
- **CloudFront Deployment Fails**: Your AWS account may need verification for CloudFront. Deploy with S3 only (`false` parameter) until verification is complete
- **Website Not Updating**: Try invalidating the CloudFront cache manually or redeploy
- **Custom Domain Not Working**: Verify DNS records and certificate validation
- **Stack Deletion Issues**: Use the `delete-stack.sh` script with the `--force` flag to clean up resources
