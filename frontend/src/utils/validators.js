export const isRequired = (value) => Boolean(value && String(value).trim());

export const isEmail = (value) => {
  return /\S+@\S+\.\S+/.test(value);
};
