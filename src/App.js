// Import everything needed to use the `useQuery` hook
import React, { useState } from "react";
import { useQuery, gql } from '@apollo/client';
import GoTrue from 'gotrue-js';
// import { useIdentityContext, IdentityContextProvider } from "react-netlify-identity-widget";
// import 'react-netlify-identity-widget/styles.css'
// import "@reach/tabs/styles.css"

// const IdentityModal = React.lazy(() => import("react-netlify-identity-widget"))

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

const auth = new GoTrue({
  APIUrl: 'https://deploy-preview-8--taupe-alpaca-7cf6ad.netlify.app/.netlify/identity',
  audience: '',
  setCookie: false,
});

function DisplayUser() {
  const { loading, error, data } = useQuery(BIKES);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log('ERROR: ', error)

    return <p>Error :(</p>
  }

  return data.bikepartstracker_bike.map(({ id, name, discipline: { name: discipline_name } }) => (
    <div key={id}>
      <h3>{name} ({discipline_name})</h3>
    </div>
  ));
}

export default function App() {
  // const url = 'https://deploy-preview-8--taupe-alpaca-7cf6ad.netlify.app/';

  return (
    // <IdentityContextProvider url={url}>
    <>
      <AuthStatusView />
      <div>
        <h2>My first Apollo app 🚀</h2>
        <DisplayUser />
        <br />
      </div>
    </>
    // </IdentityContextProvider>
  );
}

function AuthStatusView() {
  // const identity = useIdentityContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  // console.log('IDENTITY: ', identity)
  // console.log('TOKEN: ', identity?.user?.token?.access_token)
  // setUser(auth.currentUser())
  console.log('USER: ', user)
  let name = ''

  if (user) {
    name = user.user_metadata.full_name
  }

  const login = (event) => {
    event.preventDefault()
    console.log('AUTH:', auth)
    auth
      .login(email, password)
      .then(response => {
        console.log('LOGIN Response: ', response)
        localStorage.setItem('gotrue.user', JSON.stringify(response));
        setUser(response)
      })
      .catch(error => console.log('LOGIN ERROR: ', error));
  }

  const logout = () => {
    user
      .logout()
      .then(response => {
        console.log("User logged out")
        localStorage.setItem('gotrue.user', '');
        setUser(null)
      })
      .catch (error => {
        console.log("Failed to logout user: %o", error);
        throw error;
      });
}

return (
  <div className="App">
    <header className="App-header">
      {user ? (
        <>
          <h1> hello {name}!</h1>
          <button className="btn" style={{ maxWidth: 400, background: 'orangered' }} onClick={logout}>
            LOG OUT
          </button>
        </>
      ) : (
        <>
          <h1> hello! try logging in! </h1>
          {/* <button className="btn" style={{ maxWidth: 400, background: 'darkgreen' }} onClick={() => setDialog(true)}>
              LOG IN
            </button> */}

          <form name="login" onSubmit={login}>
            <p>
              <label>Email
                <input type="email" name="email" value={email} required="" onChange={(event) => setEmail(event.target.value)} />
              </label>
            </p>
            <p>
              <label>Password
                <input type="password" name="password" value={password} required="" onChange={(event) => setPassword(event.target.value)} />
              </label>
            </p>
            <p>
              <button type="submit">Log in</button>
            </p>
          </form>



        </>
      )}

      {/* <IdentityModal
          showDialog={dialog}
          onCloseDialog={() => setDialog(false)}
          onLogin={(user) => console.log('hello ', user?.user_metadata)}
          onSignup={(user) => console.log('welcome ', user?.user_metadata)}
          onLogout={() => console.log('bye ', name)}
        /> */}
    </header>
  </div>
)
}