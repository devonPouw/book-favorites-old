import { Component, Input } from '@angular/core';
import { Book } from '../../shared/book';

@Component({
  selector: 'bf-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
})
export class BookListItemComponent {
  @Input() book?: Book;
}
