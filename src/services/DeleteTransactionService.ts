import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const transactions = await transactionsRepository.findOne(id);
    if (!transactions) {
      throw new AppError('Transaction not found');
    }

    await transactionsRepository.delete(transactions.id);
  }
}

export default DeleteTransactionService;
