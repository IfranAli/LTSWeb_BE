import express, { Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { ResponseMessage } from "../generic/ResponseMessage.interface";
import { isAuthenticated } from "../user/user.router";
import { Task } from "../typeorm/entities/Task";
import { AppDataSource } from "../typeorm/data-source";

const router = express.Router();

// GET tasks/:id
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  const taskRepository = AppDataSource.getRepository(Task);
  taskRepository
    .findOneOrFail({
      where: { id: id },
    })
    .then((task) => {
      respondOk(res, task);
    })
    .catch((err) => {
      respondError(res, err);
    });
});

// DELETE tasks/:id
router.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  const taskRepository = AppDataSource.getRepository(Task);
  taskRepository
    .findOneOrFail({
      where: { id: id },
    })
    .then((task) => {
      taskRepository.remove(task).then((_) => {
        const responseMessage: ResponseMessage = {
          success: true,
          message: "",
        };
        respondOk(res, responseMessage);
      });
    })
    .catch((err) => {
      respondError(res, err);
    });
});

// PUT tasks/:id
router.put("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const body = req.body;
  const id = parseInt(req.params.id, 10);

  const taskRepository = AppDataSource.getRepository(Task);
  taskRepository
    .findOneOrFail({
      where: { id: id },
    })
    .then((task) => {
      task.name = body.name;
      task.content = body.content;
      task.priority = body.priority;
      task.projectId = body.projectId;
      task.state = body.state;

      taskRepository.save(task).then((value) => {
        taskRepository
          .findOneOrFail({
            where: { id: id },
          })
          .then((value) => {
            respondOk(res, value);
          });
      });
    });
});

export { router as tasksRouter };
