import {IdentityInterface} from "../generic/Identity.interface";

export interface FinanceDatabaseModel {
    id: number,
    name: string,
    date: string,
    amount: number,
    categoryType: number,
}

export interface FinanceModel extends IdentityInterface, FinanceDatabaseModel {
}

export const FinanceModelInvalid: FinanceModel = {
    id: -1,
    name: '',
    date: '',
    amount: 0,
    categoryType: 0,
}

export function isValidFinance(finance: FinanceModel): boolean {
    return finance.id >= 0
}

export interface FinanceCategoryModel extends IdentityInterface {
    type: string
}