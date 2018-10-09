


export class DatabaseContext {
  public static db = null;

  public static createContext() {
    const path = require('path');
    const dbPath = path.resolve(__dirname, '../database.db');
    //https://github.com/mapbox/node-sqlite3
    var sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbPath)
    DatabaseContext.db = new sqlite3.Database(dbPath, (err) => {
      if (err != null) {
        console.error("Error with SQLite database : " + err);
      }
    });

    DatabaseContext.db.serialize(function () {
      // These two queries will run sequentially.
      DatabaseContext.db.run("CREATE TABLE IF NOT EXISTS NoplanningDates (date TEXT)", (err) => {
        if (err != null) {
          console.error(err);
        }
      });

    });


  }

  public static closeContext() {
    DatabaseContext.db.close();
    DatabaseContext.db = null;
  }


}