import {UserDatabaseModel} from "../../user/user.interface";

export {}

declare global {
    namespace Express {
        export interface Request {
            login(user: UserDatabaseModel, callback: Function)
            isAuthenticated(): boolean
        }
    }
}