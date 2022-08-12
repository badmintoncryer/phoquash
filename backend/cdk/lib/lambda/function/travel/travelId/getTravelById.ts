import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import sqlite3 = require('sqlite3')

interface getTravelProps {
  travelId: string
}
interface travelType {
  travelId: string
  userId: string
  travelRecordId: string
}

const getTravelById = async (props: getTravelProps) => {
  const db = new sqlite3.Database('/mnt/db/phoquash.sqlite3')
  // const db = new sqlite3.Database(
  //   "/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3"
  // );

  const get = (sql: string, params: string[]): Promise<travelType> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: travelType) => {
        if (error) {
          reject(error)
        }
        resolve(row)
      })
    })
  }
  const close = () => {
    return new Promise<void>((resolve, reject) => {
      db.close((error: any) => {
        if (error) {
          reject(error)
        }
        resolve()
      })
    })
  }

  const travel: travelType = await get('SELECT * FROM travel WHERE travelId = ?', [props.travelId]).catch((error) => {
    console.log(error)
    throw new Error('table error: ' + error.message)
  })

  await close().catch((error) => {
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
  const travelId = apiPath.split('/').slice(-1)[0]

  let status = 200
  let response = {}
  try {
    response = await getTravelById({
      travelId
    })
  } catch (error) {
    console.log(error)
    status = 500
  }
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(response)
  }
}
