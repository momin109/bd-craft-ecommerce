export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
