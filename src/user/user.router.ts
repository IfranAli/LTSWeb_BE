import express, { NextFunction, Request, Response } from "express";
import {
  isValidUser,
  UserDatabaseModel,
  UserModel,
  UserModelPublic,
} from "./user.interface";
import {
  respondError,
  respondOk,
  respondUnauthorized,
} from "../generic/router.util";
import { getToken, passport } from "../passport-config";
import { User } from "../typeorm/entities/User";
import { AppDataSource } from "../index";

const router = express.Router();

export var isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("token");

  if (token) {
    const userRepository = AppDataSource.getRepository(User);

    userRepository
      .findOneByOrFail({ token: token })
      .then((value) => {
        if (!value) {
          respondError(res, "Could not authenticate user");
        }

        const isValid =
          value.id >= 0 &&
          value.username.length > 0 &&
          value.password.length > 0;

        if (isValid) {
          req.userData = value;
          return next();
        }
      })
      .catch((reason) => {
        respondUnauthorized(res, "Unauthorised");
      });
  }

};

router.get("/", isAuthenticated, (req: Request, res: Response) => {
  const userID = req.userData?.id ?? null;

  if (!userID) {
    return respondError(res, "Could not authenticate user");
  }

  return req.services.userService
    .find(userID)
    .then(async (value) => {
      const userModel = await getUserInformation(req, value[0].token).then(
        (value) => value
      );
      respondOk(res, userModel);
    })
    .catch((reason) => respondError(res, reason));
});

router.post("/", async (req: Request, res: Response) => {
  const r = req.body;
  const user = new User();

  user.username = req.body.username;
  user.name = user.username;
  user.password = req.body.password;
  user.email = req.body.email;
  user.token = "";

  const userRepository = AppDataSource.getRepository(User);

  userRepository
    .findOneByOrFail({ username: user.username })
    .then((value) => {
      respondError(res, { success: false, reason: "User already exists" });
    })
    .catch(() => {
      return AppDataSource.manager
        .save(user)
        .then((value) => {
          const userDetial = {
            name: user.name,
            username: user.username,
            email: user.email,
            token: user.token,
          };
          return respondError(res, { success: true, user: userDetial });
        })
        .catch((reason) => {
          return respondError(res, {
            success: false,
            reason: reason,
          });
        });
    });
});

router.post("/logout", function (req: Request, res: Response, next) {
  req.logout(function (err: any) {
    if (err) {
      return next(err);
    }

    return respondOk(res, { success: true });
  });
});

const getUserInformation = async (
  req: Request,
  token: String
): Promise<UserModelPublic> => {
  return req.services.userService
    .findUserByToken(token)
    .then(async (user) => {
      const accountId = await req.services.financeService
        .getAccountsByUserId(user.id)
        .then((value) => value[0] ?? null);

      const userModel: UserModelPublic = {
        id: user.id,
        name: user.username,
        accountId: accountId,
        token: user.token,
      };

      return userModel;
    })
    .catch((reason) => {
      return Promise.reject("Not implemented yet");
    });
};

router.post("/login", (req: Request, res: Response, next) => {
  passport.authenticate(
    "local",
    function (err: string | null, user: UserDatabaseModel) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return respondUnauthorized(res, "Invalid login");
      }

      req.login(user, async function (err: any) {
        if (err) {
          return next(err);
        }
        const userRepository = AppDataSource.getRepository(User);

        const newToken = getToken(req, user);
        const userModel = userRepository
          .findOneByOrFail({ id: user.id })
          .then((user) => {
            user.token = newToken;

            userRepository.save(user).then((value) => {
              const userData = {
                id: value.id,
                username: value.username,
                password: "",
              };

              const data = {
                user: userData,
                token: user.token,
              };
              return respondOk(res, { success: true, data: data });
            });
          })
          .catch((reason) => {
            respondError(res, { success: false, reason: reason });
          });
      });
    }
  )(req, res, next);
});

export { router as userRouter };
