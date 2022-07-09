const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");

const postUser = (userName) => {
  db.serialize(() => {
    db.run(
      "SELECT userId from user where userName = ?",
      userName,
      (error, row) => {
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
        db.run(
          "INSERT INTO user(userName) values(?)",
          userName,
          (error, row) => {
            if (error) {
              console.error("table error: " + error.message);
            }
            console.log({ row });
            return {
              status: "OK",
              userId: row.userId,
            };
          }
        );
      }
    );
  });
};

exports.handler = async (event) => {
  console.log({ event });
  const decodedEventBody = Buffer.from(event.body, "base64").toString();
  console.log({ decodedEventBody });
  const eventBody = JSON.parse(decodedEventBody);
  const userName = eventBody.userName;

  let status = 200;
  let response;
  try {
    response = postUser(userName);
  } catch (e) {
    console.log(e);
    status = 500;
  }

  console.log({ response });

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(response),
  };
};
