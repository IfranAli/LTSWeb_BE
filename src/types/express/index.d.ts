import {UserDatabaseModel} from "../../user/user.interface";

declare global {
    namespace Express {
        export interface Request {
            login(user: UserDatabaseModel, callback: Function)
            isAuthenticated(): boolean
        }
    }
}