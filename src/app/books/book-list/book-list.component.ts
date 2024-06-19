import { Component, inject, signal, OnInit } from '@angular/core';
import { BookStoreService } from '../../shared/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { finalize } from 'rxjs';
import { BookList } from '../../shared/book-list';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'bf-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [BookListItemComponent, AsyncPipe, ReactiveFormsModule, NgIf],
})
export class BookListComponent implements OnInit {
  private bookStoreService = inject(BookStoreService);
  private specialQuery = '';
  private title = '';
  private author = '';
  private isbn = '';
  private publishYear1 = '';
  private publishYear2 = '';
  private language = '';
  private subject = '';
  private publisher = '';
  private person = '';
  private place = '';
  private sort = '';
  sortOptions = [
    'rating desc',
    'rating asc',
    'old',
    'new',
    'title',
    'editions',
    'scans',
  ];

  books = signal<Partial<BookList>>({ docs: [] });
  //fields do not reset yet
  searchForm = new FormGroup({
    title: new FormControl(this.title),
    author: new FormControl(this.author),
    isbn: new FormControl(this.isbn),
    publishYear1: new FormControl(this.publishYear1),
    publishYear2: new FormControl({
      value: this.publishYear2,
      disabled: true,
    }),
    language: new FormControl(this.language),
    subject: new FormControl(this.subject),
    publisher: new FormControl(this.publisher),
    person: new FormControl(this.person),
    place: new FormControl(this.place),
    sort: new FormControl(this.sortOptions[0]),
  });

  isLoading = signal(false);

  ngOnInit() {
    this.isLoading.set(true);

    this.bookStoreService
      .getInitial()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((books) => {
        this.books.set(books);
      });

    this.searchForm.get('publishYear1')?.valueChanges.subscribe((value) => {
      if (value) {
        this.searchForm.get('publishYear2')?.enable();
      } else {
        this.searchForm.get('publishYear2')?.disable();
        this.searchForm.get('publishYear2')?.reset();
      }
    });
  }

  onSubmit() {
    if (this.searchForm.value.title) {
      this.title = this.searchForm.value.title.trim();
    }
    if (this.searchForm.value.author) {
      this.author = this.searchForm.value.author.trim();
    }
    if (this.searchForm.value.isbn) {
      this.isbn = this.searchForm.value.isbn.trim();
    }
    if (
      this.searchForm.value.publishYear1 &&
      this.searchForm.value.publishYear2
    ) {
      this.specialQuery = `first_publish_year%3A[${this.searchForm.value.publishYear1.trim()} TO ${this.searchForm.value.publishYear2.trim()}]`;
    } else if (this.searchForm.value.publishYear1) {
      this.specialQuery = `first_publish_year%3A${this.searchForm.value.publishYear1.trim()}`;
    }
    if (this.searchForm.value.language) {
      this.language = this.searchForm.value.language.trim();
      if (this.specialQuery) {
        this.specialQuery += `+language%3A${this.language}`;
      } else {
        this.specialQuery = `language%3A${this.language}`;
      }
    }
    if (this.searchForm.value.subject) {
      this.subject = this.searchForm.value.subject.trim();
    }
    if (this.searchForm.value.publisher) {
      this.publisher = this.searchForm.value.publisher.trim();
    }
    if (this.searchForm.value.person) {
      this.person = this.searchForm.value.person.trim();
    }
    if (this.searchForm.value.place) {
      this.place = this.searchForm.value.place.trim();
    }
    this.sort = this.searchForm.value.sort ?? this.sortOptions[0];
    if (!this.specialQuery) {
      this.specialQuery = '*';
    }
    this.isLoading.set(true);
    this.bookStoreService
      .searchBooks(
        this.specialQuery,
        this.title,
        this.author,
        this.isbn,
        this.subject,
        this.publisher,
        this.person,
        this.place,
        this.sort
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((books) => {
        this.books.set(books);
      });
  }
}
