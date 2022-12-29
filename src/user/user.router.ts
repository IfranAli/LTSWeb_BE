import express, {NextFunction, Request, Response} from "express";
import {userService} from "./user.service";
import {isValidUser, UserDatabaseModel} from "./user.interface";
import {respondError, respondOk, respondUnauthorized} from "../generic/router.util";

const router = express.Router()
export const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function (user: UserDatabaseModel, done: Function) {
    done(null, user.id);
})

passport.deserializeUser(function (user: UserDatabaseModel, done: Function) {
    done(null, {
        username: user.username,
        password: user.password
    });
})

passport.use(new LocalStrategy(async function verify(username: string, password: string, done: any) {
    if (username.length == 0 || password.length == 0) {
        return done(null, false);
    }

    const user = await userService.findUserByUserName(username);
    const ERR_MSG = 'Invalid username or password.';
    const err = {message: ERR_MSG};

    if (!isValidUser(user) || (user.password != password)) {
        return done(null, false, err);
    }

    return done(null, user);
}));

export var isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }

    respondUnauthorized(res, 'Unauthorised');
};

router.get('/', isAuthenticated, (req: Request, res: Response) => {
    const userID = req.session.passport?.user;

    if (!userID) {
        return respondError(res, 'Could not authenticate user')
    }

    return userService.find(userID)
        .then(value => respondOk(res, value))
        .catch(reason => respondError(res, reason))
    }
);

router.post('/login', (req: Request, res: Response, next) => {
    passport.authenticate('local', function (err: string | null, user: UserDatabaseModel) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return respondUnauthorized(res, 'Invalid login');
        }

        req.login(user, function (err: any) {
            if (err) {
                return next(err);
            }
            return res.send(user);
        });

    })(req, res, next);
});

export {
    router as userRouter
}