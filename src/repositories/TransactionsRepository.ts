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
    const transactions = await this.find();

    const income = transactions.reduce((accIn, { type, value }) => {
      return type === 'income' ? accIn + value : accIn + 0;
    }, 0);

    const outcome = transactions.reduce((accOut, { type, value }) => {
      return type === 'outcome' ? accOut + value : accOut + 0;
    }, 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
