import { createReadStream, promises } from 'fs';
import csv from 'csv-parse';

import { getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Request {
  filepath: string;
}

class ImportTransactionsService {
  async execute({ filepath }: Request): Promise<Transaction[]> {
    const contactsReadStream = createReadStream(filepath);
    const categoryRepository = getCustomRepository(CategoriesRepository);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const parseCSV = contactsReadStream.pipe(
      csv({
        from_line: 2,
        trim: true,
        skip_empty_lines: true,
      }),
    );

    const categories: string[] = [];
    const transactions: CSVTransaction[] = [];
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existingCategories = await categoryRepository.find({
      where: { title: In(categories.map(category => category)) },
    });

    const existingCategoriesTitle = existingCategories.map(item => item.title);
    const newCategories = categories
      .filter(category => !existingCategoriesTitle.includes(category))
      .filter((val, key, self) => self.indexOf(val) === key);

    const addCategories = categoryRepository.create(
      newCategories.map(title => ({ title })),
    );

    await categoryRepository.save(addCategories);

    const allCategories = [...addCategories, ...existingCategories];

    const newTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(newTransactions);

    await promises.unlink(filepath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
