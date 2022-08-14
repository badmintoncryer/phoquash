import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient, Travel } from '@prisma/client'

interface getTravelsProps {
  userId: number
}

interface getTravelsReturn {
  status: string
  message: string
  userId: number
  travels: Travel[]
}

const getTravels = async (props: getTravelsProps): Promise<getTravelsReturn> => {
  if (Number.isNaN(props.userId)) {
    throw new Error('userId is invalid')
  }

  const prisma = new PrismaClient()
  const userTravels = await prisma.user
    .findUniqueOrThrow({
      where: {
        userId: props.userId
      },
      include: { Travels: true }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })

  return {
    status: 'OK',
    message: 'travels are successfully selected',
    userId: userTravels.userId,
    travels: userTravels.Travels
  }
}

exports.handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  if (event?.body == null || event.headers?.authorization == null || event.queryStringParameters?.userId == null) {
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

  const userId = Number(event.queryStringParameters?.userId)

  let status = 200
  const response = await getTravels({
    userId
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
