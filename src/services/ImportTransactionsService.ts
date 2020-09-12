import { promises } from 'fs';
import parse from 'csv-parse/lib/sync';
import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

interface Request {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

interface Record {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(file: Request): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const stream = await promises.readFile(file.path, 'utf-8');
    const recordsCsv = parse(stream, {
      columns: true,
      ltrim: true,
      rtrim: true,
    });

    const categoriesBD = await categoryRepository.find();
    const existentCategory = categoriesBD.map(
      (category: Category) => category.title,
    );

    const categoriesCsv = recordsCsv.map((record: Record) => record.category);
    const newCategories = categoriesCsv
      .filter((categ: string) => !existentCategory.includes(categ))
      .filter(
        (value: string, index: number, self: string[]) =>
          self.indexOf(value) === index,
      );

    const categories = categoryRepository.create(
      newCategories.map((title: string) => ({ title })),
    );

    await categoryRepository.save(categories);
    const categoriesAll = [...categories, ...categoriesBD];

    const transactions = transactionRepository.create(
      recordsCsv.map(({ title, type, value, category }: Record) => ({
        title,
        type,
        value,
        category: categoriesAll.find(categ => categ.title === category),
      })),
    );

    transactionRepository.save(transactions);
    await promises.unlink(file.path);
    return transactions;
  }
}

export default ImportTransactionsService;
