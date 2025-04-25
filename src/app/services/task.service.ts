import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      // Load tasks from localStorage if available
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks);
          this.tasksSubject.next(this.tasks);
        } catch (error) {
          console.error('Error parsing saved tasks:', error);
          this.tasks = [];
        }
      }
    }
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(task: Task): void {
    task.id = this.tasks.length + 1;
    this.tasks.push(task);
    this.updateTasks();
  }

  updateTask(task: Task): void {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
      this.updateTasks();
    }
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.updateTasks();
  }

  private updateTasks(): void {
    this.tasksSubject.next(this.tasks);
    if (this.isBrowser) {
      try {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    }
  }
} 