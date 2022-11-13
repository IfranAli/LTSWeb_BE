import {ProjectModel} from "./project.interface";
import {CrudService} from "../generic/crud.service";

class ProjectsService extends CrudService<ProjectModel> {
    constructor() {
        super('Projects');
    }
}

export const projectsService = new ProjectsService();