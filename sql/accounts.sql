select * from ltswebdb.Finances
where Finances.accountId = 0
  and Finances.date > '2022-01-00 00:00:00'
  and Finances.date < '2023-00-00 00:00:00'
order by Finances.date asc