import {TaskState} from "../constants";

export interface TaskModel {
    id: number;
    projectID: number;
    title: string;
    content: string;
    state: TaskState;
}

export interface Tasks {
    [key: number]: TaskModel;
}