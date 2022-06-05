import { Amplify } from "aws-amplify";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Main } from "components/Main/Main";

Amplify.configure({
  aws_project_region: process.env.REACT_APP_AWS_PROJECT_REGION,
  aws_cognito_region: process.env.REACT_APP_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.REACT_APP_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.REACT_APP_AWS_USER_POOLS_CLIENT_ID,
  oauth: {
    domain: "phoquash.auth.ap-northeast-1.amazoncognito.com",
    // scope: ["openid", "aws.cognito.signin.user.admin", "profile"],
    redirectSignIn: "https://localhost:3000",
    redirectSignOut: "https://localhost:3000",
    responseType: "code",
  },
});

export default function App() {
  return (
    <Authenticator
      socialProviders={["facebook", "google"]}
      loginMechanisms={["username"]}
    >
      {({ signOut, user }) => <Main signOut={signOut} user={user} />}
    </Authenticator>
  );
}
