import {CrudService} from "../generic/crud.service";
import {TaskModel} from "./task.interface";
import {Pool} from "mariadb";

const safeFields: Array<keyof TaskModel> = [
    "projectId",
    "name",
    "content",
    "state",
    "priority"
];

export class TasksService extends CrudService<TaskModel> {
    constructor(pool: Pool) {
        super(pool, 'Tasks', safeFields);
    }
}
