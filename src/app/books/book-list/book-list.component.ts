import { Component, inject } from '@angular/core';
import { BookStoreService } from '../../shared/book-store.service';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'bm-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
  imports: [BookListItemComponent],
})
export class BookListComponent {
  books = toSignal(inject(BookStoreService).getInitialRandom());
}
