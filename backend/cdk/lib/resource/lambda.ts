import { Construct } from "constructs";
import * as efs from "aws-cdk-lib/aws-efs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";

const MOUNT_PATH = "/mnt/db";

export class Lambda {
  public createDb: lambda.Function;
  public postUser: lambda.Function;
  public postTravelRecordLambda: lambda.Function;
  public nodeLayer: lambda.LayerVersion;
  private readonly accessPoint: efs.AccessPoint;
  private readonly vpc: ec2.Vpc;

  constructor(accessPoint: efs.AccessPoint, vpc: ec2.Vpc) {
    this.accessPoint = accessPoint;
    this.vpc = vpc;
  }

  public createResources(scope: Construct) {
    this.nodeLayer = new lambda.LayerVersion(scope, "nodeLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/layer")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
      description: "node layer",
      layerVersionName: "node-layer",
    });

    this.createDb = new nodeLambda.NodejsFunction(scope, "createDb", {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        this.accessPoint,
        MOUNT_PATH
      ),
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.handler",
      entry: path.join(__dirname, "../lambda/function/createDb"),
      vpc: this.vpc,
    });

    this.postUser = new nodeLambda.NodejsFunction(scope, "postUser", {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        this.accessPoint,
        MOUNT_PATH
      ),
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.handler",
      entry: path.join(__dirname, "../lambda/function/postUser"),
      vpc: this.vpc,
    });

    this.postTravelRecordLambda = new nodeLambda.NodejsFunction(
      scope,
      "postTravelRecordLambda",
      {
        filesystem: lambda.FileSystem.fromEfsAccessPoint(
          this.accessPoint,
          MOUNT_PATH
        ),
        layers: [this.nodeLayer],
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        entry: path.join(__dirname, "../lambda/function/postTravelRecord"),
        vpc: this.vpc,
      }
    );
  }
}
