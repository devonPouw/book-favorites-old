import { Book } from './books/models/book';
import { BookFilter } from './books/models/book-filter';

// books.state.ts
export interface BooksState {
  books: Book[];
  resultsLength: number;
  isLoading: boolean;
  searchParams: BookFilter;
}

export const initialState: BooksState = {
  books: [],
  resultsLength: 0,
  isLoading: false,
  searchParams: {
    title: '',
    specialQuery: '',
    author: '',
    isbn: '',
    subject: '',
    publisher: '',
    place: '',
    person: '',
    sort: '',
    order: '',
    limit: 0,
    page: 0,
  },
};
