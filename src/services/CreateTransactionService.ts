import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Saldo insuficiente para completar esta transação.');
    }

    const categoryRepository = getRepository(Category);
    let categ = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categ) {
      const newCategory = categoryRepository.create({ title: category });
      categ = await categoryRepository.save(newCategory);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categ.id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
