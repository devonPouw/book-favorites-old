import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./books/books.routes').then((m) => m.BOOKS_ROUTES),
  },
];
