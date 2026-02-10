/**
 * Admin Page Application
 */
import { api } from './utils/api.js';
import { FileUpload } from './components/FileUpload.js';
import { formatDateVN } from './utils/dateUtils.js';
import './styles/main.scss';

class AdminApp {
  constructor() {
    this.fileUpload = null;
    this.currentUser = null;
    this.selectedFile = null;
    this.previewData = null;
  }

  async init() {
    // Check if already logged in
    await this.checkAuth();
  }

  async checkAuth() {
    try {
      const response = await api.getCurrentUser();

      if (response.success && response.user) {
        this.currentUser = response.user;
        this.showAdminContent();
        await this.loadStats();
      } else {
        this.showLoginForm();
      }
    } catch (error) {
      // Not logged in
      this.showLoginForm();
    }
  }

  showLoginForm() {
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');

    if (loginContainer) loginContainer.style.display = 'flex';
    if (adminContent) adminContent.style.display = 'none';

    this.setupLoginForm();
  }

  showAdminContent() {
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');
    const logoutBtn = document.getElementById('logout-btn');
    const adminName = document.getElementById('admin-name');

    if (loginContainer) loginContainer.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (adminName && this.currentUser) {
      adminName.textContent = this.currentUser.username;
    }

    this.setupAdminPanel();
  }

  setupLoginForm() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
          const response = await api.login(username, password);

