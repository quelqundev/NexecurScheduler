import { DatabaseContext } from "./DatabaseContext";

export class NoplanningDate {
    date: Date;

    constructor(year: number, month: number, day: number) {
        this.date = new Date(year, month - 1, day + 1);    //index du mois (0-11) et jour (1-31)
    }

    /**
     * name
     */
    public saveInDatabase() {
        //TODO verifier si existe deja

        let sql = "INSERT INTO NoplanningDates VALUES (DATE('" + this.date.toISOString() + "'))";
        console.log(sql);
        DatabaseContext.db.run(sql, (err) => {
            if (err != null) {
                console.error(err);
            }
        });
    }

    public removeFromDatabase() {
        let sql = "DELETE FROM NoplanningDates WHERE date = DATE('" + this.date.toISOString() + "')";
        console.log(sql);
        DatabaseContext.db.run(sql, (err) => {
            if (err != null) {
                console.error(err);
            }
        });
    }

    public static getAllNoplanningDates(callback: (err, rows: Array<NoplanningDate>) => void) {
        let ret = null;
        DatabaseContext.db.all("SELECT date FROM NoplanningDates", callback);
    }

    public static isTodayANoplanningDate(callback: (isANoplanningDate: boolean) => void) {
        let ret = null;
        DatabaseContext.db.all("SELECT date FROM NoplanningDates WHERE date = DATE('now', 'localtime')", (err, rows: Array<NoplanningDate>) => {
            rows.forEach((row) => { console.log(row.date) });
            if (rows.length > 0) {
                console.log("today exist in databse");
                callback(true);
            } else {
                console.log("today dont exist in databse");
                callback(false);
            }
        });
    }
}


// let sql = `SELECT DISTINCT Name name FROM playlists
//            ORDER BY name`;

// db.all(sql, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   rows.forEach((row) => {
//     console.log(row.name);
//   });
// });

// // close the database connection
// db.close();

// let db = new sqlite3.Database('../db/chinook.db');

// let sql = `SELECT FirstName firstName,
//                   LastName lastName,
//                   Email email
//             FROM customers
//             WHERE Country = ?
//             ORDER BY FirstName`;

// db.each(sql, ['USA'], (err, row) => {
//   if (err) {
//     throw err;
//   }
//   console.log(`${row.firstName} ${row.lastName} - ${row.email}`);
// });

// // close the database connection
// db.close();

