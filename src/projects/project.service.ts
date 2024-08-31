import { Repository } from "typeorm";
import { Project } from "../typeorm/entities/Project";

export class ProjectService {
  constructor(private projectRepository: Repository<Project>) {}

  async getAllProjectsForUser(userId: number): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.findBy({ userId: userId });
      return projects;
    } catch (error) {
      console.error("Error in getAllProjects: ", error);
      return Promise.reject(error as Error);
    }
  }

  async createProjectForUser(
    userId: number,
    data: Partial<Project>
  ): Promise<Project> {
    try {
      const params: Partial<Project> = {
        title: data.title ?? "",
        description: data.description ?? "",
        colour: data.colour ?? "",
        priority: data.priority ?? 0,
        code: data.code ?? "",
        enabled: data.enabled ?? 1,
        userId: userId ?? 0,
      };

      // title and body are required
      if (!params.title || !params.description) {
        throw new Error("Title and description are required");
      }

      const project = this.projectRepository.save(params);
      return project;
    } catch (error) {
      console.error("Error in createProjectForUser: ", error);
      return Promise.reject(error as Error);
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOneOrFail({
        where: { id },
        relations: ["tasks"],
      });

      return project;
    } catch (error) {
      console.error("Error in getProjectById: ", error);
      return Promise.reject(error as Error);
    }
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    try {
      const project = await this.projectRepository.findOneOrFail({
        where: { id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      Object.assign(project, data);
      return this.projectRepository.save(project);
    } catch (error) {
      console.error("Error in updateProject: ", error);
      return Promise.reject(error as Error);
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      const project = await this.projectRepository.findOneOrFail({
        where: { id },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      await this.projectRepository.delete(project);
    } catch (error) {
      console.error("Error in deleteProject: ", error);
      return Promise.reject(error as Error);
    }
  }
}
