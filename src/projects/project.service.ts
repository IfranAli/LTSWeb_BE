import {ProjectModel} from "./project.interface";
import {CrudService} from "../generic/crud.service";
import {TaskModel} from "../tasks/task.interface";
import {Pool} from "mariadb";

const safeFields: Array<keyof ProjectModel> = [
    "id",
    "title",
    "description",
    "code",
    "colour",
    "priority",
    "enabled",
];

export class ProjectsService extends CrudService<ProjectModel> {
    constructor(pool: Pool) {
        super(pool, 'Projects', safeFields);
    }

    public getTasksByProjectID = async (projectID: number): (Promise<TaskModel[]>) => {
        const sql = 'SELECT * FROM Tasks WHERE ProjectID=(?)'
        return CrudService.makeRequest(sql, [projectID]);
    }
}
