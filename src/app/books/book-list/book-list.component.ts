import { Component, inject, OnInit } from '@angular/core';
import { BookStoreService } from '../../shared/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { Observable } from 'rxjs';
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
  private language = '';
  sortOptions = [
    'rating desc',
    'rating asc',
    'old',
    'new',
    'title',
    'editions',
    'scans',
  ];

  books$: Observable<BookList> = this.bookStoreService.getInitial();

  searchForm = new FormGroup({
    title: new FormControl(''),
    author: new FormControl(''),
    isbn: new FormControl(''),
    publishYear1: new FormControl(''),
    publishYear2: new FormControl({
      value: '',
      disabled: true,
    }),
    language: new FormControl(''),
    subject: new FormControl(''),
    publisher: new FormControl(''),
    person: new FormControl(''),
    place: new FormControl(''),
    sort: new FormControl(this.sortOptions[0]),
  });

  ngOnInit() {
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
    if (
      this.searchForm.value.publishYear1 &&
      this.searchForm.value.publishYear2
    ) {
      this.specialQuery = `first_publish_year%3A[${this.searchForm.value.publishYear1.trim()} TO ${this.searchForm.value.publishYear2.trim()}]`;
    } else if (this.searchForm.value.publishYear1) {
      this.specialQuery = `first_publish_year%3A${this.searchForm.value.publishYear1.trim()}`;
    } else {
      this.specialQuery = '';
    }
    if (this.searchForm.value.language) {
      this.language = this.searchForm.value.language.trim();
      if (this.specialQuery) {
        this.specialQuery += `+language%3A${this.language}`;
      } else {
        this.specialQuery = `language%3A${this.language}`;
      }
    }
    if (!this.specialQuery) {
      this.specialQuery = '*';
    }

    this.books$ = this.bookStoreService.searchBooks(
      this.specialQuery,
      this.searchForm.value.title?.trim() ?? '',
      this.searchForm.value.author?.trim() ?? '',
      this.searchForm.value.isbn?.trim() ?? '',
      this.searchForm.value.subject?.trim() ?? '',
      this.searchForm.value.publisher?.trim() ?? '',
      this.searchForm.value.person?.trim() ?? '',
      this.searchForm.value.place?.trim() ?? '',
      this.searchForm.value.sort ?? this.sortOptions[0]
    );
  }
}
