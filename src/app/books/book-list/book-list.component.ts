import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  viewChild,
} from '@angular/core';
import { BookStoreService } from '../services/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
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
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ClearFormFieldComponent } from '../../shared/clear-form-field/clear-form-field.component';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  catchError,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { Book } from '../models/book';

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
export class BookListComponent implements AfterViewInit {
  private bookStoreService = inject(BookStoreService);

  listContainer = viewChild<ElementRef>('listContainer');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private specialQuery = '';
  private language = '';

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
    sort: new FormControl('title'),
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
    this.listContainer()?.nativeElement.scrollIntoView();
  }

  isSearchButtonDisabled = () => {
    return this.isbn?.invalid && !!this.isbn?.value;
  };

  isLoading = signal(true);
  page = signal(1);
  books: Book[] = [];

  displayedColumns: string[] = [
    'title',
    'rating',
    'year',
    'ebook_access',
    'ddc_sort',
    'lcc_sort',
    'more',
  ];

  searchTrigger$ = new Subject<void>();
  resultsLength = 0;

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.searchTrigger$.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.searchTrigger$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading.set(true);
          return this.bookStoreService
            .searchBooks(this.formBuilder())
            .pipe(catchError(() => of(null)));
        }),
        map((books) => {
          this.isLoading.set(false);

          if (books === null) {
            return [];
          }

          this.resultsLength = books.numFound;
          return books.docs;
        })
      )
      .subscribe((books) => (this.books = books));
  }
  formBuilder() {
    if (this.searchForm.value.publishYear) {
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
    if (!this.specialQuery) {
      this.specialQuery = '*';
    }
    if (this.sort.direction === '') {
      this.sort.active = 'title';
    }
    let sort = this.sort.active;
    let direction = this.sort.direction;

    if (this.sort.active === 'year' && this.sort.direction === 'desc') {
      sort = 'new';
      direction = '';
    }
    if (this.sort.active === 'year' && this.sort.direction === 'asc') {
      sort = 'old';
      direction = '';
    }

    return {
      specialQuery: this.specialQuery,
      title: this.searchForm.value.title?.trim() ?? '',
      author: this.searchForm.value.author?.trim() ?? '',
      isbn: this.searchForm.value.isbn?.trim() ?? '',
      subject: this.searchForm.value.subject?.trim() ?? '',
      publisher: this.searchForm.value.publisher?.trim() ?? '',
      person: this.searchForm.value.person?.trim() ?? '',
      place: this.searchForm.value.place?.trim() ?? '',
      sort: sort,
      order: direction,
      limit: this.searchForm.value.limit ?? this.pageSizeOptions[0],
      page: this.page(),
    };
  }

  clearForm() {
    this.searchForm.reset();
    this.searchForm.get('sort')?.setValue('title');
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
