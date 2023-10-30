import express, { NextFunction, Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { AppDataSource } from "..";
import { CalendarEvent } from "../typeorm/entities/CalendarEvent";
import { CalendarEventViewModel } from "./calendar.models";
import { dateToString } from "../finance/finance.util";

const router = express.Router();

const toViewModel = (entity: CalendarEvent) => {
  const r: CalendarEventViewModel = {
    id: entity.id,
    title: entity.title,
    date: entity.date ? dateToString(entity.date) : "",
    time: entity.time,
  };

  return r;
};

router.get(
  "/",
  isAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const calendarRepo = AppDataSource.getRepository(CalendarEvent);
    calendarRepo
      .findBy({ userId: req.userData?.id })
      .then((value) => {
        const eventsVM = value.map((v) => toViewModel(v));
        respondOk(res, eventsVM);
      })
      .catch((err) => respondError(res, err));
  }
);

// POST calendar/:id
router.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const calendarRepo = AppDataSource.getRepository(CalendarEvent);
    const userId = req.userData?.id ?? null;

    if (!userId) {
      return respondError(res, "Could not authenticate user");
    }

    const eventEntity = new CalendarEvent();
    eventEntity.title = body.title;
    eventEntity.date = body.date;
    eventEntity.time = body.time;
    eventEntity.userId = userId;

    calendarRepo
      .save(eventEntity)
      .then((value) => {
        return calendarRepo
          .findOneByOrFail({ id: value.id })
          .then((value) => respondOk(res, toViewModel(value)));
      })
      .catch((err) => respondError(res, err));
  }
);

router.put(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const calendarRepo = AppDataSource.getRepository(CalendarEvent);

    calendarRepo
      .findOneByOrFail({
        id: parseInt(req.params.id, 10),
      })
      .then((entity) => {
        entity.title = body.title;
        entity.date = body.date;
        entity.time = body.time;

        return calendarRepo.save(entity).then((value) => {
          return calendarRepo
            .findOneByOrFail({ id: value.id })
            .then((value) => respondOk(res, toViewModel(value)));
        });
      })
      .catch((err) => respondError(res, err));
  }
);

router.delete(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const calendarRepo = AppDataSource.getRepository(CalendarEvent);

    calendarRepo
      .findOneByOrFail({
        id: parseInt(req.params.id, 10),
      })
      .then((entity) => {
        return calendarRepo
          .remove(entity)
          .then((value) => respondOk(res, value));
      })
      .catch((err) => respondError(res, err));
  }
);

export { router as calendarRouter };
