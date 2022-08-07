import {
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.BUCKET_NAME;

/**
 * event引数からbodyパラメータを抜き出す
 *
 * @param {APIGatewayProxyEventV2WithJWTAuthorizer} event
 * @return {*}
 */
const getBodyParameter = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  // bodyパラメータを取得し、userNameをデコードする
  const decodedEventBody = Buffer.from(event.body!, "base64").toString();
  const bodyList = decodedEventBody.split("&").map((keyValue) => {
    const key = keyValue.split("=")[0];
    const value = keyValue.split("=")[1];
    return { key, value };
  });

  return bodyList;
};

exports.handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const bodyList = getBodyParameter(event);
  const travelRecordId: string = bodyList.filter((element) => {
    return element.key === "travelRecordId";
  })[0].value;
  const fileName: string = bodyList.filter((element) => {
    return element.key === "fileName";
  })[0].value;
  const photoData: string = bodyList.filter((element) => {
    return element.key === "photoData";
  })[0].value;

  const client = new S3Client({ region: "ap-northeast-1" });
  const input: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: `${travelRecordId}/${fileName}`,
    Body: photoData,
  };
  const command = new PutObjectCommand(input);

  let status = 200;
  let response = {
    status: "OK",
    message: "Photo is successfully uploaded!",
  };
  await client.send(command).catch((error) => {
    console.log(error);
    status = 500;
    response = {
      status: "NG",
      message: "Photo uploading is failed",
    };
  });

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};
