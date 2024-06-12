import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchFilterComponent } from '../search-filter/search-filter.component';

@Component({
  selector: 'bf-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterLink, SearchFilterComponent],
  standalone: true,
})
export class HomeComponent {}
