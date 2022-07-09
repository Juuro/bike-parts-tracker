// Import everything needed to use the `useQuery` hook
import React from "react";
import { useQuery, gql } from '@apollo/client';
import { useIdentityContext, IdentityContextProvider } from "react-netlify-identity-widget";
import 'react-netlify-identity-widget/styles.css'
import "@reach/tabs/styles.css"

const IdentityModal = React.lazy(() => import("react-netlify-identity-widget"))

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_LOCATIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.locations.map(({ id, name, description, photo }) => (
    <div key={id}>
      <h3>{name}</h3>
      <img width="400" height="250" alt="location-reference" src={`${photo}`} />
      <br />
      <b>About this location:</b>
      <p>{description}</p>
      <br />
    </div>
  ));
}

export default function App() {
  const url = 'https://deploy-preview-8--taupe-alpaca-7cf6ad.netlify.app/';

  return (
    <IdentityContextProvider url={url}>
      <AuthStatusView />
      <div>
        <h2>My first Apollo app 🚀</h2>
        <br />
        <DisplayLocations />
      </div>
    </IdentityContextProvider>
  );
}

function AuthStatusView() {
  const identity = useIdentityContext()
  const [dialog, setDialog] = React.useState(false)
  console.log('IDENTITY: ', identity)
  console.log('TOKEN: ', identity?.user?.token?.access_token)
  const name = (identity?.user?.user_metadata && identity?.user?.user_metadata.full_name) || 'NoName'
  const avatar_url = identity?.user?.user_metadata?.avatar_url

  return (
    <div className="App">
      <header className="App-header">
        {identity?.isLoggedIn ? (
          <>
            <h1> hello {name}!</h1>
            {avatar_url && <img alt="user name" src={avatar_url} style={{ height: 100, borderRadius: '50%' }} />}
            <button className="btn" style={{ maxWidth: 400, background: 'orangered' }} onClick={() => setDialog(true)}>
              LOG OUT
            </button>
          </>
        ) : (
          <>
            <h1> hello! try logging in! </h1>
            <button className="btn" style={{ maxWidth: 400, background: 'darkgreen' }} onClick={() => setDialog(true)}>
              LOG IN
            </button>
          </>
        )}

        <IdentityModal
          showDialog={dialog}
          onCloseDialog={() => setDialog(false)}
          onLogin={(user) => console.log('hello ', user?.user_metadata)}
          onSignup={(user) => console.log('welcome ', user?.user_metadata)}
          onLogout={() => console.log('bye ', name)}
        />
      </header>
    </div>
  )
}