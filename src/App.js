import React from "react";
import {
  useQuery,
  gql,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";

import "./App.scss";

const GET_BIKES = gql`
  query GetBikes {
    bike {
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
`;

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://resolved-shepherd-24.hasura.app/v1/graphql",
    headers: {
      "x-hasura-admin-secret":
        "8foLuYif5huPfEYPotZnoGSEtYAoEVrkY5GmxiW0Dww3D4S6WO4X2akuGk0QjNmL",
    },
  }),
  cache: new InMemoryCache(),
});

function BikesList() {
  console.log("process.env", process.env);
  const { loading, error, data } = useQuery(GET_BIKES);
  // const user = useReactiveVar(userVar)
  // TODO: Not very elegant -> useLazyQuery? https://www.apollographql.com/docs/react/data/queries#manual-execution-with-uselazyquery
  // const [, forceUpdate] = useReducer(x => x + 1, 0)

  // useEffect(() => {
  // 	if (user) {
  // 		forceUpdate()
  // 	}
  // }, [user])

  // if (!user) return null
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log("ERROR: ", error);
    return <p>Error 😞</p>;
  }

  if (data) {
    console.log("DATA: ", data);
  }

  return data.bike.map(
    ({
      id,
      name,
      discipline: { name: discipline_name },
      installations_aggregate: { nodes },
    }) => (
      <div key={id}>
        <h3>
          {name} ({discipline_name})
        </h3>

        <ul>{getParts(nodes)}</ul>
      </div>
    ),
  );
}

const getParts = (parts) => {
  return parts.map(
    ({
      part: {
        name: part_name,
        manufacturer: { name: manufacturer_name },
      },
    }) => (
      <li>
        {manufacturer_name} {part_name}
      </li>
    ),
  );
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Bike Parts Tracker 🚵‍♀️</h1>
        <BikesList />
        <br />
      </div>
    </ApolloProvider>
  );
}
