import {CrudService} from "../generic/crud.service";
import {TaskModel} from "./task.interface";

const safeFields: Array<keyof TaskModel> = [
    "projectId",
    "name",
    "content",
    "state",
    "priority"
];

class TasksService extends CrudService<TaskModel> {
    constructor() {
        super('Tasks', safeFields);
    }
}

export const tasksService = new TasksService();