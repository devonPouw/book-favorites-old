import { Component, inject, signal } from '@angular/core';
import { BookStoreService } from '../../shared/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { Subject, debounceTime, finalize, switchMap, tap } from 'rxjs';
import { BookList } from '../../shared/book-list';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'bm-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [BookListItemComponent, AsyncPipe],
})
export class BookListComponent {
  private bookStoreService = inject(BookStoreService);

  books = signal<Partial<BookList>>({ docs: [] });
  private searchSubject$ = new Subject<string>();
  isLoading = signal(false);
  ngOnInit() {
    this.isLoading.set(true);

    this.bookStoreService
      .getInitial()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((books) => {
        this.books.set(books);
      });

    this.searchSubject$
      .pipe(
        debounceTime(400),
        tap(() => this.isLoading.set(true)),
        switchMap((query) => this.bookStoreService.searchBooks(query)),
        tap(() => this.isLoading.set(false))
      )
      .subscribe((books) => {
        this.books.set(books);
      });
  }

  onInputChange(event: Event) {
    this.searchSubject$.next((event.target as HTMLInputElement).value);
  }
}
