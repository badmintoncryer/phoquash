import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient, TravelRecord } from '@prisma/client'

interface getTravelRecordsProps {
  userId: number
}

interface getTravelRecordsReturn {
  status: string
  message: string
  travelRecords: TravelRecord[]
}

const getTravelRecords = async (props: getTravelRecordsProps): Promise<getTravelRecordsReturn> => {
  if (Number.isNaN(props.userId)) {
    throw new Error('userId is invalid')
  }

  const prisma = new PrismaClient()
  const userTravelRecords = await prisma.travelRecord
    .findMany({
      where: {
        Travels: {
          some: {
            user: {
              userId: props.userId
            }
          }
        }
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })

  return {
    status: 'OK',
    message: 'travelRecords are successfully selected',
    travelRecords: userTravelRecords
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
  const response = await getTravelRecords({
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
