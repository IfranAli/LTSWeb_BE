import { Response } from "express";

export const respondError = (res: Response, value: any) => {
  return res.status(500).send(value);
};

export const respondOk = (res: Response, value: any) => {
  return res.status(200).send(value);
};

export const respondUnauthorized = (res: Response, value: any) => {
  return res.status(401).send(value);
};

export const respondServerError = (res: Response, error: unknown) => {
  console.error("Server Error:", error);

  return res.status(500).send({
    message: "Internal Server Error",
    error: error instanceof Error ? error.message : "Unknown error",
  });
};
