const pick = (obj, keys) => {
  if (!obj) return {};
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

module.exports = {
  pick,
};
