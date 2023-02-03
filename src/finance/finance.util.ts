import {FinanceModel} from "./finance.interface";

export const dateToString = function (date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');

    return y + '/' + m + '/' + d;
}

export interface IFinanceRange {
    dateFrom: string,
    dateTo: string,
    values: Partial<FinanceModel>[],
}

export interface IHasDate {
    date?: Date
}

export const resolveDatesToString = (d: any): any => {
    return {...d, date: dateToString(d.date)}
}

