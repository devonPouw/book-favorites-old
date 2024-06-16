import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bf-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterLink],
  standalone: true,
})
export class HomeComponent {}
