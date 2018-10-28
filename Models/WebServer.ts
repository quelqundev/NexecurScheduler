import { TaskScheduler } from "./TaskScheduler";
import { NoplanningDate } from "./NoplanningDate";
import { Log } from "./LogUtil";
import { UserDatabase } from "./UserDatabase";
import { DatabaseContext } from "./DatabaseContext";

export class WebServer {
    ts: TaskScheduler;

    constructor(ts: TaskScheduler) {
        this.ts = ts;
    }

    /**
     * Launch webserver
     */
    async start() {
        var express = require('express');
        var path = require('path');
        var session = require('express-session');
        var app = express();

        var appPath = path.join(__dirname, '..');

        //Server configuration
        app.set('view engine', 'ejs');
        let viewPath = path.join(appPath, 'views');
        let staticFilesPath = path.join(appPath, 'views/src');
        app.set('views', viewPath);

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

        /**
         * API
         */
        app.get('/', function (req, res) {
            res.redirect('/login');
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

        app.get('/logout', function (req, res) {
            // destroy the user's session to log them out
            // will be re-created next request
            req.session.destroy(function () {
                res.redirect('/');
            });
        });

        app.get('/restricted', restrict, function (req, res) {
            NoplanningDate.getAllNoplanningDates((err, noplanningdates) => {
                res.render('restricted', { arrayDates: noplanningdates, scheduleConfig: this.ts.scheduleConfig });
            });
        });

        app.use('/src', express.static(staticFilesPath));  // allow /src directory to be public

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
            this.ts.scheduleConfig.activationHour = req.body.activationhour || this.ts.scheduleConfig.activationHour;
            this.ts.activationSchedule.reschedule({ hour: this.ts.scheduleConfig.activationHour });
            Log.debug("activationHour set to " + this.ts.scheduleConfig.activationHour);
            res.redirect('/restricted');
        });

        app.post('/desactivationhour', restrict, function (req, res) {
            this.ts.scheduleConfig.desactivationHour = req.body.desactivationhour || this.ts.scheduleConfig.desactivationHour;
            this.ts.desactivationSchedule.reschedule({ hour: this.ts.scheduleConfig.desactivationHour });
            Log.debug("desactivationHour set to " + this.ts.scheduleConfig.desactivationHour);
            res.redirect('/restricted');
        });


        //load users database
        await UserDatabase.init();
        //start server
        app.listen(80);
        Log.info('Express started on port 80');
        //load Dates database
        DatabaseContext.createContext();
        Log.info('Database context created');
    }
}