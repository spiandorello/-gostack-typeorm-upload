import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Transaction> {}

export default CategoriesRepository;
