import { UserDatabase } from "../Models/UserDatabase";

var assert = require('assert');

describe('UserDatabase tests', async function () {
    await UserDatabase.init();

    describe('#authentification()', function () {
        it('should accept correct authentification of 1st user', function (done) {

            UserDatabase.authenticate("tj", "foobar", (err, user) => {
                if (user) {
                    done();
                } else {
                    done(err);
                }
            });
        });
        it('should accept correct authentification of 2nd user', function (done) {
            UserDatabase.authenticate("tj2", "foobar2", (err, user) => {
                if (user) {
                    done();
                } else {
                    done(err);
                }
            });
        });
        it('should refuse incorrect authentification', function (done) {
            UserDatabase.authenticate("false", "false", (err, user) => {
                if (user) {
                    done(err);
                } else {
                    done();
                }
            });
        });
    });
});
