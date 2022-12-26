import {ProjectModel} from "./project.interface";
import {CrudService} from "../generic/crud.service";
import {TaskModel} from "../tasks/task.interface";

const safeFields: Array<keyof ProjectModel> = [
    "id",
    "title",
    "description",
    "code",
    "colour",
    "priority",
];

class ProjectsService extends CrudService<ProjectModel> {
    constructor() {
        super('Projects', safeFields);
    }

    public getTasksByProjectID = async (projectID: number): (Promise<TaskModel[]>) => {
        const sql = 'SELECT * FROM Tasks WHERE ProjectID=(?)'
        return CrudService.makeRequest(sql, [projectID]);
    }
}

export const projectsService = new ProjectsService();