import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BookStoreService } from '../services/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { BookList } from '../models/book-list';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  isbnValidator,
  IsbnValidatorDirective,
} from '../directives/isbn-validator.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Select } from '../../shared/models/select';
import { ClearFormFieldComponent } from '../../shared/clear-form-field/clear-form-field.component';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'bf-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [
    BookListItemComponent,
    ClearFormFieldComponent,
    AsyncPipe,
    ReactiveFormsModule,
    DatePipe,
    IsbnValidatorDirective,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    RouterLink,
    NgIf,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent {
  private bookStoreService = inject(BookStoreService);

  listContainer = viewChild<ElementRef>('listContainer');

  resultsLength = 0;

  private specialQuery = '';
  private language = '';
  public sortOptions: Select[] = [
    { value: 'title', viewValue: 'Title (A-Z)' },
    { value: 'rating desc', viewValue: 'Rating (high to low)' },
    { value: 'rating asc', viewValue: 'Rating (low to high)' },
    { value: 'new', viewValue: 'Year (new to old)' },
    { value: 'old', viewValue: 'Year (old to new)' },
    { value: 'editions', viewValue: 'Editions' },
    { value: 'scans', viewValue: 'Scans' },
  ];

  pageSizeOptions = [25, 50, 100];
  currentPage = signal(1);
  searchForm = new FormGroup({
    title: new FormControl(''),
    author: new FormControl(''),
    isbn: new FormControl('', [isbnValidator()]),
    publishYear: new FormControl(''),
    language: new FormControl('', [Validators.minLength(3)]),
    subject: new FormControl(''),
    publisher: new FormControl(''),
    person: new FormControl(''),
    place: new FormControl(''),
    sort: new FormControl(this.sortOptions[0].value),
    limit: new FormControl(this.pageSizeOptions[0]),
  });

  get isbn() {
    return this.searchForm.get('isbn');
  }

  get limit() {
    return this.searchForm.get('limit');
  }
  get title() {
    return this.searchForm.get('title');
  }
  get author() {
    return this.searchForm.get('author');
  }
  get publishYear() {
    return this.searchForm.get('publishYear');
  }

  get place() {
    return this.searchForm.get('place');
  }
  get subject() {
    return this.searchForm.get('subject');
  }
  get publisher() {
    return this.searchForm.get('publisher');
  }
  get person() {
    return this.searchForm.get('person');
  }

  pageEvent: PageEvent = new PageEvent();

  handlePageEvent(e: PageEvent) {
    this.isLoading.set(true);
    this.pageEvent = e;
    this.limit?.setValue(e.pageSize);
    this.page.set(e.pageIndex + 1);
    this.triggerSearch();
  }

  isSearchButtonDisabled = () => {
    return this.isbn?.invalid && !!this.isbn?.value;
  };

  isLoading = signal(false);
  page = signal(1);
  books = signal<BookList | null>(null);
  totalPages = computed(() => {
    const currentBooks = this.books();
    const limit = this.searchForm.get('limit')?.value ?? 10;
    return currentBooks ? Math.ceil(currentBooks.numFound / limit) : 0;
  });
  displayedColumns: string[] = [
    'title',
    'rating',
    'year',
    'ebook_access',
    'ddc',
    'lcc',
    'more',
  ];

  constructor() {
    effect(() => {
      if (!this.specialQuery) {
        this.specialQuery = '*';
      }
      const bookFilter = {
        specialQuery: this.specialQuery,
        title: this.searchForm.value.title?.trim() ?? '',
        author: this.searchForm.value.author?.trim() ?? '',
        isbn: this.searchForm.value.isbn?.trim() ?? '',
        subject: this.searchForm.value.subject?.trim() ?? '',
        publisher: this.searchForm.value.publisher?.trim() ?? '',
        person: this.searchForm.value.person?.trim() ?? '',
        place: this.searchForm.value.place?.trim() ?? '',
        sort: this.searchForm.get('sort')?.value ?? 'title',
        limit: this.searchForm.value.limit ?? this.pageSizeOptions[0],
        page: this.page(),
      };
      this.bookStoreService.searchBooks(bookFilter).subscribe({
        next: (books) => this.books.set(books),
        error: (err) => {
          console.error('Error fetching initial books:', err);
        },
      });
    });
  }

  onSubmit() {
    if (this.searchForm.value.publishYear) {
      console.log(this.searchForm.value.publishYear);
      const publishYears = this.searchForm.value.publishYear.split('-');
      if (publishYears.length === 2) {
        this.specialQuery = `first_publish_year%3A[${publishYears[0]} TO ${publishYears[1]}]`;
      } else {
        this.specialQuery = `first_publish_year%3A${this.searchForm.value.publishYear}`;
      }
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
      sort: this.searchForm.get('sort')?.value ?? 'title',
      limit: this.searchForm.value.limit ?? this.pageSizeOptions[0],
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
    this.searchForm.get('sort')?.setValue(this.sortOptions[0].value);
    this.searchForm.get('limit')?.setValue(this.pageSizeOptions[0]);
  }

  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return Array.from(
      { length: fullStars + (hasHalfStar ? 1 : 0) },
      (_, i) => i + 1
    );
  }

  parseRating(rating: number): number {
    return Math.floor(rating);
  }
}
