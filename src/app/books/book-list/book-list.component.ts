import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { BookStoreService } from '../services/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { Subject } from 'rxjs';
import { BookList } from '../models/book-list';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BookSkeletonComponent } from '../book-skeleton/book-skeleton.component';
import {
  isbnValidator,
  IsbnValidatorDirective,
} from '../directives/isbn-validator.directive';

@Component({
  selector: 'bf-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [
    BookListItemComponent,
    BookSkeletonComponent,
    AsyncPipe,
    ReactiveFormsModule,
    NgIf,
    IsbnValidatorDirective,
  ],
})
export class BookListComponent implements OnInit {
  private bookStoreService = inject(BookStoreService);

  listContainer = viewChild<ElementRef>('listContainer');

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
  limitOptions = [10, 20, 50];
  currentPage = signal(1);
  searchForm = new FormGroup({
    title: new FormControl(''),
    author: new FormControl(''),
    isbn: new FormControl('', [isbnValidator()]),
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
    limit: new FormControl(this.limitOptions[0]),
  });

  get isbn() {
    return this.searchForm.get('isbn');
  }

  invalidIsbn() {
    return this.isbn?.invalid && this.isbn?.value;
  }

  searchTrigger$ = new Subject<void>();
  isLoading = signal(false);
  page = signal(1);
  books = signal<BookList | null>(null);

  totalPages = computed(() => {
    const currentBooks = this.books();
    const limit = this.searchForm.get('limit')?.value ?? 10;
    return currentBooks ? Math.ceil(currentBooks.numFound / limit) : 0;
  });

  visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const length = Math.min(totalPages, 10);
    const startIndex = Math.max(
      Math.min(this.page() - Math.ceil(length / 2), totalPages - length),
      0
    );
    return Array.from({ length }, (_, index) => index + startIndex + 1);
  });

  constructor() {
    effect(() => {
      this.bookStoreService.getInitial().subscribe({
        next: (books) => this.books.set(books),
        error: (err) => {
          console.error('Error fetching initial books:', err);
        },
      });
    });
  }

  ngOnInit() {
    this.searchForm.get('publishYear1')?.valueChanges.subscribe((value) => {
      if (value) {
        this.searchForm.get('publishYear2')?.enable();
      } else {
        this.searchForm.get('publishYear2')?.disable();
        this.searchForm.get('publishYear2')?.reset();
      }
      this.searchTrigger$.next();
    });
  }

  selectPage(page: number): void {
    this.isLoading.set(true);
    this.page.set(page);
    this.currentPage.set(page);
    this.triggerSearch();
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
    this.page.set(1);
    this.currentPage.set(1);
    this.isLoading.set(true);
    this.triggerSearch();
  }

  private triggerSearch(): void {
    if (!this.specialQuery) {
      this.specialQuery = '*';
    }
    this.listContainer()?.nativeElement.scrollIntoView();
    const bookFilter = {
      specialQuery: this.specialQuery,
      title: this.searchForm.value.title?.trim() ?? '',
      author: this.searchForm.value.author?.trim() ?? '',
      isbn: this.searchForm.value.isbn?.trim() ?? '',
      subject: this.searchForm.value.subject?.trim() ?? '',
      publisher: this.searchForm.value.publisher?.trim() ?? '',
      person: this.searchForm.value.person?.trim() ?? '',
      place: this.searchForm.value.place?.trim() ?? '',
      sort: this.searchForm.value.sort ?? this.sortOptions[0],
      limit: this.searchForm.value.limit ?? this.limitOptions[0],
      page: this.page(),
    };
    this.bookStoreService.searchBooks(bookFilter).subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error searching for books:', err);
      },
    });
  }

  clearForm() {
    this.searchForm.reset();
    this.searchForm.get('sort')?.setValue(this.sortOptions[0]);
    this.searchForm.get('limit')?.setValue(this.limitOptions[0]);
    this.searchForm.get('publishYear2')?.disable();
  }
}
