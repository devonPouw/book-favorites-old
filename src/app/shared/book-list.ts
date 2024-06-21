import { Book } from './book';

export interface BookList {
  numFound: number;
  docs: Book[];
  offset: number;
}
