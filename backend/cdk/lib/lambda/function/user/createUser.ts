import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

const postUser = async (userName: string) => {
  const prisma = new PrismaClient()
  console.log({ prisma })
  const registeredUser = await prisma.user.findMany({
    where: {
      userName
    }
  })
  if (registeredUser.length !== 0) {
    return {
      status: 'OK',
      message: 'user is already existed',
      userId: registeredUser[0].userId
    }
  }
  const user = await prisma.user.create({
    data: {
      userName
    }
  })

  return {
    status: 'OK',
    message: 'user is successfully registered',
    userId: user.userId
  }
}

/**
 * cognitoに登録されているIDTokenからユーザー名を取得する
 *
 * @param {APIGatewayProxyEventV2WithJWTAuthorizer} event
 * @return {*}
 */
const getuserName = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const idToken = event.headers.authorization!.split(' ')[1]
  const idTokenPayload = idToken.split('.')[1]
  const decodedIdTokenPayload = Buffer.from(idTokenPayload, 'base64').toString()
  const payloadList = decodedIdTokenPayload
    .replace('{', '')
    .replace('}', '')
    // 全ての"を置換する
    .replace(/"/g, '')
    .split(',')
    .map((keyValue) => {
      console.log(keyValue.split(':').slice(-2))
      // "key":"value"が基本だが、"cognito:username":"xxx"となっているので、どちらにも対応できるようにしている。
      const key = keyValue.split(':').slice(-2)[0]
      const value = keyValue.split(':').slice(-2)[1]
      return { key, value }
    })
  const cognitoUserName = payloadList.filter((element) => {
    return element.key === 'username'
  })[0].value

  return cognitoUserName
}

exports.handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // eventが空の場合早期return
  if (!event || !event.body) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'OK',
        message: 'event format is invalid'
      })
    }
  }
  // IDトークンからcognitoに登録されたユーザ名を取得
  const userName = getuserName(event)
  console.log({ userName })

  let status = 200
  const response = await postUser(userName).catch((error) => {
    console.log(error)
    status = 500
  })

  console.log({ response })

  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(response)
  }
}
