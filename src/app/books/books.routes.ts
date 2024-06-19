import { Routes } from '@angular/router';
import { BookDetailsComponent } from './book-details/book-details.component';
import { BookListComponent } from './book-list/book-list.component';

export const BOOKS_ROUTES: Routes = [
  {
    path: '',
    component: BookListComponent,
  },
  {
    path: ':key',
    component: BookDetailsComponent,
  },
];
