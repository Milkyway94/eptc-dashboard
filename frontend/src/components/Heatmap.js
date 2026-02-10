/**
 * Heatmap Calendar Component
 */
import { getMonthCalendar, getMonthNameVN, getDayOfWeekVN } from '../utils/dateUtils.js';
import { getBackgroundColor, getTextColor } from '../utils/colorUtils.js';

export class Heatmap {
  constructor(containerId, year) {
    this.container = document.getElementById(containerId);
    this.year = year;
    this.taskCounts = {};
    this.onDayClick = null;
  }

  setTaskCounts(counts) {
    this.taskCounts = counts;
  }

  setOnDayClick(callback) {
    this.onDayClick = callback;
  }

  render() {
    if (!this.container) {
      console.error('Heatmap container not found');
      return;
    }

    this.container.innerHTML = '';

    // Create grid for 12 months
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    for (let month = 0; month < 12; month++) {
      const monthCard = this.createMonthCard(month);
      grid.appendChild(monthCard);
    }

    this.container.appendChild(grid);
  }

  createMonthCard(month) {
    const card = document.createElement('div');
    card.className = 'month-card';

    // Month header
    const header = document.createElement('div');
    header.className = 'month-header';
    header.textContent = getMonthNameVN(month);
    card.appendChild(header);

    // Day of week labels
    const dowRow = document.createElement('div');
    dowRow.className = 'dow-row';
    for (let i = 0; i < 7; i++) {
      const dowCell = document.createElement('div');
      dowCell.className = 'dow-cell';
      dowCell.textContent = getDayOfWeekVN(i);
      dowRow.appendChild(dowCell);
    }
    card.appendChild(dowRow);

    // Calendar grid
    const calendar = getMonthCalendar(this.year, month);
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';

    calendar.forEach(dayData => {
      const dayCell = this.createDayCell(dayData);
      calendarGrid.appendChild(dayCell);
    });

    card.appendChild(calendarGrid);

    return card;
  }

  createDayCell(dayData) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (!dayData) {
      cell.classList.add('empty');
      return cell;
    }

    const { day, dateISO } = dayData;
    const taskCount = this.taskCounts[dateISO] || 0;

    // Set colors based on task count
    cell.style.backgroundColor = getBackgroundColor(taskCount);
    cell.style.color = getTextColor(taskCount);

    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    // Task count badge (only if > 0)
    if (taskCount > 0) {
      const badge = document.createElement('div');
      badge.className = 'task-count';
      badge.textContent = taskCount;
      cell.appendChild(badge);

      cell.classList.add('has-tasks');
    }

    // Click handler
    if (taskCount > 0 && this.onDayClick) {
      cell.classList.add('clickable');
      cell.addEventListener('click', () => {
        this.onDayClick(dateISO, taskCount);
      });
    }

    return cell;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
