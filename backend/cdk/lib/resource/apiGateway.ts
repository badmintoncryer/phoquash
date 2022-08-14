import { Construct } from 'constructs'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha'
import * as intg from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as authz from '@aws-cdk/aws-apigatewayv2-authorizers-alpha'

export class ApiGateway {
  public httpApi: apigw.HttpApi
  public authorizer: authz.HttpUserPoolAuthorizer
  public stage: apigw.HttpStage
  private readonly userPool: cognito.UserPool
  private readonly userPoolClient: cognito.UserPoolClient
  private readonly postUserLambda: lambda.Function
  private readonly deleteUserLambda: lambda.Function
  private readonly getUsersLambda: lambda.Function
  private readonly deleteUserByIdLambda: lambda.Function
  private readonly getUserByIdLambda: lambda.Function
  private readonly postTravelRecordLambda: lambda.Function
  private readonly deleteTravelRecordLambda: lambda.Function
  private readonly getTravelRecordsLambda: lambda.Function
  private readonly deleteTravelRecordByIdLambda: lambda.Function
  private readonly postTravelLambda: lambda.Function
  private readonly deleteTravelLambda: lambda.Function
  private readonly deleteTravelByIdLambda: lambda.Function
  private readonly getTravelByIdLambda: lambda.Function
  private readonly postPhotoLambda: lambda.Function

  constructor(
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    postUserLambda: lambda.Function,
    deleteUserLambda: lambda.Function,
    getUsersLambda: lambda.Function,
    deleteUserByIdLambda: lambda.Function,
    getUserByIdLambda: lambda.Function,
    postTravelRecordLambda: lambda.Function,
    deleteTravelRecordLambda: lambda.Function,
    getTravelRecordsLambda: lambda.Function,
    deleteTravelRecordByIdLambda: lambda.Function,
    postTravelLambda: lambda.Function,
    deleteTravelLambda: lambda.Function,
    deleteTravelByIdLambda: lambda.Function,
    getTravelByIdLambda: lambda.Function,
    postPhotoLambda: lambda.Function
  ) {
    this.userPool = userPool
    this.userPoolClient = userPoolClient
    this.postUserLambda = postUserLambda
    this.deleteUserLambda = deleteUserLambda
    this.getUsersLambda = getUsersLambda
    this.deleteUserByIdLambda = deleteUserByIdLambda
    this.getUserByIdLambda = getUserByIdLambda
    this.postTravelRecordLambda = postTravelRecordLambda
    this.deleteTravelRecordLambda = deleteTravelRecordLambda
    this.getTravelRecordsLambda = getTravelRecordsLambda
    this.deleteTravelRecordByIdLambda = deleteTravelRecordByIdLambda
    this.postTravelLambda = postTravelLambda
    this.deleteTravelLambda = deleteTravelLambda
    this.deleteTravelByIdLambda = deleteTravelByIdLambda
    this.getTravelByIdLambda = getTravelByIdLambda
    this.postPhotoLambda = postPhotoLambda
  }

  public createResources(scope: Construct) {
    this.httpApi = new apigw.HttpApi(scope, 'phoquashApi', {
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowHeaders: ['authorization']
      }
    })
    const httpApi = this.httpApi
    this.authorizer = new authz.HttpUserPoolAuthorizer('phoquashCognitoAuthorizer', this.userPool, {
      authorizerName: 'PhoquashCognitoAuthorizer',
      userPoolClients: [this.userPoolClient]
    })
    const authorizer = this.authorizer
    this.stage = new apigw.HttpStage(scope, 'phoquashStage', {
      httpApi,
      stageName: 'api',
      autoDeploy: true
    })

    // ルート定義及びlambdaとの統合
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: '/user',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.postUserLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/user',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteUserLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.GET],
      path: '/user',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.getUsersLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/user/{userId}',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteUserByIdLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.GET],
      path: '/user/{userId}',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.getUserByIdLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: '/travelRecord',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.postTravelRecordLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/travelRecord',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteTravelRecordLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.GET],
      path: '/travelRecord',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.getTravelRecordsLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/travelRecord/{travelRecordId}',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteTravelRecordByIdLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: '/travel',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.postTravelLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/travel',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteTravelLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: '/travel/{travelId}',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.deleteTravelByIdLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.GET],
      path: '/travel/{travelId}',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.getTravelByIdLambda),
      authorizer
    })
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: '/photo',
      integration: new intg.HttpLambdaIntegration('phoquashScenarioIntegration', this.postPhotoLambda),
      authorizer
    })
  }
}
