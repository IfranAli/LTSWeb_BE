import express, { NextFunction, Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { ProjectModel } from "./project.interface";
import { isAuthenticated } from "../user/user.router";
import { ResponseMessage } from "../generic/ResponseMessage.interface";
import { AppDataSource } from "..";
import { Project } from "../typeorm/entities/Project";

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

    req.services.projectService
      .create(body)
      .then((value) => respondOk(res, value))
      .catch((err) => respondError(res, err));
  }
);

// GET projects/:id
router.get(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    req.services.projectService
      .find(id)
      .then(async (resultArray) => {
        const project = resultArray.shift()!;
        let projectWithTasks: Partial<ProjectModel> = {
          ...project,
          tasks: await req.services.projectService.getTasksByProjectID(
            project.id
          ),
        };
        return respondOk(res, projectWithTasks);
      })
      .catch((err) => respondError(res, err));
  }
);

// PUT projects/:id
router.put(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    body.id = parseInt(req.params.id, 10);

    req.services.projectService
      .update(body)
      .then((value) => respondOk(res, value))
      .catch((err) => respondError(res, err));
  }
);

// POST projects/:id
router.post(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const id: number = parseInt(req.params.id, 10);

    req.services.taskService
      .create(body)
      .then((value) => respondOk(res, value))
      .catch((err) => respondError(res, err));
  }
);

// DELETE projects/:id
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const id: number = parseInt(req.params.id, 10);

  req.services.projectService
    .delete(id)
    .then((_) => {
      const responseMessage: ResponseMessage = {
        success: true,
        message: "",
      };
      respondOk(res, responseMessage);
    })
    .catch((err) => {
      respondError(res, err);
    });
});

// GET projects/:id/tasks
router.get(
  "/:id/tasks",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    req.services.projectService
      .getTasksByProjectID(id)
      .then((value) => respondOk(res, value))
      .catch((err) => respondError(res, err));
  }
);

export { router as projectsRouter };
