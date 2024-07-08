import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { BookList } from '../models/book-list';
import { BookDetails } from '../models/book-details';
import { Author } from '../models/author';
import { BookFilter } from '../models/book-filter';
@Injectable({
  providedIn: 'root',
})
export class BookStoreService {
  private apiUrl = 'https://openlibrary.org';
  constructor(private http: HttpClient) {}

  getInitial(): Observable<BookList> {
    return this.http
      .get<BookList>(`${this.apiUrl}/search.json?q=*&limit=5&sort=rating`)
      .pipe(
        catchError((err) => {
          console.error(err);
          return of({} as BookList);
        })
      );
  }
  searchBooks(bookFilter: BookFilter): Observable<BookList> {
    return this.http
      .get<BookList>(
        `${this.apiUrl}/search.json?q=${bookFilter.specialQuery}&title='${bookFilter.title}'
        &author='${bookFilter.author}'&isbn=${bookFilter.isbn}&subject='${bookFilter.subject}'&publisher='${bookFilter.publisher}'
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
  getSingle(key: string): Observable<BookDetails> {
    return this.http.get<BookDetails>(`${this.apiUrl}/works/${key}.json`);
  }
  getAuthors(authorKey: string): Observable<Author> {
    return this.http.get<Author>(`${this.apiUrl}${authorKey}.json`);
  }
}
