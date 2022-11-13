import {Response} from "express";

export const respondError = (res: Response, value: any) => {
    return res.status(500).send(value);
}

export const respondOk = (res: Response, value: any) => {
    return res.status(200).send(value);
}
