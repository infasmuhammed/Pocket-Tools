// Lightweight numeric validators for math tools.

export const Validate = {
  fileSize(file, maxSizeMB) {
    if (!file) return false;
    return file.size / (1024 * 1024) <= maxSizeMB;
  },
  fileType(file, allowedTypes) {
    if (!file) return false;
    return allowedTypes.includes(file.type);
  },
  number(value, { min = -Infinity, max = Infinity, allowEmpty = false } = {}) {
    if (value === '' || value == null) return allowEmpty;
    const n = Number(value);
    if (!Number.isFinite(n)) return false;
    return n >= min && n <= max;
  },
  positive(value) { return this.number(value, { min: 0 }); },
  integer(value, opts = {}) {
    if (!this.number(value, opts)) return false;
    return Number.isInteger(Number(value));
  },
};
