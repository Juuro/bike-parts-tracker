exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  console.log('CONTEXT: ', context)
  console.log('META: ', user.user_metadata)
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