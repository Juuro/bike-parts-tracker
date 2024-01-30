import { React } from "react";
import * as ReactDOM from "react-dom/client";
// import { ApolloClient, ApolloProvider, createHttpLink } from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";
import App from "./App";
// import { cache } from "./cache";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";

// const httpLink = createHttpLink({
//   uri: 'https://resolved-shepherd-24.hasura.app/v1/graphql',
// });

// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   console.log('localstorage', localStorage.getItem('gotrue.user'))
//   const { token: { access_token } } = JSON.parse(localStorage.getItem('gotrue.user'));

//   console.log('access_token: ', access_token)
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: access_token ? `Bearer ${access_token}` : "",
//     }
//   }
// });

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache,
// });

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);

reportWebVitals();
