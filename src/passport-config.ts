import {isValidUser, UserDatabaseModel} from "./user/user.interface";
import {Request} from "express";
import Process from "process";

export const passport = require('passport');

const jwt = require('jsonwebtoken');
export const getToken = (req: Request, user: UserDatabaseModel): string => {
    const signObject = {
        id: user.id,
        username: user.username,
        password: user.password,
    }
    const token = jwt.sign(signObject, Process.env.JWT_KEY)
    return token
}

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

passport.use(new LocalStrategy({passReqToCallback: true}, async function verify(req: Request, username: string, password: string, done: any) {
    if (username.length == 0 || password.length == 0) {
        return done(null, false);
    }

    const token = req.headers.token ?? '';
    if (token.length > 0) {

    }

    const user = await req.services.userService.findUserByUserName(username);
    const ERR_MSG = 'Invalid username or password.';
    const err = {message: ERR_MSG};

    if (!isValidUser(user) || (user.password != password)) {
        return done(null, false, err);
    }

    return done(null, user);
}));
