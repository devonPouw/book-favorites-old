import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'bf-clear-form-field',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './clear-form-field.component.html',
  styleUrl: './clear-form-field.component.scss',
})
export class ClearFormFieldComponent {
  @Input() control!: AbstractControl;

  @Output() cleared = new EventEmitter<void>();

  clear() {
    this.control.reset();
    this.cleared.emit();
  }
}
