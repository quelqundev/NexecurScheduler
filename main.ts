import { AlarmStatus } from "./Nexecur-Unofficial-API/Models/AlarmStatus";
import { NexecurAPI } from "./Nexecur-Unofficial-API/Controllers/NexecurAPI";
import { DatabaseContext } from "./Models/DatabaseContext";
import { NoplanningDate } from "./Models/NoplanningDate";
import { UserDatabase } from "./Models/UserDatabase";

/******************************************************************************/
/*                              TASK SCHEDULER                                */
/******************************************************************************/

//https://github.com/node-schedule/node-schedule/blob/master/README.md
var schedule = require('node-schedule');

//https://www.npmjs.com/package/simple-node-logger
// const opts = {
//   errorEventName:'error',
//   logDirectory:'./logs', // NOTE: folder must exist and be writable...
//   fileNamePattern:'roll-<DATE>.log',
//   dateFormat:'YYYY.MM'
// };
// const log = require('simple-node-logger').createRollingFileLogger( opts );
// log.info('Alarme activée');  //trace, debug, info, warn, error and fatal

/* ACTIVATION ALARME
    1 - verifier alarme est désactivée
        1.1 - si alarme deja activée, alors notifier propriétaire ? et ne pas activer alarme (aller au 3)
        1.2 - si alarme non activée, alors activer alarme (aller au 2)
    2 - finalement verifier que l'alarme est activée
        2.1 - si alarme n'est pas activée, alors notifier propriétaire (aller au 3)
    3 - terminer
*/

/* DESACTIVATION ALARME
  1 - verifier alarme est activée
      1.1 - si alarme non activée, alors notifier propriétaire ? et ne pas activer alarme
      1.2 - si alarme activée, alors désactiver alarme
  2 - finalement verifier que l'alarme est désactivée
      2.1 - si alarme n'est pas désactivée, alors notifier propriétaire (aller au 3)
  3 - terminer
*/

// var j = schedule.scheduleJob({second: 0}, function(){
//     NexecurAPI.getAlarmStatus((status: AlarmStatus) => {
//         switch (status) {
//             case AlarmStatus.Enabled:
//                 console.log('Alarme ACTIVEE');
//                 break;

//             case AlarmStatus.Disabled:
//                 console.log('Alarme DESACTIVEE');
//                 break;

//             default:
//                 break;
//         }
//     });
//   });


/******************************************************************************/
/*                              SERVER CONFIG                                 */
/******************************************************************************/
var express = require('express');
var path = require('path');
var session = require('express-session');

var app = module.exports = express();

// config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// allow /src directory to be public
app.use('/src',  express.static(__dirname + '/views/src'));

// middleware
app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));

// Session-persisted message middleware
app.use(function (req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Accès refusé!';
        res.redirect('/login');
    }
}

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/restricted', restrict, function (req, res) {
    NoplanningDate.getAllNoplanningDates((err, noplanningdates) => {
        res.render('restricted', { arrayDates: noplanningdates });
    });
});

app.post('/date', restrict, function (req, res) {
    let noplanningdate: NoplanningDate = new NoplanningDate(new Date(req.body.date));
    noplanningdate.saveInDatabase();
    res.redirect('/restricted');
});

app.post('/deletedate', restrict, function (req, res) {
    let noplanningdate: NoplanningDate = new NoplanningDate(new Date(req.body.date));
    noplanningdate.removeFromDatabase();
    res.redirect('/restricted');
});

app.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    UserDatabase.authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function () {
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.name
                    + ' click to <a href="/logout">logout</a>. '
                    + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/restricted');
            });
        } else {
            req.session.error = 'Erreurs lors de la connexion. Vérifiez votre '
                + ' nom d\'utilisateur et/ou mot de passe.';
            res.redirect('/login');
        }
    });
});

/* istanbul ignore next */
// users database
new UserDatabase().init(() => {
    if (!module.parent) {
        app.listen(80);
        console.log('Express started on port 80');
        DatabaseContext.createContext();
        console.log('Database context created');
    }
});



