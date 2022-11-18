import {TaskState} from "../constants";
import {IdentityInterface} from "../generic/Identity.interface";

export interface TaskDatabaseModel {
    ProjectID: number,
    Name: string,
    Content: string,
}

export interface TaskModel extends IdentityInterface, TaskDatabaseModel {
    state: TaskState;
}

export interface Tasks {
    [key: number]: TaskModel;
}