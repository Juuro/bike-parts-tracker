// Import everything needed to use the `useQuery` hook
import { useQuery, gql } from '@apollo/client';
import { IdentityContextProvider } from 'react-netlify-identity';

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
      <div>
        <h2>My first Apollo app 🚀</h2>
        <br/>
        <DisplayLocations />
      </div>
    </IdentityContextProvider>
  );
}