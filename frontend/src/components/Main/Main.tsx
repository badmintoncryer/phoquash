import {
  AuthEventData,
  CognitoUserAmplify,
} from "@aws-amplify/ui-react/node_modules/@aws-amplify/ui";

export type MainProps = {
  signOut: ((data?: AuthEventData | undefined) => void) | undefined;
  user: CognitoUserAmplify | undefined;
};

export const Main = (props: MainProps) => {
  return (
    <main>
      {props.user ? (
        <h1>Hello {props.user.username}</h1>
      ) : (
        <h1>User is not defined</h1>
      )}
      <button onClick={props.signOut}>Sign out</button>
    </main>
  );
};
