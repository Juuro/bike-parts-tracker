const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function (event) {
  const data = JSON.parse(event.body)
  const { user } = data

  console.log('USER: ', user)

  const responseBody = {
    query: `
      mutation insertUser($id: String, $email:String, $name:String){
        insert_bikepartstracker_user(objects: {id: $id, email: $email, name: $name}) {
          affected_rows
        }
      }    
    `,
    variables: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.full_name
    }
  }

  const result = await fetch(
    "https://neutral-stud-43.hasura.app/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify(responseBody),
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret":
          process.env.HASURA_SECRET
      }
    }
  );

  const { errors } = await result.json();

  if (errors) {
    console.log(errors);
    return {
      statusCode: 500,
      body: "Something is wrong"
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    };
  }
}