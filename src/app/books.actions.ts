// books.actions.ts
import { createAction, props } from '@ngrx/store';
import { Book } from './books/models/book';
import { BookFilter } from './books/models/book-filter';

export const loadBooks = createAction('[Book List] Load Books');
export const loadBooksSuccess = createAction(
  '[Book List] Load Books Success',
  props<{ books: Book[]; resultsLength: number }>()
);
export const loadBooksFailure = createAction('[Book List] Load Books Failure');
export const updateSearchParams = createAction(
  '[Book List] Update Search Params',
  props<{ searchParams: BookFilter }>()
);
