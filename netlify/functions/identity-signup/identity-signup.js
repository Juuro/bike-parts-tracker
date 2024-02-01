// note - this function MUST be named `identity-signup` to work
// we do not yet offer local emulation of this functionality in Netlify Dev
//
// more:
// https://www.netlify.com/blog/2019/02/21/the-role-of-roles-and-how-to-set-them-in-netlify-identity/
// https://docs.netlify.com/functions/functions-and-identity/

const axios = require("axios");

const handler = async function (event) {
  console.log("Sign Up");
  const data = JSON.parse(event.body);
  const { user } = data;

  const responseBodyString = JSON.stringify({
    query: `
      mutation insertUser($id: String, $email: String, $name: String) {
        insert_user(objects: {email: $email, name: $name, id: $id}) {
          affected_rows
        }
      }
    `,
    variables: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.full_name,
    },
  });

  const response = await axios.post(process.env.HASURA_URL, {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_SECRET,
    },
    body: responseBodyString,
  });

  if (response.data.errors) {
    console.log("Errors: ", response.data.errors);
    console.log("Request: ", response.request);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response.data),
  };
};

module.exports = { handler };
