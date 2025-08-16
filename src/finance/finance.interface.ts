import { IdentityInterface } from "../generic/Identity.interface";

export interface FinanceDatabaseModel {
  id: number;
  accountId: number;
  name: string;
  date: string;
  amount: number;
  categoryType: number;
}

export interface FinanceModel extends IdentityInterface, FinanceDatabaseModel {}
export interface FinanceCategoryModel extends IdentityInterface {
  id: number;
  type: string;
  colour: string;
}

export interface FinanceCategoryMatchResult {
  category: FinanceCategoryModel;
  matches: number;
}
