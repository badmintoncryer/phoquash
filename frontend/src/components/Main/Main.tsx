import {
  AuthEventData,
  CognitoUserAmplify,
} from "@aws-amplify/ui-react/node_modules/@aws-amplify/ui";
import AppBar from "components/uiParts/appBar/AppBar";
import { BrowserRouter } from "react-router-dom";

export type MainProps = {
  signOut: ((data?: AuthEventData | undefined) => void) | undefined;
  user: CognitoUserAmplify | undefined;
};

export const Main = (props: MainProps) => {
  return (
    <main>
      <BrowserRouter>
        <AppBar />
      </BrowserRouter>
    </main>
    // <main>
    //   {props.user ? (
    //     <h1>Hello {props.user.username}</h1>
    //   ) : (
    //     <h1>User is not defined</h1>
    //   )}
    //   <button onClick={props.signOut}>Sign out</button>
    // </main>
  );
};
