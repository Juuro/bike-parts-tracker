import { React } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.scss';

const httpLink = createHttpLink({
  uri: 'https://neutral-stud-43.hasura.app/v1/graphql',
});

console.log('httplink', httpLink)

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  console.log('localstorage', localStorage.getItem('gotrue.user'))
  const { user: { token: { access_token } } } = JSON.parse(localStorage.getItem('gotrue.user'));

  console.log('access_token: ', access_token)
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: access_token ? `Bearer ${access_token}` : "",
    }
  }
});

console.log('authLink', authLink)

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// const client = new ApolloClient({
//   // uri: 'https://flyby-gateway.herokuapp.com/',
//   uri: 'https://neutral-stud-43.hasura.app/v1/graphql',
//   cache: new InMemoryCache(),
// });

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);

reportWebVitals();