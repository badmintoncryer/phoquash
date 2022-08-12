import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface deleteTravelProps {
  userId: number
  travelRecordId: number
}
const deleteTravel = async (props: deleteTravelProps) => {
  const prisma = new PrismaClient()
  const registeredTravel = await prisma.travel
    .findFirst({
      where: {
        userId: props.userId,
        travelRecordId: props.travelRecordId
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })
  if (registeredTravel == null) {
    return {
      status: 'OK',
      message: 'travel is already removed'
    }
  }

  await prisma.travel
    .delete({
      where: {
        travelId: registeredTravel.travelId
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })
  return {
    status: 'OK',
    message: 'travel is successfully deleted'
  }
}

/**
 * userNameからuserIdを取得する関数
 *
 * @param {string} userName
 * @return {*}  {Promise<number>}
 */
const getUserId = async (userName: string): Promise<number> => {
  const prisma = new PrismaClient()
  const users = await prisma.user
    .findMany({
      where: {
        userName
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })

  if (users.length === 0) {
    const user = await prisma.user
      .create({
        data: {
          userName
        }
      })
      .catch((error) => {
        throw new Error('table error: ' + error.message)
      })
    return user.userId
  }

  return users[0].userId
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

/**
 * event引数からbodyパラメータを抜き出す
 *
 * @param {APIGatewayProxyEventV2WithJWTAuthorizer} event
 * @return {*}
 */
const getBodyParameter = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  // bodyパラメータを取得し、userNameをデコードする
  const decodedEventBody = Buffer.from(event.body!, 'base64').toString()
  const bodyList = decodedEventBody.split('&').map((keyValue) => {
    const key = keyValue.split('=')[0]
    const value = keyValue.split('=')[1]
    return { key, value }
  })

  return bodyList
}

exports.handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  console.log({ event })
  // eventが空の場合早期return
  if (!event || !event.body || !event.headers || !event.headers.authorization) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
    }
  }

  const userName = getuserName(event)
  const userId = await getUserId(userName)
  const bodyList = getBodyParameter(event)
  const travelRecordId: number = Number(
    bodyList.filter((element) => {
      return element.key === 'travelRecordId'
    })[0].value
  )

  let status = 200
  const response = await deleteTravel({
    userId,
    travelRecordId
  }).catch((error) => {
    console.log(error)
    status = 500
  })

  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(response)
  }
}
