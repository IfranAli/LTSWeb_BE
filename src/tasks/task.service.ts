import {CrudService} from "../generic/crud.service";
import {TaskModel} from "./task.interface";

class TasksService extends CrudService<TaskModel> {
    constructor() {
        super('Notes');
    }
}

export const tasksService = new TasksService();