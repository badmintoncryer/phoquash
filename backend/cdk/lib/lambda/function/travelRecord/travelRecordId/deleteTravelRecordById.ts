import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface deleteTravelRecordIdProps {
  travelRecordId: number
}
interface deleteTravelRecordByIdReturn {
  status: string
  message: string
}
const deleteTravelRecordById = async (props: deleteTravelRecordIdProps): Promise<deleteTravelRecordByIdReturn> => {
  const prisma = new PrismaClient()
  await prisma.travelRecord
    .delete({
      where: {
        travelRecordId: props.travelRecordId
      }
    })
    .catch((error) => {
      console.log(error)
      throw new Error('query error: ' + error.message)
    })

  return {
    status: 'OK',
    message: 'travelRecord is successfully deleted'
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

  const apiPath = getApiPath(event)
  // API Pathの最後の要素をpathParameterとして取得
  const travelRecordId = Number(apiPath.split('/').slice(-1)[0])

  let status = 200
  const response = await deleteTravelRecordById({
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
