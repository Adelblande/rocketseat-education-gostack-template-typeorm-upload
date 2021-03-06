import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionRepository.getBalance();
  const transactions = await transactionRepository.find({
    select: ['id', 'title', 'type', 'value', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  const objreturn = {
    transactions,
    balance,
  };

  return response.json(objreturn);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  const transaction = await deleteTransaction.execute({ id });

  return response.status(204).json(transaction);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(file);
    return response.json(transactions);
  },
);

export default transactionsRouter;
