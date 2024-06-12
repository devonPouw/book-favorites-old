import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { BookStoreService } from '../shared/book-store.service';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs';
import { BookList } from '../shared/book-list';

@Component({
  selector: 'bf-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  imports: [RouterLink, AsyncPipe],
  standalone: true,
})
export class SearchFilterComponent {
  private service = inject(BookStoreService);
  input$ = new Subject<string>();
  isLoading = signal(false);
  results$: Observable<BookList>;
  constructor() {
    this.results$ = this.input$.pipe(
      filter((term) => term.length >= 3),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.isLoading.set(true)),
      switchMap((term) => this.service.searchBooks(term)),
      tap(() => this.isLoading.set(false))
    );
  }
}
