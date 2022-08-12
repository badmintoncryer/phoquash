import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import sqlite3 = require('sqlite3')

interface userIdType {
  userId: number
}

interface travelRecordIdType {
  travelRecordId: number
}

interface deleteTravelProps {
  userName: string
  title: string
  startDate: number
  endDate: number
}
const deleteTravel = async (props: deleteTravelProps) => {
  const db = new sqlite3.Database('/mnt/db/phoquash.sqlite3')
  // const db = new sqlite3.Database(
  //   "/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3"
  // );

  const get = (sql: string, params: (string | number)[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: any) => {
        if (error) {
          reject(error)
        }
        resolve(row)
      })
    })
  }
  const run = (sql: string, ...params: any) => {
    return new Promise<void>((resolve, reject) => {
      db.run(sql, params, (error: any) => {
        if (error) {
          reject(error)
        }
        resolve()
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

  // userName元にuserIdを取得
  const userId: userIdType = await get('SELECT userId FROM user WHERE userName = ?', [props.userName]).catch(
    (error) => {
      console.log(error)
      throw new Error('table error: ' + error.message)
    }
  )
  if (!userId || !userId.userId) {
    throw new Error('userName is not registered in user table')
  }

  // title, start, endからtravelRecordIdを取得
  // travelの登録前にtravelRecordが登録されている必要がある。
  const travelRecordId: travelRecordIdType = await get(
    'SELECT travelRecordId FROM travelRecord WHERE title = ? and start = ? and end = ? and userId = ?',
    [props.title, props.startDate, props.endDate, userId.userId]
  ).catch((error) => {
    console.log(error)
    throw new Error('table error: ' + error.message)
  })
  if (!travelRecordId || !travelRecordId.travelRecordId) {
    throw new Error('travelRecord is not registered in travelRecord table')
  }

  const registeredTravelId = await get('SELECT travelId FROM travel WHERE userId = ? and travelRecordId = ?', [
    userId.userId,
    travelRecordId.travelRecordId
  ]).catch((error) => {
    console.log(error)
    throw new Error('table error: ' + error.message)
  })

  // 既に同一のtravelが登録されていない場合、何も行わない
  if (!registeredTravelId || !registeredTravelId.travelId) {
    return {
      status: 'OK',
      message: 'travel is already removed'
    }
  }

  await run('DELETE FROM travel WHERE travelId = ?', [registeredTravelId.travelId]).catch((error) => {
    console.log(error)
    throw new Error('table error: ' + error.message)
  })

  await close().catch((error) => {
    throw new Error('table error: ' + error.message)
  })

  return {
    status: 'OK',
    message: 'travel is successfully deleted'
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
  let response = {}
  try {
    response = await deleteTravel({
      userName,
      title,
      startDate: Number(startDate),
      endDate: Number(endDate)
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
