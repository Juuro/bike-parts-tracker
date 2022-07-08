import { React } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.scss';

const client = new ApolloClient({
  uri: 'https://flyby-gateway.herokuapp.com/',
  // uri: 'https://neutral-stud-43.hasura.app/v1/graphql',
  cache: new InMemoryCache(),
});

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);

reportWebVitals();