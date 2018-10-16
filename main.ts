import { AlarmStatus } from "./Nexecur-Unofficial-API/Models/AlarmStatus";
import { NexecurAPI } from "./Nexecur-Unofficial-API/Controllers/NexecurAPI";
import { DatabaseContext } from "./Models/DatabaseContext";
import { NoplanningDate } from "./Models/NoplanningDate";
import { UserDatabase } from "./Models/UserDatabase";
import { Configuration } from "./Models/Configuration";

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

var scheduleConfig: Configuration = require('./config.json');
scheduleConfig.activationHour = scheduleConfig.activationHour || 21;
scheduleConfig.desactivationHour = scheduleConfig.desactivationHour || 6;

/**
 * Alarm activation task
 */
let activationSchedule = schedule.scheduleJob({ hour: scheduleConfig.activationHour }, function () {

    let postcheckCallback = (status: AlarmStatus) => {
        switch (status) {
            case AlarmStatus.Enabled:
                console.log('Alarme ENABLED');
                break;
            case AlarmStatus.Disabled:
                console.log('Alarm DISABLED');
                //error : alarm is still not enabled
                return;
                break;
            default:
                //error : status is not an AlarmStatus
                break;
        }
    };

    let enableCallback = () => {
        //Check system status after the try
        console.log('Checking alarm status...');
        NexecurAPI.getAlarmStatus(postcheckCallback);
    };

    let precheckCallback = ((status: AlarmStatus) => {
        switch (status) {
            case AlarmStatus.Disabled:
                console.log('Alarm DISABLED');
                enableCallback();
                break;
            case AlarmStatus.Enabled:
                console.log('Alarm ENABLED');
                //Specific case : alarm already enabled but consider it as normal
                break;
            default:
                //error : status is not an AlarmStatus
                break;
        }
    });

    //determine if we should activate alarm today or not
    NoplanningDate.isTodayANoplanningDate((isANoplanningDate: boolean) => {
        if (isANoplanningDate == true) {
            //we should not activate the security system...
            console.log("Today is an exception, dont activate alarm");
            //...and then dont desactivate it next time
            desactivationSchedule.cancelNext();
        } else {
            //Check system status before trying to enable
            console.log('Checking alarm status...');
            NexecurAPI.getAlarmStatus(precheckCallback);
        }
    });


});

/**
 * Alarm desactivation task
 */
let desactivationSchedule = schedule.scheduleJob({ hour: scheduleConfig.desactivationHour }, function () {

    let postcheckCallback = (status: AlarmStatus) => {
        switch (status) {
            case AlarmStatus.Disabled:
                console.log('Alarm DISABLED');
                break;
            case AlarmStatus.Enabled:
                console.log('Alarm still ENABLED...');
                //error : alarm is still enabled
                return;
                break;
            default:
                //error : status is not an AlarmStatus
                break;
        }
    };

    let disableCallback = () => {
        //Check system status after the try
        console.log('Checking alarm status...');
        NexecurAPI.getAlarmStatus(postcheckCallback);
    };

    let precheckCallback = ((status: AlarmStatus) => {
        switch (status) {
            case AlarmStatus.Enabled:
                console.log('Alarme ENABLED');
                //Try to enable alarm
                console.log('Trying to activate alarm...');
                NexecurAPI.disableAlarm(disableCallback);
                break;
            case AlarmStatus.Disabled:
                console.log('Alarm already DISABLED');
                //Specific case : alarm already disabled
                break;
            default:
                //error : status is not an AlarmStatus
                break;
        }
    });

    //Check system status before trying to enable
    console.log('Checking alarm status...');
    NexecurAPI.getAlarmStatus(precheckCallback);
});


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
app.use('/src', express.static(__dirname + '/views/src'));

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
    if (err) res.locals.message = 'invalid';
    if (msg) res.locals.message = msg;
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
        res.render('restricted', { arrayDates: noplanningdates, scheduleConfig: scheduleConfig });
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

app.post('/activationhour', restrict, function (req, res) {
    scheduleConfig.activationHour = req.body.activationhour || scheduleConfig.activationHour;
    activationSchedule.reschedule({ hour: scheduleConfig.activationHour });
    console.log("activationHour set to " + scheduleConfig.activationHour);
    res.redirect('/restricted');
});

app.post('/desactivationhour', restrict, function (req, res) {
    scheduleConfig.desactivationHour = req.body.desactivationhour || scheduleConfig.desactivationHour;
    desactivationSchedule.reschedule({ hour: scheduleConfig.desactivationHour });
    console.log("desactivationHour set to " + scheduleConfig.desactivationHour);
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
                req.session.success = 'Authentifié comme ' + user.name;
                res.redirect('/restricted');
            });
        } else {
            req.session.error = true;
            res.redirect('/login');
        }
    });
});

/* SERVER LAUNCH */
//load users database
new UserDatabase().init(() => {
    //start server
    if (!module.parent) {
        app.listen(80);
        console.log('Express started on port 80');
        //load Dates database
        DatabaseContext.createContext();
        console.log('Database context created');
    }
});



