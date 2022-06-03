import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

const facebookClientId = process.env.FACEBOOK_CLIENT_ID || "";
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || "";
const applicationUrl = process.env.APPLICATION_URL || "https://localhost:3000";

if (!facebookClientId || !facebookClientSecret) {
  throw new Error("FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET must be set");
}

export class Cognito {
  public userpool: cognito.UserPool;
  public domain: cognito.UserPoolDomain;
  public clientWriteAttributes: cognito.ClientAttributes;
  public clientReadAttributes: cognito.ClientAttributes;
  public client: cognito.UserPoolClient;
  public clientId: string;
  public provider: cognito.UserPoolIdentityProviderFacebook;
  public signInUrl: string;

  constructor() {}

  public createResources(scope: Construct) {
    // ユーザープールの定義
    this.userpool = new cognito.UserPool(scope, "UserPool", {
      userPoolName: "phoquash-userpool",
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email",
        emailBody:
          "phoquashへの登録ありがとうございます! Thanks for signing up to our phoquash! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });
    this.domain = this.userpool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: "phoquash",
      },
    });

    this.clientWriteAttributes =
      new cognito.ClientAttributes().withStandardAttributes({
        fullname: true,
        email: true,
      });

    this.clientReadAttributes =
      this.clientWriteAttributes.withStandardAttributes({
        emailVerified: true,
      });

    this.client = this.userpool.addClient("phoquash-app-client", {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
        callbackUrls: [applicationUrl],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.FACEBOOK,
      ],
      readAttributes: this.clientReadAttributes,
      writeAttributes: this.clientWriteAttributes,
    });
    this.clientId = this.client.userPoolClientId;

    this.provider = new cognito.UserPoolIdentityProviderFacebook(
      scope,
      "Facebook",
      {
        clientId: facebookClientId,
        clientSecret: facebookClientSecret,
        userPool: this.userpool,
        apiVersion: "v12.0",
        attributeMapping: {
          email: cognito.ProviderAttribute.FACEBOOK_EMAIL,
          givenName: cognito.ProviderAttribute.FACEBOOK_NAME,
        },
        scopes: ["public_profile", "email"],
      }
    );
    // appClientとproviderを同一stackで構築する場合、依存関係を設定する必要がある
    this.client.node.addDependency(this.provider);

    this.signInUrl = this.domain.signInUrl(this.client, {
      redirectUri: applicationUrl, // must be a URL configured under 'callbackUrls' with the client
    });

    new CfnOutput(scope, 'SignInUrl', { value: this.signInUrl })
    new CfnOutput(scope, 'clientId', { value: this.clientId })
  }
}
