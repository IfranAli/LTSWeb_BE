import {CrudService} from "../generic/crud.service";
import {UserDatabaseModel, UserModel, UserModelInvalid} from "./user.interface";
import {Pool} from "mariadb";

const safeFields: Array<keyof UserModel> = [
    "id",
    "username",
    "password",
    "token",
];

export class UserService extends CrudService<UserModel> {
    constructor(pool: Pool) {
        super(pool, 'User', safeFields);
    }

    findUserByToken = async (token: String): Promise<UserModel> => {
        const query = `
            select *
            from User
            where User.token = (?)
            limit 10;
        `

        return this.runQuery(query, [token]).then(value => {
            return value[0] as UserModel ?? UserModelInvalid;

        }).catch(reason => {
            return UserModelInvalid
        })

    }

    findUserByUserName = async (username: String): Promise<UserDatabaseModel> => {
        const user = await this.findAll().then(users =>
            users.find(user => user.username == username)
        ).catch(reason => {
            console.log(reason)
        });

        return user ?? UserModelInvalid
    }
}
