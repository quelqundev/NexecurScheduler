import { UserConfiguration } from "../Models/UserConfiguration";

export class UserDatabase {
    
    private static users;

    init(cb){
        var usersDB: UserConfiguration = require('./../users.json');
        var hash = require('pbkdf2-password')();

        UserDatabase.users = usersDB.users;

        for (let index = 0; index < UserDatabase.users.length; index++) {
            const user = UserDatabase.users[index];
            // when you create a user, generate a salt
            var password = user.password;
            hash({ password: password }, function (err, pass, salt, hash) {
                if (err)
                    throw err;
                // store the salt & hash in the "db"
                user['salt'] = salt;
                user['hash'] = hash;
                cb();
            });
        }
    }
    
    
    // Authenticate using our plain-object database of doom!
    public static authenticate(name, pass, fn) {
        var hash = require('pbkdf2-password')();

        if (!module.parent) console.log('authenticating %s:%s', name, pass);
        var user = UserDatabase.users.find(u => u.name == name);
        // query the db for the given username
        if (!user) return fn(new Error('cannot find user'));
        // apply the same algorithm to the POSTed password, applying
        // the hash against the pass / salt, if there is a match we
        // found the user
        hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
            if (err) return fn(err);
            if (hash === user.hash) return fn(null, user)
            fn(new Error('invalid password'));
        });
    }
    
}
