import { Component, input } from '@angular/core';
import { Book } from '../../shared/book';

@Component({
  selector: 'bf-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
  standalone: true,
})
export class BookListItemComponent {
  book = input.required<Book>();
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
