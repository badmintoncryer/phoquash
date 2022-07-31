import {
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import sqlite3 = require("sqlite3");

interface userType {
  userId: string;
  userName: string;
}

const getUserById = async (userId: string) => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database("/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3");

  const get = (sql: string, params: string[]): Promise<userType> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: userType) => {
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

  const user: userType = await get("SELECT * FROM user WHERE userId = ?", [
    userId,
  ]).catch((error) => {
    throw new Error("table error: " + error.message);
  });
  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });
  return {
    status: "OK",
    message: "user is successfully selected",
    userId: user.userId,
    userName: user.userName,
  };
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
        status: "NG",
        message: "event format is invalid",
      }),
    };
  }

  const apiPath = getApiPath(event);
  // API Pathの最後の要素をpathParameterとして取得
  const userId = apiPath.split("/").slice(-1)[0];

  let status = 200;
  const response = await getUserById(userId).catch((error) => {
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
