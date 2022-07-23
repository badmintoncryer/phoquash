import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import sqlite3 = require("sqlite3");

const postTravelRecord = async () => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");

  const get = (sql: string, params: string[]): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: sqlite3.Database) => {
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

  await run(
    "INSERT INTO travelRecord(title,start,end,) values(?,?)",
    "foo",
    44
  );
};

exports.handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // eventが空の場合早期return
  if (!event || !event.body || !event.headers || !event.headers.authorization) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({}),
    };
  }

  const idToken = event.headers.authorization.split(" ")[1];
  const idTokenPayload = idToken.split(".")[1];
  const decodedIdTokenPayload = Buffer.from(
    idTokenPayload,
    "base64"
  ).toString();
  const payloadList = decodedIdTokenPayload
    .replace("{", "")
    .replace("}", "")
    // 全ての"を置換する
    .replace(/"/g, "")
    .split(",")
    .map((keyValue) => {
      console.log(keyValue.split(":").slice(-2));
      // "key":"value"が基本だが、"cognito:username":"xxx"となっているので、どちらにも対応できるようにしている。
      const key = keyValue.split(":").slice(-2)[0];
      const value = keyValue.split(":").slice(-2)[1];
      return { key: key, value: value };
    });
  const cognitoUserName = payloadList.filter((element) => {
    return element["key"] === "username";
  })[0]["value"];

  // bodyパラメータを取得し、userNameをデコードする
  const decodedEventBody = Buffer.from(event.body, "base64").toString();
  const bodyList = decodedEventBody.split("&").map((keyValue) => {
    const key = keyValue.split("=")[0];
    const value = keyValue.split("=")[1];
    return { key: key, value: value };
  });

  const title: string = bodyList.filter((element) => {
    return element["key"] === "title";
  })[0]["value"];
  const startDate: string = bodyList.filter((element) => {
    return element["key"] === "start";
  })[0]["value"];
  const endDate: string = bodyList.filter((element) => {
    return element["key"] === "end";
  })[0]["value"];

  let status = 200;
  let response = {};
  try {
    response = { cur_date: new Date() };
  } catch (e) {
    console.log(e);
    status = 500;
  }
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};
