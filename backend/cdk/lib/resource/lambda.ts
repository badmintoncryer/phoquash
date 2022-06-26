import { Construct } from "constructs";
import * as efs from "aws-cdk-lib/aws-efs";
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";

export class Lambda {
  public postTravelRecordLambda: lambda.Function;
  private readonly accessPoint: efs.AccessPoint
  private readonly vpc: ec2.Vpc;

  constructor(accessPoint: efs.AccessPoint, vpc: ec2.Vpc) {
    this.accessPoint = accessPoint
    this.vpc = vpc
  }

  public createResources(scope: Construct) {
    this.postTravelRecordLambda = new lambda.Function(scope, 'postTravelRecordLambda', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, "/mnt/db"),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/postTravelRecord')),
      vpc: this.vpc
    })
  }
}
