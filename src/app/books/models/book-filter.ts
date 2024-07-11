import { SortDirection } from '@angular/material/sort';

export interface BookFilter {
  specialQuery: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  publisher: string;
  place: string;
  person: string;
  sort: string;
  order: SortDirection;
  limit: number;
  page: number;
}
