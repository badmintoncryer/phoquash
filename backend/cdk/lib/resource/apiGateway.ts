import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigatewayv2-alpha";
import * as intg from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as authz from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

export class ApiGateway {
  public httpApi: apigw.HttpApi;
  public authorizer: authz.HttpUserPoolAuthorizer;
  public stage: apigw.HttpStage;
  private readonly userPool: cognito.UserPool;
  private readonly userPoolClient: cognito.UserPoolClient;
  private readonly postUserLambdaFunc: lambda.Function;

  constructor(
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    postUser: lambda.Function
  ) {
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
    this.postUserLambdaFunc = postUser;
  }

  public createResources(scope: Construct) {
    this.httpApi = new apigw.HttpApi(scope, "phoquashApi", {
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowHeaders: ["authorization"],
      },
    });
    const httpApi = this.httpApi

    this.authorizer = new authz.HttpUserPoolAuthorizer(
      "phoquashCognitoAuthorizer",
      this.userPool,
      {
        authorizerName: "PhoquashCognitoAuthorizer",
        userPoolClients: [this.userPoolClient],
      }
    );
    const authorizer = this.authorizer

    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: '/user',
      integration: new intg.HttpLambdaIntegration(
        'phoquashScenarioIntegration',
        this.postUserLambdaFunc,
      ),
      authorizer,
    })

    this.stage = new apigw.HttpStage(scope, 'phoquashStage', {
      httpApi,
      stageName: 'api',
      autoDeploy: true,
    })
  }
}
