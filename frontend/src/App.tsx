import { Amplify } from "aws-amplify";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  aws_project_region: process.env.REACT_APP_AWS_PROJECT_REGION,
  aws_cognito_region: process.env.REACT_APP_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.REACT_APP_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.REACT_APP_AWS_USER_POOLS_CLIENT_ID,
});

export default function App() {
  return (
    <Authenticator socialProviders={["facebook"]}>
      {({ signOut, user }) => (
        <main>
          {user ? <h1>Hello {user.username}</h1> : <h1>User is not defined</h1>}
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
