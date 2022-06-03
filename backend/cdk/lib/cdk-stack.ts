import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

const facebookClientId = process.env.FACEBOOK_CLIENT_ID || "";
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || "";
const applicationUrl = process.env.APPLICATION_URL || "https://localhost:3000";

if (!facebookClientId || !facebookClientSecret) {
  throw new Error("FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET must be set");
}

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ユーザープールの定義
    const userpool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "phoquash-userpool",
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email",
        emailBody:
          "phoquashへの登録ありがとうございます! Thanks for signing up to our phoquash! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });
    const domain = userpool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: "phoquash",
      },
    });

    const clientWriteAttributes =
      new cognito.ClientAttributes().withStandardAttributes({
        fullname: true,
        email: true,
      });

    const clientReadAttributes = clientWriteAttributes.withStandardAttributes({
      emailVerified: true,
    });

    const client = userpool.addClient("phoquash-app-client", {
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
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });
    const clientId = client.userPoolClientId;

    const provider = new cognito.UserPoolIdentityProviderFacebook(
      this,
      "Facebook",
      {
        clientId: facebookClientId,
        clientSecret: facebookClientSecret,
        userPool: userpool,
        apiVersion: 'v12.0',
        attributeMapping: {
          email: cognito.ProviderAttribute.FACEBOOK_EMAIL,
          givenName: cognito.ProviderAttribute.FACEBOOK_NAME,
        },
        scopes: ['public_profile', 'email']
      }
    );
    // appClientとproviderを同一stackで構築する場合、依存関係を設定する必要がある
    client.node.addDependency(provider);

    const signInUrl = domain.signInUrl(client, {
      redirectUri: applicationUrl, // must be a URL configured under 'callbackUrls' with the client
    });

    new CfnOutput(this, 'SignInUrl', { value: signInUrl })
    new CfnOutput(this, 'clientId', { value: clientId })
  }
}
