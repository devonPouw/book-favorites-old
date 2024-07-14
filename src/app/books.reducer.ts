// books.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as BookActions from './books.actions';
import { initialState, BooksState } from './books.state';

export const booksReducer = createReducer<BooksState>(
  initialState,
  on(BookActions.loadBooks, (state) => ({
    ...state,
    isLoading: true,
    books: [],
    resultsLength: 0,
  })),
  on(BookActions.loadBooksSuccess, (state, { books, resultsLength }) => ({
    ...state,
    books,
    resultsLength,
    isLoading: false,
  })),
  on(BookActions.loadBooksFailure, (state) => ({
    ...state,
    isLoading: false,
    books: [],
    resultsLength: 0,
  })),
  on(BookActions.updateSearchParams, (state, { searchParams }) => ({
    ...state,
    searchParams,
  }))
);
