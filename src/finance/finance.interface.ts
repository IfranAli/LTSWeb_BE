import {IdentityInterface} from "../generic/Identity.interface";

export interface FinanceDatabaseModel {
    id: number,
    name: string,
    date: string,
    amount: number,
    type: number,
}

export interface FinanceModel extends IdentityInterface, FinanceDatabaseModel {
}

export const FinanceModelInvalid: FinanceModel = {
    id: -1,
    name: '',
    date: '',
    amount: 0,
    type: 0,
}

export function isValidFinance(finance: FinanceModel): boolean {
    return finance.id >= 0
}
