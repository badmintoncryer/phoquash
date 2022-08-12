import { Context, APIGatewayProxyResult, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import { PrismaClient } from '@prisma/client'

interface postPhotoProps {
  description: string
  travelRecordId: number
  fileName: string
  filePath: string
  isFavorite: boolean
}

interface postPhotoReturn {
  status: string
  message: string
  photoId: number
}

const postPhoto = async (props: postPhotoProps): Promise<postPhotoReturn> => {
  const prisma = new PrismaClient()
  const photo = await prisma.photo
    .create({
      data: {
        travelRecordId: props.travelRecordId,
        description: props.description,
        fileName: props.fileName,
        filePath: props.filePath,
        isFavorite: props.isFavorite
      }
    })
    .catch((error) => {
      throw new Error('table error: ' + error.message)
    })

  return {
    status: 'OK',
    message: 'photo is successfully registered',
    photoId: photo.photoId
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
  const description: string = bodyList.filter((element) => {
    return element.key === 'description'
  })[0].value
  const fileName: string = bodyList.filter((element) => {
    return element.key === 'fileName'
  })[0].value
  const filePath: string = bodyList.filter((element) => {
    return element.key === 'filePath'
  })[0].value
  const isFavorite: boolean = Boolean(
    bodyList.filter((element) => {
      return element.key === 'isFavorite'
    })[0].value
  )
  const travelRecordId: number = Number(
    bodyList.filter((element) => {
      return element.key === 'travelRecordId'
    })[0].value
  )

  let status = 200
  const response = await postPhoto({
    description,
    fileName,
    filePath,
    isFavorite,
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
