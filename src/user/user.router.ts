import express, {NextFunction, Request, Response} from "express";
import {isValidUser, UserDatabaseModel, UserModel, UserModelPublic} from "./user.interface";
import {respondError, respondOk, respondUnauthorized} from "../generic/router.util";
import {getToken, passport} from "../passport-config";

const router = express.Router()


export var isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('token');

    if (token) {
        const user: UserModel = await req.services.userService.findUserByToken(token)

        if (isValidUser(user)) {
            req.userData = user;
            return next();
        }
    }

    respondUnauthorized(res, 'Unauthorised');
};

router.get('/', isAuthenticated, (req: Request, res: Response) => {
        const userID = req.userData?.id ?? null;

        if (!userID) {
            return respondError(res, 'Could not authenticate user')
        }

        return req.services.userService.find(userID)
            .then(async (value) => {
                const userModel = await getUserInformation(req, value[0].token).then(value => value);
                respondOk(res, userModel)
            })
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

const getUserInformation = async (req: Request, token: String): Promise<UserModelPublic> => {
    return req.services.userService.findUserByToken(token).then(async user => {
        const accountId = await req.services.financeService.getAccountsByUserId(user.id).then(value => value[0] ?? null);

        const userModel: UserModelPublic = {
            id: user.id,
            name: user.username,
            accountId: accountId,
            token: user.token
        };

        return userModel;
    }).catch(reason => {
        return Promise.reject('Not implemented yet');
    });
}

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

            const userModel = await getUserInformation(req, token).then(value => value);
            return res.send({
                userModel,
                token
            });
        });

    })(req, res, next);
    // return passport.authenticate('jwt', {session: false});
});

export {
    router as userRouter
}