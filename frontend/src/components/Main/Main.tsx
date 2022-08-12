import React from 'react'
import {
  AuthEventData,
  CognitoUserAmplify
} from '@aws-amplify/ui-react/node_modules/@aws-amplify/ui'
import Home from 'components/pages/home/Home'
import Picture from 'components/pages/picture/Picture'
import TravelRecord from 'components/pages/travelRecord/TravelRecord'
import AppBar from 'components/uiParts/appBar/AppBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export type MainProps = {
  signOut?: (data?: AuthEventData | undefined) => void
  user?: CognitoUserAmplify
}

const Main: React.FC<MainProps> = (_props) => {
  return (
    <main>
      <BrowserRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/travel-record/" element={<TravelRecord />} />
          <Route
            path="/travel-record/{travelId}/{pictureId}"
            element={<Picture />}
          />
        </Routes>
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
  )
}

export default Main
