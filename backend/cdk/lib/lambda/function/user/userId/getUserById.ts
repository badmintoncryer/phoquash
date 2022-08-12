import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface getUserByIdReturn {
  status: string
  message: string
  userId?: number
  userName?: string
}

const getUserById = async (userId: number): Promise<getUserByIdReturn> => {
  if (Number.isNaN(userId)) {
    throw new Error('userId is invalid')
  }

  const prisma = new PrismaClient()
  const user = await prisma.user
    .findUnique({
      where: {
        userId
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })
  if (user == null) {
    return {
      status: 'NG',
      message: 'user does not exist'
    }
  } else {
    return {
      status: 'OK',
      message: 'user is successfully selected',
      userId: user.userId,
      userName: user.userName
    }
  }
}

const getApiPath = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const rawPath = event.rawPath!
  return rawPath
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
        status: 'NG',
        message: 'event format is invalid'
      })
    }
  }

  const apiPath = getApiPath(event)
  // API Pathの最後の要素をpathParameterとして取得
  const userId = Number(apiPath.split('/').slice(-1)[0])

  let status = 200
  const response = await getUserById(userId).catch((error) => {
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
