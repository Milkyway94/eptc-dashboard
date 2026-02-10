/**
 * Color scale utilities for heatmap
 */

// 5-level color scale
export const COLOR_SCALE = {
  0: '#f0f0f0',  // Không có việc - Xám nhạt
  1: '#b3e5fc',  // 1-2 việc - Xanh nhạt
  2: '#fff176',  // 3-4 việc - Vàng
  3: '#ffb74d',  // 5-7 việc - Cam
  4: '#e57373'   // 8+ việc - Đỏ
};

// Text colors for contrast
export const TEXT_COLORS = {
  0: '#666666',
  1: '#1976d2',
  2: '#f57f17',
  3: '#e65100',
  4: '#c62828'
};

/**
 * Calculate heat level based on task count
 */
export function calculateHeatLevel(taskCount) {
  if (taskCount === 0) return 0;
  if (taskCount <= 2) return 1;
  if (taskCount <= 4) return 2;
  if (taskCount <= 7) return 3;
  return 4; // 8+
}

/**
 * Get background color for a given task count
 */
export function getBackgroundColor(taskCount) {
  const level = calculateHeatLevel(taskCount);
  return COLOR_SCALE[level];
}

/**
 * Get text color for a given task count (for contrast)
 */
export function getTextColor(taskCount) {
  const level = calculateHeatLevel(taskCount);
  return TEXT_COLORS[level];
}

/**
 * Get label for heat level
 */
export function getHeatLevelLabel(level) {
  const labels = {
    0: 'Không có việc',
    1: 'Ít việc',
    2: 'Trung bình',
    3: 'Nhiều việc',
    4: 'Rất nhiều việc'
  };
  return labels[level] || '';
}

/**
 * Get color legend for heatmap
 */
export function getColorLegend() {
  return [
    { level: 0, color: COLOR_SCALE[0], label: 'Không có việc', range: '0' },
    { level: 1, color: COLOR_SCALE[1], label: 'Ít việc', range: '1-2' },
    { level: 2, color: COLOR_SCALE[2], label: 'Trung bình', range: '3-4' },
    { level: 3, color: COLOR_SCALE[3], label: 'Nhiều việc', range: '5-7' },
    { level: 4, color: COLOR_SCALE[4], label: 'Rất nhiều việc', range: '8+' }
  ];
}
