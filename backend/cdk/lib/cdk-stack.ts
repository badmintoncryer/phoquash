import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Cognito } from "./resource/cognito"
// import * as cognito from "aws-cdk-lib/aws-cognito";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cognito = new Cognito();
    cognito.createResources(this);
  }
}
