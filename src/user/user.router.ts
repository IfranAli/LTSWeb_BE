import express, {NextFunction, Request, Response} from "express";
import {UserDatabaseModel, UserModel} from "./user.interface";
import {respondError, respondOk, respondUnauthorized} from "../generic/router.util";
import {getToken, passport} from "../passport-config";

const router = express.Router()


export var isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }

    respondUnauthorized(res, 'Unauthorised');
};

router.get('/', isAuthenticated, (req: Request, res: Response) => {
        const userID = req.userData?.id ?? null;

        if (!userID) {
            return respondError(res, 'Could not authenticate user')
        }

        return req.services.userService.find(userID)
            .then(value => respondOk(res, value))
            .catch(reason => respondError(res, reason))
    }
);

router.post('/logout', function (req: Request, res: Response, next) {
    req.logout(function (err: any) {
        if (err) {
            return next(err)
        }

        return respondOk(res, {success: true});
    });
});


router.post('/login', (req: Request, res: Response, next) => {
    passport.authenticate('local', function (err: string | null, user: UserDatabaseModel) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return respondUnauthorized(res, 'Invalid login');
        }

        req.login(user, async function (err: any) {
            if (err) {
                return next(err);
            }
            const token = getToken(req, user);
            const userData: any = {id: user.id, token: token}
            await req.services.userService.update(userData);

            return res.send({
                user,
                token
            });
        });

    })(req, res, next);
    // return passport.authenticate('jwt', {session: false});
});

export {
    router as userRouter
}