import { Book } from './book';

export interface BookList {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Book[];
  num_found: number;
  q: string;
  offset: number;
}
