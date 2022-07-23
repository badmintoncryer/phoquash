const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");

exports.handler = async (event, context) => {
  db.serialize(() => {
    db.run(
      "INSERT INTO travelRecord(title,start,end,) values(?,?)",
      "foo",
      44,
      (error) => {
        if (error) {
          console.error("table error: " + error.message);
        }
      }
    );
  });

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
