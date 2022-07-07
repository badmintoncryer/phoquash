const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./db/phoquash.sqlite3");

const postUser = (eventBody, userName) => {
  db.serialize(() => {
    db.run("SELECT userId from user where userName = ?", userName, (error) => {
      if (error) {
        console.error("table error: " + error.message);
        return;
      }
      if (row.userId) {
        return {
          status: "OK",
          userId: row.userId,
        };
      }
      db.run("INSERT INTO user(userName) values(?)", userName, (error, row) => {
        if (error) {
          console.error("table error: " + error.message);
        }
        console.log({ row });
        return {
          status: "OK",
          userId: row.userId,
        };
      });
    });
  });
};

exports.handler = async (event, context) => {
  const eventBody = JSON.parse(event.body);
  const userName = eventBody.userName;

  let status = 200;
  try {
    const response = postUser(eventBody, userName);
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
