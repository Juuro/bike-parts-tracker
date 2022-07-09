exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  console.log('EVENT: ', event)
  console.log('CONTEXT: ', context)
  console.log('USER_META: ', user.user_metadata)
  console.log('APP_META: ', user.app_metadata)
  if (user) {
    const userID = user.sub;
    const { roles } = user.app_metadata
    let userRole = "user"

    if (roles.includes('admin')) {
      userRole = 'admin'
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        "X-Hasura-User-Id": userID,
        "X-Hasura-Role": userRole
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