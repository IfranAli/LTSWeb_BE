import { AppDataSource } from "../typeorm/data-source";

export async function runRawSqlQuery<T, P extends unknown[]>(
  query: string,
  parameters?: P
): Promise<T[]> {
  try {
    return await AppDataSource.query(query, parameters);
  } catch (error) {
    console.error("Error in runRawSqlQuery:", error);
    throw error;
  }
}
