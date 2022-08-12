import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import sqlite3 = require('sqlite3')

interface photoIdType {
  photoId: number
}

interface postPhotoProps {
  description: string
  travelRecordId: string
  fileName: string
  filePath: string
  isFavorite: string
}

const postPhoto = async (props: postPhotoProps) => {
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

  await run(
    'INSERT INTO photo(travelRecordId,description,fileName,filePath,isFavorite) values(?,?,?,?,?)',
    props.travelRecordId,
    props.description,
    props.fileName,
    props.filePath,
    props.isFavorite
  ).catch((error) => {
    console.log(error)
    throw new Error('table error: ' + error.message)
  })

  const photoId: photoIdType = await get(
    'SELECT photoId FROM photo WHERE travelRecordId = ? AND description = ? AND fileName = ? AND filePath = ?',
    [props.travelRecordId, props.description, props.fileName, props.filePath]
  ).catch((error) => {
    throw new Error('table error: ' + error.message)
  })

  await close().catch((error) => {
    throw new Error('table error: ' + error.message)
  })

  return {
    status: 'OK',
    message: 'photo is successfully registered',
    photoId: photoId.photoId
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

  const description: string = bodyList.filter((element) => {
    return element.key === 'description'
  })[0].value
  const fileName: string = bodyList.filter((element) => {
    return element.key === 'fileName'
  })[0].value
  const filePath: string = bodyList.filter((element) => {
    return element.key === 'filePath'
  })[0].value
  const isFavorite: string = bodyList.filter((element) => {
    return element.key === 'isFavorite'
  })[0].value
  const travelRecordId: string = bodyList.filter((element) => {
    return element.key === 'travelRecordId'
  })[0].value

  let status = 200
  let response = {}
  try {
    response = await postPhoto({
      description,
      fileName,
      filePath,
      isFavorite,
      travelRecordId
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
