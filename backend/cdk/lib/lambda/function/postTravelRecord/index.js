const sqlite3 = require("sqlite3");

exports.handler = async (event, context) => {
  const db = new sqlite3.Database("./db/phoquash.sqlite3", (error) => {
    if (error) {
      console.error("database error: " + error.message);
      return;
    }
    db.serialize(() => {
      //table生成（無ければ）
      db.run(
        "create table if not exists likes( \
                id integer primary key autoincrement, \
                contentId nvwchar(255), \
                name nverchar(64) \
            )",
        (error) => {
          if (error) {
            console.error("table error: " + error.message);
          }
        }
      );
    });
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
