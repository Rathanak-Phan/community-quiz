/**
 * categoryApi.js – thin re-export of categoryService using the shared axios instance.
 * Kept for backward-compatibility with components that import from here.
 */
export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
