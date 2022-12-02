import {TaskState} from "../constants";
import {IdentityInterface} from "../generic/Identity.interface";

export interface TaskDatabaseModel {
    projectId: number,
    name: string,
    content: string,
}

export interface TaskModel extends IdentityInterface, TaskDatabaseModel {
    state: TaskState;
}

export interface Tasks {
    [key: number]: TaskModel;
}