/**
 * Main Application - Matching demo-index.html design with API integration
 */
import { api } from './utils/api.js';
import { formatDateVN } from './utils/dateUtils.js';
import './styles/main.scss';

// Constants
const YEAR = 2026;
const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

// Gradient colors for date boxes (one per month)
const gradients = [
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
];

// Global state
let rawData = [];
let filteredData = [];
let departments = new Map();

// Main app class
class Dashboard {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Load data from API
      await this.loadData();

      // Setup event listeners
      this.setupEventListeners();

      // Initial render
      this.filterData();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      alert('Lỗi khi tải dữ liệu. Vui lòng tải lại trang.');
    }
  }

  async loadData() {
    try {
      // Fetch tasks from API
      const response = await api.getTasks();

      if (response.tasks && Array.isArray(response.tasks)) {
        rawData = response.tasks;

        // Extract unique departments and build department map
        departments.clear();
        rawData.forEach(task => {
          if (task.department && !departments.has(task.department)) {
            departments.set(task.department, task.department);
          }
        });

        // Populate department dropdown
        this.populateDepartmentDropdown();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  populateDepartmentDropdown() {
    const select = document.getElementById('deptFilter');

    // Clear existing options except "Tất cả"
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add department options (sorted)
    const sortedDepts = Array.from(departments.keys()).sort();
    sortedDepts.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    // Department filter change
    document.getElementById('deptFilter').addEventListener('change', () => {
      this.filterData();
    });

    // Modal close button
    document.getElementById('closeModalBtn').addEventListener('click', () => {
      this.closeModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('myModal');
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      this.syncHeight();
    });
  }

  filterData() {
    const filterVal = document.getElementById('deptFilter').value;

    if (filterVal === 'all') {
      filteredData = rawData;
    } else {
      filteredData = rawData.filter(task => task.department === filterVal);

      // Show alert if no data
      if (filteredData.length === 0) {
        // Optional: You can uncomment this if you want the alert
        // alert("Phòng không có nhiệm vụ cần triển khai");
      }
    }

    // Render calendar and sidebar
    this.renderCalendar();
    this.renderSidebar();

    // Sync heights after render
    setTimeout(() => this.syncHeight(), 200);
  }

  renderCalendar() {
    const container = document.getElementById('calendarGrid');
    container.innerHTML = '';

    // Group tasks by date
    const eventsMap = {};
    filteredData.forEach(task => {
      if (task.warning_date) {
        if (!eventsMap[task.warning_date]) {
          eventsMap[task.warning_date] = [];
        }
        eventsMap[task.warning_date].push(task);
      }
    });

    // Render 12 months
    for (let m = 0; m < 12; m++) {
      const card = document.createElement('div');
      card.className = 'month-card';

      // Month name
      const name = document.createElement('div');
      name.className = 'month-name';
      name.innerText = monthNames[m];
      card.appendChild(name);

      // Weekdays header
      const wd = document.createElement('div');
      wd.className = 'weekdays';
      ["CN", "T2", "T3", "T4", "T5", "T6", "T7"].forEach(d => {
        const sp = document.createElement('span');
        sp.innerText = d;
        wd.appendChild(sp);
      });
      card.appendChild(wd);

      // Days grid
      const daysDiv = document.createElement('div');
      daysDiv.className = 'days';

      const firstDay = new Date(YEAR, m, 1).getDay();
      const daysInMonth = new Date(YEAR, m + 1, 0).getDate();

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        daysDiv.appendChild(empty);
      }

      // Days of the month
      for (let d = 1; d <= daysInMonth; d++) {
        const el = document.createElement('div');
        el.className = 'day';
        el.innerText = d;

        const dateStr = `${YEAR}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const tasks = eventsMap[dateStr] || [];
        const count = tasks.length;

        if (count > 0) {
          // Apply heat level class
          if (count <= 2) el.classList.add('lvl-1');
          else if (count <= 4) el.classList.add('lvl-2');
          else if (count <= 7) el.classList.add('lvl-3');
          else if (count <= 9) el.classList.add('lvl-4');
          else el.classList.add('lvl-5');

          el.title = `${count} công việc`;
          el.onclick = () => this.openModal(dateStr, tasks);
        }

        daysDiv.appendChild(el);
      }

      card.appendChild(daysDiv);
      container.appendChild(card);
    }
  }

  renderSidebar() {
    const listDiv = document.getElementById('upcomingList');
    listDiv.innerHTML = '';

    // Get current date
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Update date info
    document.getElementById('sidebar-date-info').textContent =
      `Từ ${formatDateVN(now)}`;

    // Filter upcoming tasks
    let upcoming = filteredData.filter(task => {
      if (!task.warning_date) return false;
      const taskDate = new Date(task.warning_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= now;
    });

    // Sort by date ascending
    upcoming.sort((a, b) => {
      return new Date(a.warning_date) - new Date(b.warning_date);
    });

    // Render task items
    upcoming.forEach(task => {
      const taskDate = new Date(task.warning_date);
      const diffDays = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));

      const item = document.createElement('div');
      item.className = 'task-item';

      // Mark as urgent if within 3 days
      if (diffDays <= 3 && diffDays >= 0) {
        item.classList.add('urgent-border');
      }

      const colorBg = gradients[taskDate.getMonth() % gradients.length];

      item.innerHTML = `
        <div class="date-box" style="background: ${colorBg}">
          <span class="date-day">${taskDate.getDate()}</span>
          <span class="date-month">T${taskDate.getMonth() + 1}</span>
        </div>
        <div class="task-info">
          <span class="dept-badge">${task.department || 'N/A'}</span>
          <div class="task-content">${task.content || ''}</div>
        </div>
      `;

      listDiv.appendChild(item);
    });

    // Show empty message if no upcoming tasks
    if (upcoming.length === 0) {
      listDiv.innerHTML = "<div style='text-align:center; padding:20px; color:#999'>Không có công việc sắp tới</div>";
    }
  }

  syncHeight() {
    if (window.innerWidth > 1024) {
      const cal = document.getElementById('calSection');
      const side = document.getElementById('sideSection');
      if (cal && side) {
        side.style.maxHeight = 'none';
        side.style.maxHeight = cal.offsetHeight + 'px';
      }
    }
  }

  openModal(dateStr, tasks) {
    const [y, m, d] = dateStr.split('-');
    document.getElementById('modalTitle').innerText = `Chi tiết ngày ${d}/${m}/${y}`;

    const content = document.getElementById('modalContent');
    content.innerHTML = '';

    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'modal-task';
      div.innerHTML = `
        <strong class="modal-task-dept">${task.department || 'N/A'}</strong>
        <div class="modal-task-content">${task.content || ''}</div>
      `;
      content.appendChild(div);
    });

    document.getElementById('myModal').classList.add('show');
  }

  closeModal() {
    document.getElementById('myModal').classList.remove('show');
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
  });
} else {
  new Dashboard();
}
