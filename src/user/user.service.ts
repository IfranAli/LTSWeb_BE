import {CrudService} from "../generic/crud.service";
import {UserDatabaseModel, UserModel, UserModelInvalid} from "./user.interface";
import {Pool} from "mariadb";

const safeFields: Array<keyof UserModel> = [
    "id",
    "username",
    "password",
];

export class UserService extends CrudService<UserModel> {
    constructor(pool: Pool) {
        super(pool,'User', safeFields);
    }

    findUserByUserName = async (username: String): Promise<UserDatabaseModel> => {
        const user = await this.findAll().then(users =>
            users.find(user => user.username == username)
        );

        return user ?? UserModelInvalid
    }
}
