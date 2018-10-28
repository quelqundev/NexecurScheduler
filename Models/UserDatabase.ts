import { UserConfiguration } from "../Models/UserConfiguration";

export class UserDatabase {

    private static users;

    init(cb) {
        var usersDB: UserConfiguration = require('./../users.json');
        var hash = require('pbkdf2-password')();
        UserDatabase.users = usersDB.users;
        cb();
    }


    // Authenticate using our plain-object database of doom!
    public static authenticate(name, pass, fn) {
        var hash = require('pbkdf2-password')();

        if (module.parent) console.log('authenticating %s:%s', name, pass);
        var user = UserDatabase.users.find(u => u['name'] == name);
        // query the db for the given username
        if (!user) return fn(new Error('cannot find user'));

        if (pass === user['password']) {
            return fn(null, user);
        } else {
            fn(new Error('invalid password'));
        }
    }

}
