import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import sqlite3 = require("sqlite3");

interface userIdType {
  userId: number;
}

interface postTravelRecordProps {
  userName: string;
  title: string;
  startDate: number;
  endDate: number;
}
const postTravelRecord = async (props: postTravelRecordProps) => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database(
  //   "/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3"
  // );

  const get = (sql: string, params: (string | number)[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: any, row: any) => {
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

  const userId: userIdType = await get(
    "SELECT userId FROM user WHERE userName = ?",
    [props.userName]
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  if (!userId || !userId.userId) {
    throw new Error("userName is not registered in user table");
  }

  const registeredTravelRecord = await get(
    "SELECT travelRecordId FROM travelRecord WHERE title = ? and start = ? and end = ?",
    [props.title, props.startDate, props.endDate]
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });

  if (!registeredTravelRecord || !registeredTravelRecord.travelRecordId) {
    return {
      status: "OK",
      message: "travelRecord is already removed",
    };
  }

  await run(
    "DELETE FROM travelRecord WHERE travelRecordId = ?",
    [registeredTravelRecord.travelRecordId],
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });

  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });

  return {
    status: "OK",
    message: "travelRecord is successfully deleted",
  };
};

/**
 * cognitoに登録されているIDTokenからユーザー名を取得する
 *
 * @param {APIGatewayEvent} event
 * @return {*}
 */
const getuserName = (event: APIGatewayEvent) => {
  const idToken = event.headers.authorization!.split(" ")[1];
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

  return cognitoUserName;
};

/**
 * event引数からbodyパラメータを抜き出す
 *
 * @param {APIGatewayEvent} event
 * @return {*}
 */
const getBodyParameter = (event: APIGatewayEvent) => {
  // bodyパラメータを取得し、userNameをデコードする
  const decodedEventBody = Buffer.from(event.body!, "base64").toString();
  const bodyList = decodedEventBody.split("&").map((keyValue) => {
    const key = keyValue.split("=")[0];
    const value = keyValue.split("=")[1];
    return { key: key, value: value };
  });

  return bodyList;
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

  const userName = getuserName(event);
  const bodyList = getBodyParameter(event);

  console.log({ bodyList });

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
    response = await postTravelRecord({
      userName: userName,
      title: title,
      startDate: Number(startDate),
      endDate: Number(endDate),
    });
  } catch (error) {
    console.log(error);
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
