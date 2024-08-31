import { UserDatabaseModel, UserModel } from "../../user/user.interface";
import { FinanceService } from "../../finance/finance.service";
import { UserService } from "../../user/user.service";
import { ProjectsService } from "../../projects/project.service";
import { TasksService } from "../../tasks/task.service";

declare global {
  namespace Express {
    export interface Request {
      userData: UserModel | null;

      login(user: UserDatabaseModel, callback: Function);

      logout(callback: Function);

      isAuthenticated(): boolean;
    }
  }
}
