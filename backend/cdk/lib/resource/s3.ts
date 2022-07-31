import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class S3 {
  public photoDataBucket: s3.Bucket;
  private readonly uploadPhotoLambda: lambda.Function;

  constructor(uploadPhotoLambda: lambda.Function) {
    this.uploadPhotoLambda = uploadPhotoLambda;
  }

  public createResources(scope: Construct) {
    this.photoDataBucket = new s3.Bucket(scope, "PhoquashPhotoDataS3Bucket", {
      encryption: s3.BucketEncryption.KMS,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: "phoquash-photo-data-bucket"
    });
    this.photoDataBucket.grantReadWrite(this.uploadPhotoLambda);
  }
}
