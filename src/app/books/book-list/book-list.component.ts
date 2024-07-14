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
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { isEqual } from 'lodash';
import { Book } from '../models/book';
import { BookRatingComponent } from '../book-rating/book-rating.component';
import { Store } from '@ngrx/store';
import * as BookActions from '../../books.actions';

@Component({
  selector: 'bf-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [
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
    BookRatingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent implements AfterViewInit {
  private store = inject(Store);
  private bookStoreService = inject(BookStoreService);

  listContainer = viewChild<ElementRef>('listContainer');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private specialQuery = '';

  pageSizeOptions = [25, 50, 100];
  currentPage = signal(0);
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
  get language() {
    return this.searchForm.get('language');
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
    this.pageEvent = e;
    this.limit?.setValue(e.pageSize);
    this.currentPage.set(e.pageIndex + 1);
    this.listContainer()?.nativeElement.scrollIntoView();
  }

  isSearchButtonDisabled = () => {
    return this.isbn?.invalid && !!this.isbn?.value;
  };

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

  books$: Observable<Book[]> = this.store.select((state) => state.books.books);
  resultsLength$ = this.store.select((state) => state.books.resultsLength);
  isLoading$: Observable<boolean> = this.store.select(
    (state) => state.books.isLoading
  );
  searchParams$ = this.store.select((state) => state.books.searchParams);

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.searchTrigger$.next(); // Trigger a new search on sort change
    });

    merge(
      this.sort.sortChange.pipe(map(() => this.formBuilder())),
      this.paginator.page.pipe(map(() => this.formBuilder())),
      this.searchTrigger$.pipe(map(() => this.formBuilder()))
    )
      .pipe(
        distinctUntilChanged(isEqual),
        switchMap((searchParams) => {
          this.store.dispatch(BookActions.loadBooks());
          this.store.dispatch(
            BookActions.updateSearchParams({ searchParams: searchParams })
          );
          return this.bookStoreService.searchBooks(searchParams).pipe(
            tap((books) => {
              this.store.dispatch(
                BookActions.loadBooksSuccess({
                  books: books.docs,
                  resultsLength: books.numFound,
                })
              );
            }),
            catchError(() => {
              this.store.dispatch(BookActions.loadBooksFailure());
              return of(null);
            })
          );
        })
      )
      .subscribe();
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
      const language = this.searchForm.value.language.trim();
      if (this.specialQuery) {
        this.specialQuery += `+language%3A${language}`;
      } else {
        this.specialQuery = `language%3A${language}`;
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
      page: this.currentPage() + 1,
    };
  }

  clearForm() {
    this.searchForm.reset();
    this.searchForm.get('sort')?.setValue('title');
    this.searchForm.get('limit')?.setValue(this.pageSizeOptions[0]);
  }
}
