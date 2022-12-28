import {IdentityInterface} from "../generic/Identity.interface";

export interface UserDatabaseModel {
    id: number,
    username: string,
    password: string,
}

export interface UserModel extends IdentityInterface, UserDatabaseModel {
}

export const UserModelInvalid: UserModel = {
    id: -1,
    username: '',
    password: '',
}

export function isValidUser(user: UserModel): boolean {
    return user.id >= 0
        && user.username.length > 0
        && user.password.length > 0;
}
