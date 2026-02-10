/**
 * Sidebar Component - Upcoming Tasks
 */
import { formatDateVN, getDaysFromToday, isWithinDays } from '../utils/dateUtils.js';

export class Sidebar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tasks = [];
  }

  setTasks(tasks) {
    this.tasks = tasks;
  }

  render() {
    if (!this.container) {
      console.error('Sidebar container not found');
      return;
    }

    this.container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `
      <h2>Sắp diễn ra</h2>
      <p class="subtitle">Màu đỏ: nguy cấp đến 3 ngày tới, theo thời gian</p>
    `;
    this.container.appendChild(header);

    // Task list container with scrolling
    const listContainer = document.createElement('div');
    listContainer.className = 'sidebar-tasks';

    if (this.tasks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Không có công việc sắp tới';
      listContainer.appendChild(emptyMessage);
    } else {
      this.tasks.forEach(task => {
        const taskCard = this.createTaskCard(task);
        listContainer.appendChild(taskCard);
      });
    }

    this.container.appendChild(listContainer);

    // Sync height with heatmap
    this.syncHeight();
  }

  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';

    const daysLeft = getDaysFromToday(task.warning_date);
    const isUrgent = isWithinDays(task.warning_date, 3);

    if (isUrgent) {
      card.classList.add('urgent');
    }

    // Days badge
    const daysBadge = document.createElement('div');
    daysBadge.className = 'days-badge';

    if (daysLeft === 0) {
      daysBadge.textContent = 'Hôm nay';
      daysBadge.classList.add('today');
    } else {
      daysBadge.textContent = `${daysLeft}`;
    }

    card.appendChild(daysBadge);

    // Task content
    const content = document.createElement('div');
    content.className = 'task-content';

    // Department
    const department = document.createElement('div');
    department.className = 'task-department';
    department.textContent = task.department;
    content.appendChild(department);

    // Task description
    const description = document.createElement('div');
    description.className = 'task-description';
    description.textContent = task.content;
    content.appendChild(description);

    // Date
    const date = document.createElement('div');
    date.className = 'task-date';
    date.textContent = formatDateVN(task.warning_date);
    content.appendChild(date);

    card.appendChild(content);

    return card;
  }

  syncHeight() {
    // Auto-resize sidebar to match heatmap height
    const heatmapEl = document.getElementById('heatmap-container');
    if (heatmapEl && this.container) {
      const heatmapHeight = heatmapEl.offsetHeight;
      const sidebar = this.container.querySelector('.sidebar-tasks');
      if (sidebar) {
        sidebar.style.maxHeight = `${heatmapHeight - 100}px`; // Subtract header height
      }
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
