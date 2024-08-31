import express, { NextFunction, Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { ResponseMessage } from "../generic/ResponseMessage.interface";
import { Project } from "../typeorm/entities/Project";
import { Task } from "../typeorm/entities/Task";
import { AppDataSource } from "../typeorm/data-source";

const router = express.Router();

// GET projects/
router.get(
  "/",
  isAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const projectRepository = AppDataSource.getRepository(Project);
    projectRepository
      .findBy({ userId: req.userData?.id })
      .then((value) => respondOk(res, value))
      .catch((err) => respondError(res, err));
  }
);

// CREATE projects/
router.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const projectRepository = AppDataSource.getRepository(Project);

    const newProject = projectRepository.create({
      title: body.title,
      description: body.description,
      colour: body.colour,
      priority: body.priority,
      code: body.code,
      enabled: body.enabled,
      userId: req.userData?.id,
    });

    projectRepository.save(newProject).then((value) => {
      return projectRepository
        .findOneOrFail({
          where: { id: value.id },
        })
        .then((value) => respondOk(res, value));
    });
  }
);

// GET projects/:id
router.get(
  "/:id",
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

// PUT projects/:id
router.put(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    body.id = parseInt(req.params.id, 10);

    const projectRepository = AppDataSource.getRepository(Project);
    projectRepository
      .findOneOrFail({
        where: { id: body.id },
      })
      .then((project) => {
        project.title = body.name;
        project.description = body.description;
        project.colour = body.colour;
        project.priority = body.priority;
        project.code = body.code;
        project.enabled = body.enabled;

        projectRepository.save(project).then((value) => {
          return projectRepository
            .findOneOrFail({
              where: { id: value.id },
            })
            .then((value) => respondOk(res, value));
        });
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

// DELETE projects/:id
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const id: number = parseInt(req.params.id, 10);

  const projectRepository = AppDataSource.getRepository(Project);
  projectRepository
    .findOneOrFail({
      where: { id: id },
    })
    .then((project) => {
      projectRepository.remove(project).then(() => {
        const responseMessage: ResponseMessage = {
          message: "Project deleted",
          success: true,
        };
        return respondOk(res, responseMessage);
      });
    });
});

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

export { router as projectsRouter };
