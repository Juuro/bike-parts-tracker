exports.handler = async (event, context) => {
  console.log('EVENT: ', event)
  console.log('CONTEXT: ', context)
  const {
    identity,
    user
  } = context.clientContext;
  if (user) {
    const userID = user.sub;
    return {
      statusCode: 200,
      body: JSON.stringify({
        "X-Hasura-User-Id": userID,
        "X-Hasura-Role": "user"
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