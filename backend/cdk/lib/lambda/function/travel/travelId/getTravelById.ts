import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface getTravelByIdProps {
  travelId: number
}

const getTravelById = async (props: getTravelByIdProps) => {
  if (Number.isNaN(props.travelId)) {
    throw new Error('travelId is invalid')
  }

  const prisma = new PrismaClient()
  const travel = await prisma.travel
    .findUniqueOrThrow({
      where: {
        travelId: props.travelId
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })

  return {
    status: 'OK',
    message: 'travel is successfully selected',
    travelId: props.travelId,
    userId: travel.userId,
    travelRecordId: travel.travelRecordId
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
  console.log({ event })
  // eventが空の場合早期return
  if (!event || !event.body || !event.headers || !event.headers.authorization) {
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
  const travelId = Number(apiPath.split('/').slice(-1)[0])

  let status = 200
  const response = await getTravelById({
    travelId
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
