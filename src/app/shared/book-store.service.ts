import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { BookList } from './book-list';
import { BookDetails } from './book-details';
import { Author } from './author';
import { BookFilters } from './book-filters';
@Injectable({
  providedIn: 'root',
})
export class BookStoreService {
  private apiUrl = 'https://openlibrary.org';
  constructor(private http: HttpClient) {}

  getInitial(): Observable<BookList> {
    return this.http
      .get<BookList>(`${this.apiUrl}/search.json?q=*&limit=10&sort=rating`)
      .pipe(
        catchError((err) => {
          console.error(err);
          return of({} as BookList);
        })
      );
  }
  searchBooks(bookFilter: BookFilters): Observable<BookList> {
    return this.http
      .get<BookList>(
        `${this.apiUrl}/search.json?q=${bookFilter.specialQuery}&title='${bookFilter.title}'&author='${bookFilter.author}
        '&isbn=${bookFilter.isbn}&subject='${bookFilter.subject}'&publisher='${bookFilter.publisher}'
        &person='${bookFilter.person}'&place='${bookFilter.place}'
        &sort=${bookFilter.sort}&limit=${bookFilter.limit}&page=${bookFilter.page}`
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return of({} as BookList);
        })
      );
  }
}
