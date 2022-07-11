const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/mnt/db/phoquash.sqlite3");

exports.handler = async (event, context) => {
  db.serialize(() => {
    db.run("DROP TABLE user", (error) => {
      if (error) {
        console.error("table error: " + error.message);
      }
    });
    db.run("DROP TABLE travelRecord", (error) => {
      if (error) {
        console.error("table error: " + error.message);
      }
    });
    db.run("DROP TABLE travel", (error) => {
      if (error) {
        console.error("table error: " + error.message);
      }
    });
    db.run("DROP TABLE photo", (error) => {
      if (error) {
        console.error("table error: " + error.message);
      }
    });
    db.run("PRAGMA foreign_keys = ON", (error) => {
      if (error) {
        console.error("table error: " + error.message);
      }
    });
    db.run(
      "CREATE TABLE if not exists user( \
          id integer primary key autoincrement \
          userName test \
        )",
      (error) => {
        if (error) {
          console.error("table error: " + error.message);
        }
      }
    );
    db.run(
      "CREATE TABLE if not exists travelRecord( \
          travelId integer primary key autoincrement \
          title text \
          start numeric \
          end numeric \
          foreign key (userId) references user(id) \
        )",
      (error) => {
        if (error) {
          console.error("table error: " + error.message);
        }
      }
    );
    db.run(
      "CREATE TABLE if not exists travel( \
          foreign key (userId) references user(id) \
          foreign key (travelId) references travelRecord(travelId) \
        )",
      (error) => {
        if (error) {
          console.error("table error: " + error.message);
        }
      }
    );
    db.run(
      "CREATE TABLE if not exists photo( \
          photoId integer primary key autoincrement \
          description text \
          foreign key (travelId) references travelRecord(travelId) \
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
};
