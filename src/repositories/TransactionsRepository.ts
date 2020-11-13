import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.createQueryBuilder('transaction').getMany();

    const { income, outcome } = transactions.reduce(
      (acm: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            acm.income += transaction.value;
            break;
          case 'outcome':
            acm.outcome += transaction.value;
            break;
          default:
            break;
        }

        return acm;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
