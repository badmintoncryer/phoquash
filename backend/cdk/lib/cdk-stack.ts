import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Cognito } from './resource/cognito'
import { Efs } from './resource/efs'
import { Vpc } from './resource/vpc'
import { Lambda } from './resource/lambda'
import { ApiGateway } from './resource/apiGateway'
import { S3 } from './resource/s3'

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const vpc = new Vpc()
    vpc.createResources(this)

    const efs = new Efs(vpc.vpc)
    efs.createResources(this)

    const lambda = new Lambda(efs.accessPoint, vpc.vpc)
    lambda.createResources(this)

    const s3 = new S3(lambda.uploadPhotoDataLambda)
    s3.createResources(this)

    const cognito = new Cognito()
    cognito.createResources(this)

    const apigw = new ApiGateway(
      cognito.userPool,
      cognito.userPoolClient,
      lambda.postUserLambda,
      lambda.deleteUserLambda,
      lambda.getUsersLambda,
      lambda.deleteUserByIdLambda,
      lambda.getUserByIdLambda,
      lambda.postTravelRecordLambda,
      lambda.deleteTravelRecordLambda,
      lambda.getTravelRecordsLambda,
      lambda.deleteTravelRecordByIdLambda,
      lambda.postTravelLambda,
      lambda.deleteTravelLambda,
      lambda.deleteTravelByIdLambda,
      lambda.getTravelByIdLambda,
      lambda.postPhotoLambda
    )
    apigw.createResources(this)
  }
}
