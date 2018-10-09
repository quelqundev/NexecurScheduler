import { DatabaseContext } from "../Models/DatabaseContext";
import { NoplanningDate } from "../Models/NoplanningDate";

var assert = require('assert');

describe('DatabaseContext', function () {
    describe('#saveInDatabase()', function () {
        it('should save correctly a date in database', function (done) {
            DatabaseContext.createContext();    //database init
            NoplanningDate.getAllNoplanningDates((err, rows) => {
                //initial state
                let initialnumber = rows.length;

                //try to save date
                let test: NoplanningDate = new NoplanningDate(1995, 4, 13);
                test.saveInDatabase();
                //verifiy
                NoplanningDate.getAllNoplanningDates((err, rows) => {
                    let finalnumber = rows.length;
                    let diff = finalnumber - initialnumber;
                    if (diff == 1) {
                        done();
                    } else {
                        done("Nombre de dates sauvegardées : " + diff);
                    }
                });
            });
        });
    });
});

// describe('NoplanningDate fonctions', function () {
//     describe('#isAnNoplanningDate()', function () {
//         it('should identify correctly if a date exist in database', function (done) {
//             DatabaseContext.createContext();    //database init

//             let a: NoplanningDate = new NoplanningDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

//             a.saveInDatabase();

//             NoplanningDate.isTodayANoplanningDate((isAnNoplanningDate) => {
//                 console.log(isAnNoplanningDate);
//                 if (isAnNoplanningDate == true) {
//                     done();
//                 } else {
//                     done("Incorrect identification");
//                 }
//             });
//         });

//         it('should identify correctly if a date dont exist in database', function (done) {
//             DatabaseContext.createContext();    //database init

//             let a: NoplanningDate = new NoplanningDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

//             a.removeFromDatabase();

//             NoplanningDate.isTodayANoplanningDate((isAnNoplanningDate) => {
//                 console.log(isAnNoplanningDate);
//                 if (isAnNoplanningDate == true) {
//                     done("Incorrect identification");
//                 } else {
//                     done();
//                 }
//             });
//         });
//     });
// });
