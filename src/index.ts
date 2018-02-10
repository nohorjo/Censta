import * as express from 'express';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as cluster from 'cluster';
import * as os from 'os';
import MySQLStore from 'express-mysql-session';
import * as path from 'path';
import * as fbauth from './fbauth';

const cpus = 1; //os.cpus().length; // FIXME: enable once mysql is set up

if (cluster.isMaster) {
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }
} else {
    const port = process.env.PORT || 8080;

    const app = express();

    const sess = {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        unset: 'destroy',
        cookie: { maxAge: 31536000000, httpOnly: true }
    };

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        sess.cookie['secure'] = true;
        session["store"] = new MySQLStore({
            host: process.env.DB_IP,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionLimit: cpus
        });
    } else {
        sess.secret = Math.random().toString();
    }
    
    app.use(express.json());
    app.use(cookieParser());
    app.use(session(sess) );
    
    app.get(['/', ''], (req, res) => res.redirect('/index.html'));
    app.delete('/fb', fbauth.logout);
    app.post('/fb', fbauth.login);

    app.all('/app/*', fbauth.checkAuth);

    app.get(/.*(?<!index)\.html$/g, fbauth.checkAuth);

    app.use(express.static(path.join(__dirname, '..', 'static')));

    app.listen(port, () => console.log(`Server ${cluster.worker.id} listening on port ${port}`));
}
