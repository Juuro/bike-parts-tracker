// note - this function MUST be named `identity-signup` to work
// we do not yet offer local emulation of this functionality in Netlify Dev
//
// more:
// https://www.netlify.com/blog/2019/02/21/the-role-of-roles-and-how-to-set-them-in-netlify-identity/
// https://www.netlify.com/docs/functions/#identity-and-functions
const fetch = require("node-fetch");

const handler = async function (event) {
  const data = JSON.parse(event.body)
  const { user } = data

  console.log('USER: ', user)

  const responseBody = {
    app_metadata: {
      roles: user.email.split('@')[1] === 'trust-this-company.com' ? ['editor'] : ['visitor'],
      my_user_info: 'this is some user info',
    },
    user_metadata: {
      // append current user metadata
      ...user.user_metadata,
      custom_data_from_function: 'hurray this is some extra metadata',
    },
  }
  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  }
}

module.exports = { handler }

// const handler = async function (event) {
//   const data = JSON.parse(event.body)
//   const { user } = data

//   console.log('USER: ', user)

//   const responseBody = {
//     query: `
//       mutation insertUser($id: String, $email:String, $name:String){
//         insert_bikepartstracker_user(objects: {id: $id, email: $email, name: $name}) {
//           affected_rows
//         }
//       }    
//     `,
//     variables: {
//       id: user.id,
//       email: user.email,
//       name: user.user_metadata.full_name
//     }
//   }

//   const result = await fetch(
//     "https://neutral-stud-43.hasura.app/v1/graphql",
//     {
//       method: "POST",
//       body: JSON.stringify(responseBody),
//       headers: {
//         "Content-Type": "application/json",
//         "x-hasura-admin-secret":
//           process.env.HASURA_SECRET
//       }
//     }
//   );

//   const { errors } = await result.json();

//   if (errors) {
//     console.log(errors);
//     return {
//       statusCode: 500,
//       body: "Something is wrong"
//     };
//   } else {
//     return {
//       statusCode: 200,
//       body: JSON.stringify(responseBody)
//     };
//   }
// }

// module.exports = { handler }
