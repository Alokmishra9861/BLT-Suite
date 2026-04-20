class ApiResponse {
  constructor({
    data = null,
    message = "Operation successful",
    meta = null,
  } = {}) {
    this.success = true;
    this.data = data;
    this.message = message;
    if (meta) {
      this.meta = meta;
    }
  }
}

module.exports = ApiResponse;