          if (response.success) {
            this.currentUser = response.user;
            this.showAdminContent();
            await this.loadStats();
          } else {
            this.showLoginError(response.error || 'Đăng nhập thất bại');
          }
        } catch (error) {
          this.showLoginError(error.message);
        }
      });
    }
  }

  showLoginError(message) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  setupAdminPanel() {
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await api.logout();
          location.reload();
        } catch (error) {
          console.error('Logout error:', error);
          location.reload();
        }
      });
    }

    // Setup file upload
    this.fileUpload = new FileUpload('file-upload-container');
    this.fileUpload.setOnFileSelect((file) => {
      this.selectedFile = file;
      this.handleFileSelect(file);
    });
    this.fileUpload.render();

    // Setup upload actions
    const previewBtn = document.getElementById('preview-btn');
    const importBtn = document.getElementById('import-btn');

    if (previewBtn) {
      previewBtn.addEventListener('click', () => this.handlePreview());
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => this.handleImport());
    }
  }

  handleFileSelect(file) {
    const actionsEl = document.getElementById('upload-actions');
    const previewSection = document.getElementById('preview-section');
    const resultSection = document.getElementById('result-section');

    if (file) {
      if (actionsEl) actionsEl.style.display = 'flex';
    } else {
      if (actionsEl) actionsEl.style.display = 'none';
      if (previewSection) previewSection.style.display = 'none';
      if (resultSection) resultSection.style.display = 'none';
    }
  }

  async handlePreview() {
    if (!this.selectedFile) return;

    try {
      this.showLoading('Đang xem trước dữ liệu...');

      const response = await api.previewExcel(this.selectedFile);

      this.hideLoading();

      if (response.success) {
        this.previewData = response.preview;
        this.displayPreview(response.preview, response.stats, response.errors);
      } else {
        alert('Lỗi: ' + (response.error || 'Không thể xem trước'));
      }
    } catch (error) {
      this.hideLoading();
      alert('Lỗi khi xem trước: ' + error.message);
    }
  }

  displayPreview(preview, stats, errors) {
    const previewSection = document.getElementById('preview-section');
    const previewContent = document.getElementById('preview-content');

    if (!previewSection || !previewContent) return;

    let html = '<div class="preview-stats">';
    html += `<div class="stat-box"><strong>Tổng công việc:</strong> ${preview.total_tasks}</div>`;
    html += `<div class="stat-box"><strong>Phòng ban:</strong> ${preview.total_departments}</div>`;

    if (preview.date_range.min && preview.date_range.max) {
      html += `<div class="stat-box"><strong>Khoảng thời gian:</strong> ${formatDateVN(preview.date_range.min)} - ${formatDateVN(preview.date_range.max)}</div>`;
    }
    html += '</div>';

    // Sample tasks
    if (preview.sample_tasks && preview.sample_tasks.length > 0) {
      html += '<h4>Mẫu dữ liệu (5 dòng đầu):</h4>';
      html += '<div class="preview-table-container">';
      html += '<table class="preview-table">';
      html += '<thead><tr><th>STT</th><th>Phòng ban</th><th>Nội dung</th><th>Ngày</th></tr></thead>';
      html += '<tbody>';

      preview.sample_tasks.forEach(task => {
        html += '<tr>';
        html += `<td>${task.stt || '-'}</td>`;
        html += `<td>${task.department}</td>`;
        html += `<td>${task.content}</td>`;
        html += `<td>${task.warning_date ? formatDateVN(task.warning_date) : '-'}</td>`;
        html += '</tr>';
      });

      html += '</tbody></table>';
      html += '</div>';
    }

    // Errors
    if (errors && errors.length > 0) {
      html += '<div class="preview-errors">';
      html += '<h4>⚠️ Cảnh báo:</h4>';
      html += '<ul>';
      errors.forEach(error => {
        html += `<li>${error}</li>`;
      });
      html += '</ul>';
      html += '</div>';
    }

    previewContent.innerHTML = html;
    previewSection.style.display = 'block';

    // Scroll to preview
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async handleImport() {
    if (!this.selectedFile) return;

    const confirmed = confirm(
      'Bạn có chắc muốn import dữ liệu này?\n\n' +
      'Dữ liệu mới sẽ được merge với dữ liệu hiện tại. ' +
      'Các bản ghi trùng lặp sẽ bị bỏ qua.'
    );

    if (!confirmed) return;

    try {
      this.showLoading('Đang import dữ liệu...');

      const response = await api.importExcel(this.selectedFile);

      this.hideLoading();

      if (response.success) {
        this.displayImportResult(response.stats, response.errors);
        await this.loadStats(); // Reload stats
      } else {
        alert('Lỗi: ' + (response.error || 'Import thất bại'));
      }
    } catch (error) {
      this.hideLoading();
      alert('Lỗi khi import: ' + error.message);
    }
  }

  displayImportResult(stats, errors) {
    const resultSection = document.getElementById('result-section');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');

    if (!resultSection || !resultTitle || !resultContent) return;

    resultTitle.textContent = '✅ Import thành công!';

    let html = '<div class="result-stats">';
    html += `<div class="stat-box success"><strong>Bản ghi mới:</strong> ${stats.new_records}</div>`;
    html += `<div class="stat-box"><strong>Trùng lặp bỏ qua:</strong> ${stats.duplicates_skipped}</div>`;
    html += `<div class="stat-box"><strong>Tổng đã xử lý:</strong> ${stats.valid_rows}</div>`;
    html += '</div>';

    if (errors && errors.length > 0) {
      html += '<div class="result-errors">';
      html += '<h4>⚠️ Các lỗi trong quá trình import:</h4>';
      html += '<ul>';
      errors.slice(0, 10).forEach(error => {
        html += `<li>${error}</li>`;
      });
      if (errors.length > 10) {
        html += `<li>... và ${errors.length - 10} lỗi khác</li>`;
      }
      html += '</ul>';
      html += '</div>';
    }

    resultContent.innerHTML = html;
    resultSection.style.display = 'block';

    // Hide upload sections
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('upload-actions').style.display = 'none';

    // Clear file selection
    if (this.fileUpload) {
      this.fileUpload.clearFile();
    }

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async loadStats() {
    try {
      const response = await api.getStats();

      if (response.success && response.stats) {
        const stats = response.stats;

        const totalTasksEl = document.getElementById('stat-total-tasks');
        const departmentsEl = document.getElementById('stat-departments');
        const minDateEl = document.getElementById('stat-min-date');
        const maxDateEl = document.getElementById('stat-max-date');

        if (totalTasksEl) totalTasksEl.textContent = stats.total_tasks;
        if (departmentsEl) departmentsEl.textContent = stats.total_departments;
        if (minDateEl) minDateEl.textContent = stats.date_range.min_date ? formatDateVN(stats.date_range.min_date) : '-';
        if (maxDateEl) maxDateEl.textContent = stats.date_range.max_date ? formatDateVN(stats.date_range.max_date) : '-';
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  showLoading(message = 'Đang xử lý...') {
    const overlay = document.getElementById('loading-overlay');
    const messageEl = document.getElementById('loading-message');

    if (overlay) overlay.style.display = 'flex';
    if (messageEl) messageEl.textContent = message;
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init();
  });
} else {
  const app = new AdminApp();
  app.init();
}
