import {ProjectModel} from "./project.interface";
import {CrudService} from "../generic/crud.service";

const safeFields: Array<keyof ProjectModel> = [
    "ID",
    "Title",
    "Description"
];

class ProjectsService extends CrudService<ProjectModel> {
    constructor() {
        super('Projects', safeFields);
    }
}

export const projectsService = new ProjectsService();