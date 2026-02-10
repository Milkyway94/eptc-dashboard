/**
 * Main Dashboard Application
 */
import { api } from './utils/api.js';
import { Heatmap } from './components/Heatmap.js';
import { Sidebar } from './components/Sidebar.js';
import { Modal } from './components/Modal.js';
import './styles/main.scss';

class DashboardApp {
  constructor() {
    this.heatmap = null;
    this.sidebar = null;
    this.modal = new Modal();
    this.currentYear = 2026;
    this.tasksByDate = {};
  }

  async init() {
    try {
      this.showLoading();

      // Load data
      await this.loadData();

      // Initialize components
      this.initializeComponents();

      // Setup event listeners
      this.setupEventListeners();

      this.hideLoading();
      this.showContent();

    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError(error.message);
    }
  }

  async loadData() {
    try {
      // Load task counts and tasks by date
      const [countsResponse, tasksByDateResponse, upcomingResponse] = await Promise.all([
        api.getTaskCounts(this.currentYear),
        api.getTasksByDate(this.currentYear),
        api.getUpcomingTasks()
      ]);

      this.taskCounts = countsResponse.data || {};
      this.tasksByDate = tasksByDateResponse.data || {};
      this.upcomingTasks = upcomingResponse.tasks || [];

    } catch (error) {
      throw new Error('Không thể tải dữ liệu từ server: ' + error.message);
    }
  }

  initializeComponents() {
    // Initialize heatmap
    this.heatmap = new Heatmap('heatmap-container', this.currentYear);
    this.heatmap.setTaskCounts(this.taskCounts);
    this.heatmap.setOnDayClick((date) => this.handleDayClick(date));
    this.heatmap.render();

    // Initialize sidebar
    this.sidebar = new Sidebar('sidebar-container');
    this.sidebar.setTasks(this.upcomingTasks);
    this.sidebar.render();

    // Sync sidebar height after render
    setTimeout(() => {
      this.sidebar.syncHeight();
    }, 100);
  }

  setupEventListeners() {
    // Legend toggle
    const toggleLegendBtn = document.getElementById('toggle-legend-btn');
    const legend = document.getElementById('color-legend');

    if (toggleLegendBtn && legend) {
      toggleLegendBtn.addEventListener('click', () => {
        const isHidden = legend.style.display === 'none';
        legend.style.display = isHidden ? 'block' : 'none';
        toggleLegendBtn.textContent = isHidden ? 'Ẩn chú thích' : 'Hiển thị chú thích';
      });
    }

    // Window resize - sync sidebar height
    window.addEventListener('resize', () => {
      if (this.sidebar) {
        this.sidebar.syncHeight();
      }
    });
  }

  async handleDayClick(date) {
    try {
      const response = await api.getTasksForDate(date);
      const tasks = response.tasks || [];

      if (tasks.length > 0) {
        this.modal.open(date, tasks);
      }
    } catch (error) {
      console.error('Error loading tasks for date:', error);
      alert('Không thể tải chi tiết công việc');
    }
  }

  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  showContent() {
    const content = document.getElementById('main-content');
    if (content) {
      content.style.display = 'block';
    }
  }

  showError(message) {
    this.hideLoading();

    const errorEl = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (errorEl && errorText) {
      errorText.textContent = message;
      errorEl.style.display = 'block';
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new DashboardApp();
    app.init();
  });
} else {
  const app = new DashboardApp();
  app.init();
}
