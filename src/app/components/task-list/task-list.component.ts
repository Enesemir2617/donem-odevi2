import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="website-container" [class.dark-theme]="isDarkTheme">
      <!-- Navigation Bar -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>Görev Hatırlatıcı</h1>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link" [class.active]="currentSection === 'tasks'" (click)="setCurrentSection('tasks')">Görevlerim</a>
          <a href="#" class="nav-link" [class.active]="currentSection === 'calendar'" (click)="setCurrentSection('calendar')">Takvim</a>
          <a href="#" class="nav-link" [class.active]="currentSection === 'stats'" (click)="setCurrentSection('stats')">İstatistikler</a>
        </div>
        <div class="nav-actions">
          <div class="theme-toggle-container">
            <button class="theme-toggle" (click)="toggleTheme()" [title]="isDarkTheme ? 'Açık Tema' : 'Koyu Tema'">
              <span class="theme-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
              <span class="theme-text">{{ isDarkTheme ? 'Açık Tema' : 'Koyu Tema' }}</span>
            </button>
          </div>
          <div class="user-profile">
            <span class="user-icon">👤</span>
            <span class="user-name">Kullanıcı</span>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
        <div class="task-container">
          <!-- Tasks Section -->
          <div *ngIf="currentSection === 'tasks'" class="section-content">
            <div class="task-form">
              <h3>Yeni Görev Ekle</h3>
              <div class="form-group">
                <label for="title">Görev Başlığı</label>
                <input id="title" [(ngModel)]="newTask.title" placeholder="Görev başlığını girin" required />
              </div>
              <div class="form-group">
                <label for="description">Açıklama</label>
                <textarea id="description" [(ngModel)]="newTask.description" placeholder="Görev açıklamasını girin"></textarea>
              </div>
              <div class="form-group">
                <label for="dueDate">Son Tarih</label>
                <input id="dueDate" type="datetime-local" [(ngModel)]="dueDateString" (ngModelChange)="updateDueDate($event)" required />
              </div>
              <div class="form-group">
                <label for="priority">Öncelik</label>
                <select id="priority" [(ngModel)]="newTask.priority" required>
                  <option value="low">Düşük Öncelik</option>
                  <option value="medium">Orta Öncelik</option>
                  <option value="high">Yüksek Öncelik</option>
                </select>
              </div>
              <button class="add-button" (click)="addTask()" [disabled]="!newTask.title.trim()">
                <span class="button-icon">+</span> Görev Ekle
              </button>
            </div>

            <div class="task-list">
              <div class="list-header">
                <h3>Görevleriniz</h3>
                <div class="list-controls">
                  <div class="filter-options">
                    <select [(ngModel)]="filterPriority" (change)="applyFilter()">
                      <option value="all">Tüm Öncelikler</option>
                      <option value="low">Düşük Öncelik</option>
                      <option value="medium">Orta Öncelik</option>
                      <option value="high">Yüksek Öncelik</option>
                    </select>
                    <select [(ngModel)]="filterStatus" (change)="applyFilter()">
                      <option value="all">Tüm Durumlar</option>
                      <option value="completed">Tamamlanan</option>
                      <option value="pending">Bekleyen</option>
                    </select>
                  </div>
                  <button class="back-button" (click)="goBack()" *ngIf="selectedTask">
                    <span class="back-icon">←</span> Geri
                  </button>
                </div>
              </div>
              <div *ngIf="!selectedTask">
                <div *ngFor="let task of filteredTasks" class="task-item" [class.completed]="task.completed" [class.high-priority]="task.priority === 'high'" (click)="selectTask(task)">
                  <div class="task-header">
                    <h3>{{ task.title }}</h3>
                    <span class="priority-badge" [class]="task.priority">
                      {{ getPriorityText(task.priority) }}
                    </span>
                  </div>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-details">
                    <div class="detail-item">
                      <span class="detail-label">Son Tarih:</span>
                      <span class="detail-value">{{ task.dueDate | date:'medium' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Durum:</span>
                      <span class="status-badge" [class]="task.completed ? 'completed' : 'pending'">
                        {{ task.completed ? 'Tamamlandı' : 'Bekliyor' }}
                      </span>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button class="complete-button" (click)="toggleComplete(task)">
                      {{ task.completed ? 'Geri Al' : 'Tamamla' }}
                    </button>
                    <button class="delete-button" (click)="deleteTask(task.id)">
                      Sil
                    </button>
                  </div>
                </div>
              </div>
              <div *ngIf="selectedTask" class="task-detail-view">
                <div class="task-detail-header">
                  <h2>{{ selectedTask.title }}</h2>
                  <span class="priority-badge" [class]="selectedTask.priority">
                    {{ getPriorityText(selectedTask.priority) }}
                  </span>
                </div>
                <div class="task-detail-content">
                  <p class="task-description">{{ selectedTask.description }}</p>
                  <div class="task-detail-info">
                    <div class="info-item">
                      <span class="info-label">Son Tarih:</span>
                      <span class="info-value">{{ selectedTask.dueDate | date:'medium' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Durum:</span>
                      <span class="status-badge" [class]="selectedTask.completed ? 'completed' : 'pending'">
                        {{ selectedTask.completed ? 'Tamamlandı' : 'Bekliyor' }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Oluşturulma Tarihi:</span>
                      <span class="info-value">{{ selectedTask.dueDate | date:'medium' }}</span>
                    </div>
                  </div>
                  <div class="task-detail-actions">
                    <button class="complete-button" (click)="toggleComplete(selectedTask)">
                      {{ selectedTask.completed ? 'Geri Al' : 'Tamamla' }}
                    </button>
                    <button class="delete-button" (click)="deleteTask(selectedTask.id)">
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar Section -->
          <div *ngIf="currentSection === 'calendar'" class="section-content">
            <div class="calendar-container">
              <div class="calendar-header">
                <h2>Takvim</h2>
                <div class="calendar-month-controls">
                  <button class="month-control" (click)="previousMonth()">←</button>
                  <span class="current-month">{{ getCurrentMonthName() }} {{ currentYear }}</span>
                  <button class="month-control" (click)="nextMonth()">→</button>
                </div>
              </div>
              <div class="calendar-grid">
                <div class="calendar-weekdays">
                  <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
                </div>
                <div class="calendar-days">
                  <div *ngFor="let day of calendarDays" class="calendar-day" [class.has-tasks]="hasTasksForDay(day)">
                    <div class="day-content">
                      <span class="day-number">{{ day.getDate() }}</span>
                      <div class="day-tasks" *ngIf="hasTasksForDay(day)">
                        <div *ngFor="let task of getTasksForDay(day)" class="calendar-task" [class]="task.priority">
                          {{ task.title }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Section -->
          <div *ngIf="currentSection === 'stats'" class="section-content">
            <div class="stats-container">
              <h2>İstatistikler</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">{{ getTotalTasks() }}</span>
                  <span class="stat-label">Toplam Görev</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ getCompletedTasks() }}</span>
                  <span class="stat-label">Tamamlanan</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ getPendingTasks() }}</span>
                  <span class="stat-label">Bekleyen</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ getHighPriorityTasks() }}</span>
                  <span class="stat-label">Yüksek Öncelikli</span>
                </div>
              </div>
              <div class="stats-chart">
                <h3>Görev Dağılımı</h3>
                <div class="chart-bars">
                  <div class="chart-bar" [style.height.%]="(getCompletedTasks() / getTotalTasks()) * 100">
                    <span class="chart-label">Tamamlanan</span>
                  </div>
                  <div class="chart-bar" [style.height.%]="(getPendingTasks() / getTotalTasks()) * 100">
                    <span class="chart-label">Bekleyen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .website-container {
      min-height: 100vh;
      background: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s, color 0.3s;
    }

    .website-container.dark-theme {
      --background-color: #1a1a1a;
      --card-background: #2d2d2d;
      --text-color: #ffffff;
      --border-color: #404040;
      --primary-color: #4A4FFF;
      --secondary-color: #2C3E50;
    }

    .website-container:not(.dark-theme) {
      --background-color: #f8f9fa;
      --card-background: white;
      --text-color: #333;
      --border-color: #e0e0e0;
      --primary-color: #6B73FF;
      --secondary-color: #4A90E2;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .welcome-section, .task-form, .task-stats, .task-list, .task-item, .stat-card {
      background: var(--card-background);
      color: var(--text-color);
      border: 1px solid var(--border-color);
    }

    input, textarea, select {
      background: var(--card-background);
      color: var(--text-color);
      border: 1px solid var(--border-color);
    }

    .list-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .back-button:hover {
      background: var(--secondary-color);
    }

    .back-icon {
      font-size: 1.2rem;
    }

    .task-detail-view {
      background: var(--card-background);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .task-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .task-detail-content {
      margin-top: 1.5rem;
    }

    .task-detail-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-label {
      font-size: 0.9rem;
      color: var(--text-color);
      opacity: 0.7;
    }

    .info-value {
      font-weight: 600;
      color: var(--text-color);
    }

    .task-detail-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .theme-toggle-container {
      position: relative;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      transition: background-color 0.3s;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .theme-icon {
      font-size: 1.2rem;
    }

    .theme-text {
      font-size: 0.9rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .user-profile:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      padding: 2rem;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: var(--card-background);
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .welcome-section h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .filter-options {
      display: flex;
      gap: 1rem;
    }

    .filter-options select {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--card-background);
      color: var(--text-color);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .task-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .app-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 700;
    }

    .subtitle {
      margin: 10px 0 0;
      opacity: 0.9;
      font-size: 1.1em;
    }

    .task-form {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    input, textarea, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1em;
      transition: border-color 0.3s;
    }

    input:focus, textarea:focus, select:focus {
      border-color: #6B73FF;
      outline: none;
    }

    .add-button {
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1.1em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.3s;
    }

    .add-button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .button-icon {
      font-size: 1.2em;
    }

    .task-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2em;
      font-weight: 700;
      color: #6B73FF;
      display: block;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
    }

    .task-list {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .task-item {
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #fff;
      border-left: 4px solid #6B73FF;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .task-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .task-item.completed {
      border-left-color: #4CAF50;
      opacity: 0.8;
    }

    .task-item.high-priority {
      border-left-color: #FF5252;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .priority-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
    }

    .priority-badge.low {
      background: #E3F2FD;
      color: #1976D2;
    }

    .priority-badge.medium {
      background: #FFF3E0;
      color: #F57C00;
    }

    .priority-badge.high {
      background: #FFEBEE;
      color: #D32F2F;
    }

    .task-description {
      color: #666;
      margin-bottom: 15px;
    }

    .task-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 0.8em;
      color: #999;
    }

    .detail-value {
      font-weight: 600;
      color: #333;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
    }

    .status-badge.completed {
      background: #E8F5E9;
      color: #2E7D32;
    }

    .status-badge.pending {
      background: #FFF3E0;
      color: #F57C00;
    }

    .task-actions {
      display: flex;
      gap: 10px;
    }

    .complete-button, .delete-button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .complete-button {
      background: #4CAF50;
      color: white;
    }

    .complete-button:hover {
      background: #388E3C;
    }

    .delete-button {
      background: #FF5252;
      color: white;
    }

    .delete-button:hover {
      background: #D32F2F;
    }

    .section-content {
      padding: 2rem;
    }

    .calendar-container {
      background: var(--card-background);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .calendar-month-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .month-control {
      background: var(--primary-color);
      color: white;
      border: none;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: background-color 0.3s;
    }

    .month-control:hover {
      background: var(--secondary-color);
    }

    .current-month {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .calendar-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .weekday {
      text-align: center;
      font-weight: 600;
      padding: 0.25rem;
      color: var(--text-color);
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }

    .calendar-day {
      aspect-ratio: 1;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      position: relative;
      background: var(--card-background);
      transition: all 0.3s ease;
      min-height: 80px;
    }

    .calendar-day:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .calendar-day.has-tasks {
      background: rgba(var(--primary-color-rgb), 0.05);
    }

    .day-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0.25rem;
    }

    .day-number {
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .day-tasks {
      flex: 1;
      overflow-y: auto;
      max-height: calc(100% - 1.5rem);
    }

    .calendar-task {
      font-size: 0.75rem;
      padding: 0.2rem;
      margin-bottom: 0.2rem;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .calendar-task:hover {
      transform: scale(1.02);
    }

    .calendar-task.high {
      background: rgba(255, 82, 82, 0.2);
      color: #D32F2F;
    }

    .calendar-task.medium {
      background: rgba(255, 193, 7, 0.2);
      color: #F57C00;
    }

    .calendar-task.low {
      background: rgba(33, 150, 243, 0.2);
      color: #1976D2;
    }

    .stats-container {
      background: var(--card-background);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .stats-chart {
      margin-top: 2rem;
      padding: 2rem;
      background: var(--card-background);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chart-bars {
      display: flex;
      gap: 2rem;
      height: 200px;
      align-items: flex-end;
      margin-top: 2rem;
    }

    .chart-bar {
      flex: 1;
      background: var(--primary-color);
      position: relative;
      transition: height 0.3s ease;
    }

    .chart-label {
      position: absolute;
      bottom: -2rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.9rem;
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTask: Task | null = null;
  currentSection: 'tasks' | 'calendar' | 'stats' = 'tasks';
  weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  calendarDays: Date[] = [];
  newTask: Task = {
    id: 0,
    title: '',
    description: '',
    dueDate: new Date(),
    completed: false,
    priority: 'medium'
  };
  dueDateString: string = '';
  filterPriority: string = 'all';
  filterStatus: string = 'all';
  isDarkTheme: boolean = false;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();

  constructor(private taskService: TaskService) {
    this.updateDueDateString();
    this.generateCalendarDays();
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
      },
      error: (error) => {
        console.error('Görevler yüklenirken hata oluştu:', error);
      }
    });
  }

  setCurrentSection(section: 'tasks' | 'calendar' | 'stats'): void {
    this.currentSection = section;
  }

  generateCalendarDays(): void {
    this.calendarDays = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - i);
      this.calendarDays.push(date);
    }

    // Add days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push(date);
    }

    // Add days from next month to fill the last week
    const lastDayOfWeek = lastDayOfMonth.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      this.calendarDays.push(date);
    }
  }

  hasTasksForDay(date: Date): boolean {
    return this.tasks.some(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  }

  getTasksForDay(date: Date): Task[] {
    return this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  }

  getHighPriorityTasks(): number {
    return this.tasks.filter(task => task.priority === 'high').length;
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
  }

  goBack(): void {
    this.selectedTask = null;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    // Save theme preference to localStorage
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  applyFilter(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesPriority = this.filterPriority === 'all' || task.priority === this.filterPriority;
      const matchesStatus = this.filterStatus === 'all' || 
                          (this.filterStatus === 'completed' && task.completed) ||
                          (this.filterStatus === 'pending' && !task.completed);
      return matchesPriority && matchesStatus;
    });
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      default:
        return priority;
    }
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  getCompletedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  getPendingTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  updateDueDateString(): void {
    const date = new Date();
    this.dueDateString = date.toISOString().slice(0, 16);
  }

  updateDueDate(value: string): void {
    this.newTask.dueDate = new Date(value);
  }

  addTask(): void {
    if (this.newTask.title.trim()) {
      try {
        this.taskService.addTask({...this.newTask});
        this.newTask = {
          id: 0,
          title: '',
          description: '',
          dueDate: new Date(),
          completed: false,
          priority: 'medium'
        };
        this.updateDueDateString();
      } catch (error) {
        console.error('Görev eklenirken hata oluştu:', error);
      }
    }
  }

  toggleComplete(task: Task): void {
    try {
      task.completed = !task.completed;
      this.taskService.updateTask(task);
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
    }
  }

  deleteTask(id: number): void {
    try {
      this.taskService.deleteTask(id);
    } catch (error) {
      console.error('Görev silinirken hata oluştu:', error);
    }
  }

  getCurrentMonthName(): string {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[this.currentMonth];
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendarDays();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendarDays();
  }
} 