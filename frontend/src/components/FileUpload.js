/**
 * File Upload Component for Admin Page
 */

export class FileUpload {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.file = null;
    this.onFileSelect = null;
  }

  setOnFileSelect(callback) {
    this.onFileSelect = callback;
  }

  render() {
    if (!this.container) {
      console.error('FileUpload container not found');
      return;
    }

    this.container.innerHTML = `
      <div class="upload-area" id="upload-area">
        <div class="upload-icon">📁</div>
        <h3>Chọn file Excel để import</h3>
        <p>Kéo thả file vào đây hoặc click để chọn</p>
        <p class="file-hint">Chỉ chấp nhận file .xlsx hoặc .xls</p>
        <input type="file" id="file-input" accept=".xlsx,.xls" style="display: none;">
        <button type="button" class="btn btn-primary" id="select-file-btn">
          Chọn File
        </button>
      </div>
      <div class="file-selected" id="file-selected" style="display: none;">
        <div class="file-info">
          <span class="file-icon">📄</span>
          <div class="file-details">
            <div class="file-name" id="file-name"></div>
            <div class="file-size" id="file-size"></div>
          </div>
          <button type="button" class="btn-remove" id="remove-file-btn">✕</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-file-btn');
    const removeBtn = document.getElementById('remove-file-btn');

    // Click to select
    selectBtn.addEventListener('click', () => {
      fileInput.click();
    });

    uploadArea.addEventListener('click', (e) => {
      if (e.target === uploadArea || e.target.closest('.upload-area')) {
        fileInput.click();
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFile(e.target.files[0]);
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');

      if (e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    // Remove file
    removeBtn.addEventListener('click', () => {
      this.clearFile();
    });
  }

  handleFile(file) {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) &&
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls')) {
      alert('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
      return;
    }

    // Validate file size (max 16MB)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File quá lớn. Kích thước tối đa là 16MB');
      return;
    }

    this.file = file;
    this.showFileInfo(file);

    if (this.onFileSelect) {
      this.onFileSelect(file);
    }
  }

  showFileInfo(file) {
    const uploadArea = document.getElementById('upload-area');
    const fileSelected = document.getElementById('file-selected');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    uploadArea.style.display = 'none';
    fileSelected.style.display = 'block';

    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);
  }

  clearFile() {
    this.file = null;

    const uploadArea = document.getElementById('upload-area');
    const fileSelected = document.getElementById('file-selected');
    const fileInput = document.getElementById('file-input');

    uploadArea.style.display = 'flex';
    fileSelected.style.display = 'none';
    fileInput.value = '';

    if (this.onFileSelect) {
      this.onFileSelect(null);
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  getFile() {
    return this.file;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
