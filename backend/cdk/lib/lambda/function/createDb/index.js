const sqlite3 = require("sqlite3");

exports.handler = async (event, context) => {
  const db = new sqlite3.Database("./db/phoquash.sqlite3", (error) => {
    if (error) {
      console.error("database error: " + error.message);
      return;
    }
    db.serialize(() => {
      db.run("PRAGMA foreign_keys = ON", (error) => {
        if (error) {
          console.error("table error: " + error.message);
        }
      });
      db.run(
        "CREATE TABLE if not exists user( \
          id integer primary key autoincrement \
        )",
        (error) => {
          if (error) {
            console.error("table error: " + error.message);
          }
        }
      );
      db.run(
        "CREATE TABLE if not exists travelRecord( \
          travel_id integer primary key autoincrement \
          title text \
          start numeric \
          end numeric \
          foreign key (user_id) references user(id) \
        )",
        (error) => {
          if (error) {
            console.error("table error: " + error.message);
          }
        }
      );
      db.run(
        "CREATE TABLE if not exists travel( \
          foreign key (user_id) references user(id) \
          foreign key (travel_id) references travelRecord(travel_id) \
        )",
        (error) => {
          if (error) {
            console.error("table error: " + error.message);
          }
        }
      );
      db.run(
        "CREATE TABLE if not exists photo( \
          photo_id integer primary key autoincrement \
          description text \
          foreign key (travel_id) references travelRecord(travel_id) \
          fileName text \
          filePath text \
          isFavorite integer \
        )",
        (error) => {
          if (error) {
            console.error("table error: " + error.message);
          }
        }
      );
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: "Successfully created DB",
      }),
    };
  });
};
