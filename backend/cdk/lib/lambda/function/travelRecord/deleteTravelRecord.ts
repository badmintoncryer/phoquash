import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface deleteTravelRecordProps {
  title: string
  startDate: number
  endDate: number
}
interface deleteTravelRecordReturn {
  status: string
  message: string
}
const deleteTravelRecord = async (props: deleteTravelRecordProps): Promise<deleteTravelRecordReturn> => {
  const prisma = new PrismaClient()
  const registeredTravelRecords = await prisma.travelRecord
    .findMany({
      where: {
        title: props.title,
        start: props.startDate,
        end: props.endDate
      }
    })
    .catch((error) => {
      console.log(error)
      throw new Error('query error: ' + error.message)
    })
  if (registeredTravelRecords === []) {
    return {
      status: 'OK',
      message: 'travelRecord is already removed'
    }
  }
  registeredTravelRecords.forEach(async (travelRecord) => {
    await prisma.travelRecord
      .delete({
        where: {
          travelRecordId: travelRecord.travelRecordId
        }
      })
      .catch((error) => {
        console.log(error)
        throw new Error('query error: ' + error.message)
      })
  })

  return {
    status: 'OK',
    message: 'travelRecord is successfully deleted'
  }
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

  const bodyList = getBodyParameter(event)
  const title: string = bodyList.filter((element) => {
    return element.key === 'title'
  })[0].value
  const startDate: string = bodyList.filter((element) => {
    return element.key === 'start'
  })[0].value
  const endDate: string = bodyList.filter((element) => {
    return element.key === 'end'
  })[0].value

  let status = 200
  const response = await deleteTravelRecord({
    title,
    startDate: Number(startDate),
    endDate: Number(endDate)
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
