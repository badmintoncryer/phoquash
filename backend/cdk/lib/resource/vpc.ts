import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class Vpc {
  public vpc: ec2.Vpc;
  constructor() {}

  public createResources(scope: Construct) {
    // VPCの定義
    this.vpc = new ec2.Vpc(scope, "Vpc", {
      cidr: "192.168.0.0/24",
      // privatesubnetのみ作成。isolatedなので、NAT Gatewayも作られない。
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: "efs",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      maxAzs: 2,
      vpcName: "phoquash-vpc",
    });
  }
}
