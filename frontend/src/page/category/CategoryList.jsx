import { useState, useEffect, useCallback } from "react";
import { getCategories, deleteCategory } from "../../api/categoryApi";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import ConfirmDeleteModal from "../../components/category/ConfirmDeleteModal";
import Toast from "../../components/ui/Toast";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Delete state
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditData(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditData(category);
    setFormModalOpen(true);
  };

  const handleFormSuccess = (message) => {
    showToast(message);
    fetchCategories();
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({ open: true, id: category.id, name: category.name });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteModal.id);
      setDeleteModal({ open: false, id: null, name: "" });
      showToast("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      setDeleteModal({ open: false, id: null, name: "" });
      showToast(
        err.response?.data?.message || "Failed to delete category.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage quiz categories and organize content by topic.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Create Category
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Card */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">
              📂
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "—" : categories.length}
              </p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Fetch Error */}
          {fetchError && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-600 text-sm">
              ⚠ {fetchError}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-4 bg-gray-200 rounded w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-gray-700 font-semibold text-lg mb-1">
                No categories yet
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Get started by creating your first category.
              </p>
              <button
                onClick={handleOpenCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                + Create Category
              </button>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      #
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Category Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Description
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Created By
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Created Date
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat, idx) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {cat.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs">
                        <span className="line-clamp-2">
                          {cat.description || (
                            <span className="italic text-gray-300">
                              No description
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-semibold leading-none">
                            {(cat.created_by || cat.createdBy || "A")?.[0]?.toUpperCase()}
                          </span>
                          {cat.created_by || cat.createdBy || "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(cat.created_at || cat.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H8v-2.414A2 2 0 018.586 12z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            title="Delete"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1H9a1 1 0 00-1 1H5m14 0H5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        categoryName={deleteModal.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: "" })}
        loading={deleteLoading}
      />
    </div>
  );
}

export default CategoryList;
