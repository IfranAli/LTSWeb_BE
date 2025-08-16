import { runRawSqlQuery } from "../db/db-util";
import { Finance } from "../typeorm/entities/Finance";

export async function searchFinancesByName(
  accountId: number,
  name: string
): Promise<Finance[]> {
  try {
    const pName = name.trim().toLowerCase();
    const query = `
        SELECT * FROM finance
        WHERE accountId = ? AND name LIKE ?
        `;
    return await runRawSqlQuery<Finance, [number, string]>(query, [
      accountId,
      `%${pName}%`,
    ]);
  } catch (error) {
    console.error("Error in searchFinancesByName:", error);
    throw error;
  }
}
