import { FinanceCategoryModel, FinanceModel } from "./finance.interface";

export interface IKeyValue<T> {
  [id: number]: T;
}

export const isValidDateObject = (date: Date) => {
  return date instanceof Date && isFinite(date.getTime());
};

export const dateToString = function (date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");

  return y + "/" + m + "/" + d;
};

export const resolveDatesToString = (d: any): any => {
  return { ...d, date: dateToString(d.date) };
};

export const getFinanceSummary = (
  items: FinanceModel[],
  categories: FinanceCategoryModel[]
) => {
  const byCategories: IKeyValue<FinanceModel[]> = items.reduce<
    IKeyValue<FinanceModel[]>
  >((p, c) => {
    const type = c.categoryType;
    const x = p[type];

    if (x) {
      p[type] = [...p[type], c];
    } else {
      p[type] = [c];
    }

    return p;
  }, {});

  const categoryNameMap = categories.reduce<IKeyValue<string>>((p, c) => {
    p[c.id] = c.type;
    return p;
  }, {});

  const categoryResults = Object.keys(byCategories).map((key) => {
    const idx = parseInt(key);
    const sum = byCategories[idx].reduce((p, c) => p + c.amount, 0);
    const categoryName = categoryNameMap[idx];
    const items: Partial<FinanceModel>[] = byCategories[idx];

    return {
      total: sum.toFixed(2),
      categoryName: categoryName,
      items: items,
    };
  });

  return categoryResults;
};
