import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookList } from './book-list';

@Injectable({
  providedIn: 'root',
})
export class BookStoreService {
  private apiUrl = 'https://openlibrary.org';
  constructor(private http: HttpClient) {}

  getAll(): Observable<BookList> {
    return this.http.get<BookList>(`${this.apiUrl}/search.json?q=javascript`);
  }
}
