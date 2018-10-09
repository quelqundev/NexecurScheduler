import { DatabaseContext } from "./DatabaseContext";

export class NoplanningDate {
    date: Date;

    constructor() {
        this.date = new Date(1995, 4 - 1, 13 + 1);    //index du mois (0-11) et jour (1-31)
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

    public static getAllNoplanningDates( callback :(err, rows: Array<NoplanningDate>) => void ) {
        let ret = null;
        DatabaseContext.db.all("SELECT date FROM NoplanningDates", callback);
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

