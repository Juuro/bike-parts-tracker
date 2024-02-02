// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event, context) => {
  const {
    identity,
    user
  } = context.clientContext;
  
  if (user) {
    const userId = user.sub;
    return {
      statusCode: 200,
      body: JSON.stringify({
        "x-hasura-user-id": userId,
        "x-hasura-role": "user"
      })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      "x-hasura-role": "anonymous"
    })
  };
};

module.exports = { handler };

