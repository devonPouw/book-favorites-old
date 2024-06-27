import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { BookStoreService } from '../../shared/book-store.service';
import { Author } from '../../shared/author';

@Component({
  selector: 'bf-book-details',
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
})
export class BookDetailsComponent {
  private service = inject(BookStoreService);
  key = input.required<string>();
  book$ = toObservable(this.key).pipe(
    switchMap((isbn) => this.service.getSingle(isbn))
  );
  authors$: Observable<Author[]> = this.book$.pipe(
    switchMap((book) => {
      return book.authors
        ? forkJoin(
            book.authors.map((author) =>
              this.service.getAuthors(author.author.key)
            )
          )
        : of([]);
    }),
    map((authors: Author[]) => authors.flat())
  );
}
