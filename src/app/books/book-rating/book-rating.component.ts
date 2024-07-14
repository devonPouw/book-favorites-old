import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'bf-book-rating',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './book-rating.component.html',
  styleUrl: './book-rating.component.scss',
})
export class BookRatingComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() row: any;
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return Array.from(
      { length: fullStars + (hasHalfStar ? 1 : 0) },
      (_, i) => i + 1
    );
  }
  isStarHalf(index: number, rating: number): boolean {
    return index === Math.floor(rating) && rating % 1 >= 0.5;
  }
}
