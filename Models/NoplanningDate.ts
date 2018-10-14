import { DatabaseContext } from "./DatabaseContext";

export class NoplanningDate {
    date: Date;

    constructor(date:Date) {
        this.date = date;    //index du mois (0-11) et jour (1-31)
    }

    /**
     * name
     */
    public saveInDatabase() {
        //TODO verifier si existe deja

        let datestring = this.date.toISOString().slice(0, 10);
        let sql = "INSERT INTO NoplanningDates VALUES ('" + datestring + "')";
        console.log(sql);
        DatabaseContext.db.run(sql, (err) => {
            if (err != null) {
                console.error(err);
            }
        });
    }

    public removeFromDatabase() {
        let datestring = this.date.toISOString().slice(0, 10);
        let sql = "DELETE FROM NoplanningDates WHERE date = '" + datestring + "'";
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

        let date = new Date();
        let datestring = date.toISOString().slice(0, 10);

        DatabaseContext.db.all("SELECT date FROM NoplanningDates WHERE date = '" + datestring + "'", (err, rows: Array<NoplanningDate>) => {
            rows.forEach((row) => { console.log(row.date) });
            if (rows.length > 0) {
                console.log("today exist in databse");
                callback(true);
            } else {
                console.log("today dont exist in databse");
                console.log(datestring);
                callback(false);
            }
        });
    }
}

