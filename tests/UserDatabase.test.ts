import { UserDatabase } from "../Models/UserDatabase";

var assert = require('assert');

describe('UserDatabase tests', function () {
    describe('#authentification()', function () {
        it('should accept correct authentification', function (done) {
            new UserDatabase().init(()=>{
                UserDatabase.authenticate("tj", "foobar", (err, user)=> {
                    if (user){
                        done();
                    } else {
                        done(err);
                    }
                });
            });
        });
        it('should refuse incorrect authentification', function (done) {
            new UserDatabase().init(()=>{
                UserDatabase.authenticate("false", "false", (err, user)=> {
                    if (user){
                        done(err);
                    } else {
                        done();
                    }
                });
            });
        });
    });
});
