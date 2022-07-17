import { Construct } from "constructs";
import * as efs from "aws-cdk-lib/aws-efs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class Efs {
  public fileSystem: efs.FileSystem;
  public accessPoint: efs.AccessPoint;
  private readonly vpc: ec2.Vpc;

  constructor(vpc: ec2.Vpc) {
    this.vpc = vpc;
  }

  public createResources(scope: Construct) {
    // EFSの定義
    this.fileSystem = new efs.FileSystem(scope, "phoquashFileSystem", {
      vpc: this.vpc,
      // files are not transitioned to infrequent access (IA) storage by default
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      // files are not transitioned back from (infrequent access) IA to primary storage by default
      outOfInfrequentAccessPolicy:
        efs.OutOfInfrequentAccessPolicy.AFTER_1_ACCESS,
    });

    // EFSアクセスポイントの追加
    this.accessPoint = this.fileSystem.addAccessPoint("AccesssPoint", {
      // set /export/lambda as the root of the access point
      path: "/export/lambda",
      // as /export/lambda does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
      createAcl: {
        ownerUid: "1001",
        ownerGid: "1001",
        permissions: "755",
      },
      // enforce the POSIX identity so lambda function will access with this identity
      posixUser: {
        uid: "1001",
        gid: "1001",
      },
    });
  }
}
