import { Component, Input } from '@angular/core';
import { Book } from '../models/book';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'bf-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
  standalone: true,
  imports: [RouterLink, MatButtonModule, NgIf],
})
export class BookListItemComponent {
  @Input() book!: Book;
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
