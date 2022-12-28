import {CrudService} from "../generic/crud.service";
import {UserDatabaseModel, UserModel, UserModelInvalid} from "./user.interface";

const safeFields: Array<keyof UserModel> = [
    "id",
    "username",
    "password",
];

class UserService extends CrudService<UserModel> {
    constructor() {
        super('User', safeFields);
    }

    findUserByUserName = async (username: String): Promise<UserDatabaseModel> => {
        const user = await userService.findAll().then(users =>
            users.find(user => user.username == username)
        );

        return user ?? UserModelInvalid
    }
}

export const userService = new UserService();