import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import sqlite3 = require("sqlite3");

const createDb = async () => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database("/Users/cryershinozukakazuho/git/phoquash/backend/cdk/phoquash.sqlite3");

  const run = (sql: string, params?: string[]) => {
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

  await run("DROP TABLE IF EXISTS user").catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run("DROP TABLE IF EXISTS travelRecord").catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run("DROP TABLE IF EXISTS travel").catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run("DROP TABLE IF EXISTS photo").catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run("PRAGMA foreign_keys = ON").catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run(
    "CREATE TABLE IF NOT EXISTS user( \
          userId integer primary key autoincrement, \
          userName text \
          )"
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run(
    "CREATE TABLE IF NOT EXISTS travelRecord( \
          travelRecordId integer primary key autoincrement, \
          title text, \
          start numeric, \
          end numeric, \
          userId integer, \
          foreign key (userId) references user(userId) \
        )"
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run(
    "CREATE TABLE IF NOT EXISTS travel( \
          travelId integer primary key autoincrement, \
          userId integer, \
          travelRecordId integer, \
          foreign key (userId) references user(userId), \
          foreign key (travelRecordId) references travelRecord(travelRecordId) \
        )"
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await run(
    "CREATE TABLE IF NOT EXISTS photo( \
          photoId integer primary key autoincrement, \
          description text, \
          travelId integer, \
          fileName text, \
          filePath text, \
          isFavorite integer, \
          foreign key (travelId) references travelRecord(travelId) \
        )"
  ).catch((error) => {
    console.log(error);
    throw new Error("table error: " + error.message);
  });
  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });
};

exports.handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let status = 200;
  let response = {
    status: "Successfully created DB",
  };
  await createDb().catch((error) => {
    console.log(error);
    status = 500;
    response = {
      status: "DB creation is failed",
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
