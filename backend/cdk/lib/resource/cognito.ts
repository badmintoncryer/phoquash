import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dotenv from "dotenv";

dotenv.config();

const facebookClientId = process.env.FACEBOOK_CLIENT_ID || "";
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || "";
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const applicationUrl = process.env.APPLICATION_URL || "https://localhost:3000";

if (
  !facebookClientId ||
  !facebookClientSecret ||
  !googleClientId ||
  !googleClientSecret
) {
  throw new Error(
    "Missing environment variables: FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
  );
}

export class Cognito {
  public userPool: cognito.UserPool;
  public domain: cognito.UserPoolDomain;
  public clientWriteAttributes: cognito.ClientAttributes;
  public clientReadAttributes: cognito.ClientAttributes;
  public userPoolClient: cognito.UserPoolClient;
  public clientId: string;
  public facebookProvider: cognito.UserPoolIdentityProviderFacebook;
  public googleProvider: cognito.UserPoolIdentityProviderGoogle;
  public signInUrl: string;

  constructor() {}

  public createResources(scope: Construct) {
    // ユーザープールの定義
    this.userPool = new cognito.UserPool(scope, "UserPool", {
      userPoolName: "phoquash-userpool",
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email",
        emailBody:
          "phoquashへの登録ありがとうございます! Thanks for signing up to our phoquash! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });
    this.domain = this.userPool.addDomain("CognitoDomain", {
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

    this.userPoolClient = this.userPool.addClient("phoquash-app-client", {
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
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      readAttributes: this.clientReadAttributes,
      writeAttributes: this.clientWriteAttributes,
    });
    this.clientId = this.userPoolClient.userPoolClientId;

    this.facebookProvider = new cognito.UserPoolIdentityProviderFacebook(
      scope,
      "Facebook",
      {
        clientId: facebookClientId,
        clientSecret: facebookClientSecret,
        userPool: this.userPool,
        apiVersion: "v12.0",
        attributeMapping: {
          email: cognito.ProviderAttribute.FACEBOOK_EMAIL,
          givenName: cognito.ProviderAttribute.FACEBOOK_NAME,
        },
        scopes: ["public_profile", "email"],
      }
    );
    // appClientとproviderを同一stackで構築する場合、依存関係を設定する必要がある
    this.userPoolClient.node.addDependency(this.facebookProvider);

    this.googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      scope,
      "Google",
      {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        userPool: this.userPool,
        scopes: ["email", "profile"],

        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_NAME,
        },
      }
    );
    this.userPoolClient.node.addDependency(this.googleProvider);

    this.signInUrl = this.domain.signInUrl(this.userPoolClient, {
      redirectUri: applicationUrl, // must be a URL configured under 'callbackUrls' with the client
    });

    new CfnOutput(scope, "SignInUrl", { value: this.signInUrl });
    new CfnOutput(scope, "clientId", { value: this.clientId });
  }
}
