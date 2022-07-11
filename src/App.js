import React, { useEffect, useState, useReducer } from "react";
import { useQuery, gql, useReactiveVar, ApolloConsumer, useApolloClient} from '@apollo/client';
import { userVar } from './cache';
import GoTrue from 'gotrue-js';

const GET_BIKES = gql`
  query GetBikes {
    bikepartstracker_bike {
      id
      name
      ebike
			user {
				name
			}
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

function BikesList() {
	const { loading, error, data } = useQuery(GET_BIKES)
	const user = useReactiveVar(userVar)
	// TODO: Not very elegant -> useLazyQuery? https://www.apollographql.com/docs/react/data/queries#manual-execution-with-uselazyquery
	const [, forceUpdate] = useReducer(x => x + 1, 0)

	useEffect(() => {
		if (user) {
			forceUpdate()
		}
	}, [user])

	if (!user) return null
	if (loading) return <p>Loading...</p>;
	if (error) {
		console.log('ERROR: ', error)
		return <p>Error :(</p>
	}

	if (data) {
		console.log('DATA: ', data)
	}

	return data.bikepartstracker_bike.map(({ id, name, discipline: { name: discipline_name } }) => (
		<div key={id}>
			<h3>{name} ({discipline_name})</h3>
		</div>
	));
}

export default function App() {
	return (
		<>
			<AuthStatusView />
			<div>
				<h2>My first Apollo app 🚀</h2>
				<BikesList />
				<br />
			</div>
		</>
	);
}

function AuthStatusView() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const user = useReactiveVar(userVar)
	const client = useApolloClient()

	let name = ''

	if (user) {
		name = user.user_metadata.full_name
	}

	const login = (event) => {
		event.preventDefault()

		auth
			.login(email, password)
			.then(response => {
				localStorage.setItem('gotrue.user', JSON.stringify(response));
				userVar(response)
			})
			.catch(error => console.log('LOGIN ERROR: ', error));
	}

	const logout = () => {
		user
			.logout()
			.then(response => {
				localStorage.setItem('gotrue.user', '');
				userVar(null)
				// TODO: Clear Apollo cache after logout
				// client.clearStore()
			})
			.catch(error => {
				throw error;
			});
	}

	return (
		<div className="App">
			<header className="App-header">
				{user ? (
					<>
						<h1> hello {name}!</h1>
						<button onClick={logout}>
							LOG OUT
						</button>
					</>
				) : (
					<>
						<h1> hello! try logging in! </h1>

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
			</header>
		</div>
	)
}