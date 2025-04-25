import { Component } from '@angular/core';
import { TaskListComponent } from './components/task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskListComponent],
  template: `
    <div class="app-container">
      <app-task-list></app-task-list>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f0f2f5;
    }
  `]
})
export class AppComponent {
  title = 'task-reminder';
}
