import {Tasks} from "../tasks/task.interface";
import {IdentityInterface} from "../generic/Identity.interface";

export interface ProjectDatabaseModel {
    title: string,
    description: string
    code: string
    colour: string
    priority: number
}

export interface ProjectModel extends IdentityInterface, ProjectDatabaseModel {
    tasks: Tasks;
}

export interface Projects {
    [key: number]: ProjectModel;
}
