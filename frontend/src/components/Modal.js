/**
 * Modal Component - Task Details
 */
import { formatDateVN } from '../utils/dateUtils.js';

export class Modal {
  constructor() {
    this.modal = null;
    this.isOpen = false;
  }

  open(date, tasks) {
    if (this.isOpen) {
      this.close();
    }

    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.close());
    modalContent.appendChild(closeBtn);

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h2>Công việc ngày ${formatDateVN(date)}</h2>
      <p class="task-count-label">${tasks.length} công việc</p>
    `;
    modalContent.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';

    // Group tasks by department
    const tasksByDept = this.groupByDepartment(tasks);

    Object.entries(tasksByDept).forEach(([dept, deptTasks]) => {
      const deptSection = document.createElement('div');
      deptSection.className = 'dept-section';

      const deptHeader = document.createElement('h3');
      deptHeader.className = 'dept-header';
      deptHeader.textContent = `${dept} (${deptTasks.length})`;
      deptSection.appendChild(deptHeader);

      const taskList = document.createElement('ul');
      taskList.className = 'task-list';

      deptTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.textContent = task.content;
        taskList.appendChild(taskItem);
      });

      deptSection.appendChild(taskList);
      body.appendChild(deptSection);
    });

    modalContent.appendChild(body);

    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);

    this.isOpen = true;

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close on ESC key
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEscape);

    // Trigger animation
    setTimeout(() => {
      this.modal.classList.add('active');
    }, 10);
  }

  close() {
    if (!this.modal || !this.isOpen) return;

    this.modal.classList.remove('active');

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;
      this.isOpen = false;
    }, 300);

    if (this.handleEscape) {
      document.removeEventListener('keydown', this.handleEscape);
    }
  }

  groupByDepartment(tasks) {
    const grouped = {};

    tasks.forEach(task => {
      const dept = task.department || 'Khác';
      if (!grouped[dept]) {
        grouped[dept] = [];
      }
      grouped[dept].push(task);
    });

    return grouped;
  }
}
