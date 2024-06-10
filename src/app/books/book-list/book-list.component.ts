import { Component } from '@angular/core';
import { BookStoreService } from '../../shared/book-store.service';
import { Book } from '../../shared/book';
import { BookList } from '../../shared/book-list';

@Component({
  selector: 'bf-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent {
  books: BookList = {
    numFound: 0,
    start: 0,
    numFoundExact: false,
    docs: [],
    num_found: 0,
    q: '',
    offset: 0,
  };

  constructor(private service: BookStoreService) {
    this.service.getAll().subscribe((books: BookList) => {
      this.books = books;
      console.log(this.books.docs);
    });
  }
}
