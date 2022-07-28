import {
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import sqlite3 = require("sqlite3");

interface deleteTravelProps {
  travelId: string;
}
const deleteTravelById = async (props: deleteTravelProps) => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database(
  //   "/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3"
  // );

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

  await run("DELETE FROM travel WHERE travelId = ?", [props.travelId]).catch(
    (error) => {
      console.log(error);
      throw new Error("table error: " + error.message);
    }
  );

  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });

  return {
    status: "OK",
    message: "travel is successfully deleted",
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
  console.log({ event });
  // eventが空の場合早期return
  if (!event || !event.body || !event.headers || !event.headers.authorization) {
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
  const travelId = apiPath.split("/").slice(-1)[0];

  let status = 200;
  let response = {};
  try {
    response = await deleteTravelById({
      travelId: travelId,
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
