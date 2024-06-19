import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { BookList } from './book-list';

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
  searchBooks(
    specialQuery: string,
    title: string,
    author: string,
    isbn: string,
    subject: string,
    publisher: string,
    person: string,
    place: string,
    sort: string
  ): Observable<BookList> {
    return this.http
      .get<BookList>(
        `${this.apiUrl}/search.json?q=${specialQuery}&title='${title}'&author='${author}'&isbn=${isbn}&subject='${subject}'&publisher='${publisher}'&person='${person}'&place='${place}'&sort=${sort}`
      )
      .pipe(
        catchError((err) => {
          console.error(err);
          return of({} as BookList);
        })
      );
  }
}
