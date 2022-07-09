// Import everything needed to use the `useQuery` hook
import React from "react";
import { useQuery, gql } from '@apollo/client';
import { useIdentityContext, IdentityContextProvider } from "react-netlify-identity-widget";
import 'react-netlify-identity-widget/styles.css'
import "@reach/tabs/styles.css"

const IdentityModal = React.lazy(() => import("react-netlify-identity-widget"))

const BIKES = gql`
  query GetBikes {
    bikepartstracker_bike {
      id
      name
      ebike
      discipline {
        name
      }
      category {
        name
      }
      installations_aggregate {
        nodes {
          part {
            name
            parts_type {
              name
            }
            manufacturer {
              name
            }
            sell_status {
              name
            }
          }
        }
      }
    }
  }
`

function DisplayUser() {
  const identity = useIdentityContext()
  const { loading, error, data } = useQuery(BIKES);
  
  if (!identity?.isLoggedIn) return

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log('ERROR: ', error)

    return <p>Error :(</p>
  }

  return data.bikepartstracker_bike.map(({id, name, discipline: {name: discipline_name}}) => (
    <div key={id}>
      <h3>{name} ({discipline_name})</h3>
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
        <DisplayUser />
        <br />
      </div>
    </IdentityContextProvider>
  );
}

function AuthStatusView() {
  const identity = useIdentityContext()
  const [dialog, setDialog] = React.useState(false)
  // console.log('IDENTITY: ', identity)
  // console.log('TOKEN: ', identity?.user?.token?.access_token)
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