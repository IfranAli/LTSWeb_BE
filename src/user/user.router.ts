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
  const token = req.header("Authorization");

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
  } else {
    respondUnauthorized(res, "Unauthorised - No token provided");
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
  // Remove token from database
  const userRepository = AppDataSource.getRepository(User);

  userRepository
    .findOneByOrFail({ token: req.body.token })
    .then((value) => {
      value.token = "";
      userRepository.save(value);

      return respondOk(res, { success: true });
    })
    .catch((reason) => {
      return respondError(res, { success: false, reason: reason });
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

/**
 * Create token data.
 * @param user
 * @returns token
 */
function generateToken(user: User) {
  const jwt = require("jsonwebtoken");
  const tokenOptions = {
    expiresIn: "1h", // Set the expiration time for the token
  };
  const signObject = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(signObject, process.env.JWT_KEY, tokenOptions);
}

router.post("/login", (req: Request, res: Response, next) => {
  const userRepository = AppDataSource.getRepository(User);

  const body = req.body;
  const errors = [];

  if (!body.username) {
    errors.push("Username is required");
  }

  if (!body.password) {
    errors.push("Password is required");
  }

  const { username, password } = body;

  return userRepository
    .findOneByOrFail({ username: username, password: password })
    .then((user) => {
      user.token = generateToken(user);

      // Update token in database
      const updateUserToken = userRepository
        .update(user.id, user)
        .then((value) => {
          const data = {
            user: {
              id: user.id,
              name: user.username,
              email: user.email,
            },
            token: user.token,
          };

          res.setHeader("Authorization", user.token);
          return respondOk(res, { success: true, data: data });
        })
        .catch((reason) => {
          return respondError(res, { success: false, reason: reason });
        });
    })
    .catch((reason) =>
      respondError(res, {
        success: false,
        reason: "Invalid username or password",
      })
    );
});

export { router as userRouter };
