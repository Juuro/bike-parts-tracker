// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event, context) => {
  const {
    identity,
    user
  } = context.clientContext;
  console.log("Validate user", identity, user);
  if (user) {
    const userID = user.sub;
    return {
      statusCode: 200,
      body: JSON.stringify({
        "X-Hasura-User-Id": userID,
        "X-Hasura-Role": "user",
        "x-hasura-custom-var": "Something"
      })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      "X-Hasura-role": "anonymous"
    })
  };
};

module.exports = { handler };

