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
  private readonly postUserLambda: lambda.Function;
  private readonly postTravelRecordLambda: lambda.Function;
  private readonly postTravelLambda: lambda.Function;
  private readonly deleteTravelLambda: lambda.Function;

  constructor(
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    postUserLambda: lambda.Function,
    postTravelRecordLambda: lambda.Function,
    postTravelLambda: lambda.Function,
    deleteTravelLambda: lambda.Function
  ) {
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
    this.postUserLambda = postUserLambda;
    this.postTravelRecordLambda = postTravelRecordLambda;
    this.postTravelLambda = postTravelLambda;
    this.deleteTravelLambda = deleteTravelLambda;
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
    const httpApi = this.httpApi;
    this.authorizer = new authz.HttpUserPoolAuthorizer(
      "phoquashCognitoAuthorizer",
      this.userPool,
      {
        authorizerName: "PhoquashCognitoAuthorizer",
        userPoolClients: [this.userPoolClient],
      }
    );
    const authorizer = this.authorizer;
    this.stage = new apigw.HttpStage(scope, "phoquashStage", {
      httpApi,
      stageName: "api",
      autoDeploy: true,
    });

    // ルート定義及びlambdaとの統合
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: "/user",
      integration: new intg.HttpLambdaIntegration(
        "phoquashScenarioIntegration",
        this.postUserLambda
      ),
      authorizer,
    });
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: "/travelRecord",
      integration: new intg.HttpLambdaIntegration(
        "phoquashScenarioIntegration",
        this.postTravelRecordLambda
      ),
      authorizer,
    });
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: "/travel",
      integration: new intg.HttpLambdaIntegration(
        "phoquashScenarioIntegration",
        this.postTravelLambda
      ),
      authorizer,
    });
    this.httpApi.addRoutes({
      methods: [apigw.HttpMethod.DELETE],
      path: "/travel",
      integration: new intg.HttpLambdaIntegration(
        "phoquashScenarioIntegration",
        this.deleteTravelLambda
      ),
      authorizer,
    });
  }
}
