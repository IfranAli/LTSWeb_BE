import express, { NextFunction, Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { Project } from "../typeorm/entities/Project";
import { Task } from "../typeorm/entities/Task";
import { AppDataSource } from "../typeorm/data-source";
import { ProjectService } from "./project.service";

const router = express.Router();

const projectService = new ProjectService(AppDataSource.getRepository(Project));

// GET projects/
router.get("/", isAuthenticated, (req: Request, res: Response) => {
  projectService
    .getAllProjectsForUser(req.userData?.id)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// CREATE projects/
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  projectService
    .createProjectForUser(req.userData?.id, req.body)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// GET projects/:id
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  projectService
    .getProjectById(id)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// PUT projects/:id
router.put("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const body = req.body;
  const id = parseInt(req.params.id, 10);

  projectService
    .updateProject(id, {
      title: body.name,
      description: body.description,
      colour: body.colour,
      priority: body.priority,
      code: body.code,
      enabled: body.enabled,
    })
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// DELETE projects/:id
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const id: number = parseInt(req.params.id, 10);

  projectService
    .deleteProject(id)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

//#region Project task related routes

// GET projects/:id/tasks
router.get(
  "/:id/tasks",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);

    const projectRepository = AppDataSource.getRepository(Project);
    projectRepository
      .findOneOrFail({
        where: { id: id },
        relations: ["tasks"],
      })
      .then((project) => {
        return respondOk(res, project.tasks);
      });
  }
);

// POST projects/:id
router.post(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const id: number = parseInt(req.params.id, 10);

    const projectRepository = AppDataSource.getRepository(Project);
    projectRepository
      .findOneOrFail({
        where: { id: id },
      })
      .then((project) => {
        const taskRepository = AppDataSource.getRepository(Task);

        const newTask = taskRepository.create({
          name: body.name,
          content: body.content,
          priority: body.priority,
          projectId: project.id,
          state: 0,
        });

        taskRepository.save(newTask).then((value) => {
          return taskRepository
            .findOneOrFail({
              where: { id: value.id },
            })
            .then((value) => respondOk(res, value));
        });
      });
  }
);

//#endregion

export { router as projectsRouter };
