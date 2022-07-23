import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Cognito } from "./resource/cognito";
import { Efs } from "./resource/efs";
import { Vpc } from "./resource/vpc";
import { Lambda } from "./resource/lambda";
import { ApiGateway } from "./resource/apiGateway";

// import * as cognito from "aws-cdk-lib/aws-cognito";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc();
    vpc.createResources(this);

    const efs = new Efs(vpc.vpc);
    efs.createResources(this);

    const lambda = new Lambda(efs.accessPoint, vpc.vpc);
    lambda.createResources(this);

    const cognito = new Cognito();
    cognito.createResources(this);

    const apigw = new ApiGateway(
      cognito.userPool,
      cognito.userPoolClient,
      lambda.postUser,
      lambda.postTravelRecordLambda
    );
    apigw.createResources(this);
  }
}
