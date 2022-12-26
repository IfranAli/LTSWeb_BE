import {TaskState} from "../constants";
import {IdentityInterface} from "../generic/Identity.interface";

export interface TaskDatabaseModel {
    projectId: number,
    name: string,
    content: string,
    state: TaskState,
    priority: number,
}

export interface TaskModel extends IdentityInterface, TaskDatabaseModel {
}

export interface Tasks {
    [key: number]: TaskModel;
}