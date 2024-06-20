import { Book } from './book';

export interface BookList {
  numFound: number;
  start: number;
  docs: Book[];
  offset: number;
}
