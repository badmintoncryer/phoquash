import {
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import sqlite3 = require("sqlite3");

interface userIdType {
  userId: number;
}

const deleteUser = async (userId: string) => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database("/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3");

  const get = (sql: string, params: string[]): Promise<userIdType> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: userIdType) => {
        if (error) {
          reject(error);
        }
        resolve(row);
      });
    });
  };
  const run = (sql: string, ...params: any) => {
    return new Promise<void>((resolve, reject) => {
      db.run(sql, params, (error: any) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };
  const close = () => {
    return new Promise<void>((resolve, reject) => {
      db.close((error: any) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  await run("DELETE FROM user WHERE userId = ?", userId).catch((error) => {
    throw new Error("table error: " + error.message);
  });
  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });
  return {
    status: "OK",
    message: "user is successfully deleted",
  };
};

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
    return { key: key, value: value };
  });

  return bodyList;
};

const getApiPath = (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const rawPath = event.rawPath!;
  return rawPath;
};

exports.handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // eventが空の場合早期return
  if (!event || !event.body) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: "OK",
        message: "event format is invalid",
      }),
    };
  }

  const apiPath = getApiPath(event);
  // API Pathの最後の要素をpathParameterとして取得
  const userId = apiPath.split("/").slice(-1)[0];

  let status = 200;
  const response = await deleteUser(userId).catch((error) => {
    console.log(error);
    status = 500;
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
