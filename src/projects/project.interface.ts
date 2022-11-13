import {Tasks} from "../tasks/task.interface";

export interface ProjectModel {
    id: number;
    title: string;
    tasks: Tasks;
}

export interface Projects {
    [key: number]: ProjectModel;
}
