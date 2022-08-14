import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient, User } from '@prisma/client'

interface getUsersReturn {
  status: string
  message: string
  users: User[]
}

const getUsers = async (): Promise<getUsersReturn> => {
  const prisma = new PrismaClient()
  const registeredUsers = await prisma.user.findMany({})

  return {
    status: 'OK',
    message: 'user is successfully queried',
    users: registeredUsers
  }
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

  let status = 200
  const response = await getUsers().catch((error) => {
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
