import '../styles/globals.css'
import React from 'react';
import Amplify from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);

const AuthStateApp = ({ Component, pageProps }) => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <div className="App">
      <Component {...pageProps} user={user} />
      <AmplifySignOut />
    </div>
  ) : (
    <AmplifyAuthenticator />
  );
}

export default AuthStateApp;
