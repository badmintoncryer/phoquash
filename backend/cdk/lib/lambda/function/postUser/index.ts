const sqlite3 = require("sqlite3");

const postUser = async (userName) => {
  const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");
  // const db = new sqlite3.Database("../phoquash.sqlite3");

  const get = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (error, row) => {
        if (error) {
          reject(error);
        }
        resolve(row);
      });
    });
  };

  const run = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  const close = () => {
    return new Promise((resolve, reject) => {
      db.close((error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  const existedUserId = await get(
    "SELECT userId FROM user WHERE userName = ?",
    [userName]
  ).catch((error) => {
    throw new Error("table error: " + error.message);
  });
  if (existedUserId && existedUserId.userId) {
    await close().catch((error) => {
      throw new Error("table error: " + error.message);
    });
    return {
      status: "OK",
      userId: existedUserId.userId,
    };
  }
  // 登録済みにのuserNameが存在しない場合、新しいuserの登録を行う
  await run("INSERT INTO user(userName) values(?)", [userName]).catch(
    (error) => {
      throw new Error("table error: " + error.message);
    }
  );
  // 新規登録したuserIdを取得してreturn
  const registeredUserId = await get(
    "SELECT userId FROM user WHERE userName = ?",
    [userName]
  ).catch((error) => {
    throw new Error("table error: " + error.message);
  });
  await close().catch((error) => {
    throw new Error("table error: " + error.message);
  });
  return {
    status: "OK",
    userId: registeredUserId.userId,
  };
};

exports.handler = async (event) => {
  const decodedEventBody = Buffer.from(event.body, "base64").toString();
  const bodyList = decodedEventBody.split("&").map((keyValue) => {
    const key = keyValue.split("=")[0];
    const value = keyValue.split("=")[1];
    return { key: key, value: value };
  });

  const userName = bodyList.filter((element) => {
    return element["key"] === "userName";
  })[0]["value"];

  let status = 200;
  const response = await postUser(userName).catch((error) => {
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
