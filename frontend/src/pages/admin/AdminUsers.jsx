import { useMemo, useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { apiRequest, api } from "../../utils/api";
import * as Yup from "yup";
import { useAuth } from "../../context";
import { usePolling } from "../../hooks";

// Validation schema for creating user
const createUserValidationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, "Name must not exceed 100 characters")
    .nullable(),
  username: Yup.string()
    .required("Email is required")
    .email("Must be a valid email address")
    .max(100, "Email must not exceed 100 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(3, "Password must be at least 3 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  mobile: Yup.string()
    .matches(/^$|^\d{11}$/, "Mobile number must be exactly 10 digits")
    .nullable(),
  branch: Yup.string()
    .max(100, "Branch must not exceed 100 characters")
    .nullable(),
  department: Yup.string()
    .max(100, "Department must not exceed 100 characters")
    .nullable(),
});

// Validation schema for editing user (password optional)
const editUserValidationSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, "Name must not exceed 100 characters")
    .nullable(),
  username: Yup.string()
    .required("Email is required")
    .email("Must be a valid email address")
    .max(100, "Email must not exceed 100 characters"),
  password: Yup.string()
    .test("password-min", "Password must be at least 3 characters", function(value) {
      if (!value || value === "") return true;
      return value.length >= 3;
    }),
  confirmPassword: Yup.string()
    .test("passwords-match", "Passwords must match", function(value) {
      const { password } = this.parent;
      if (!password || password === "") return true;
      return value === password;
    }),
  mobile: Yup.string()
    .matches(/^$|^\d{11}$/, "Mobile number must be exactly 10 digits")
    .nullable(),
  branch: Yup.string()
    .max(100, "Branch must not exceed 100 characters")
    .nullable(),
  department: Yup.string()
    .max(100, "Department must not exceed 100 characters")
    .nullable(),
});

const AdminUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Users data state
  const [users, setUsers] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    branch: "",
    department: "",
  });

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({});

  const { admin } = useAuth();

  // Fetch users from API
  const fetchUsers = async (page = 1, search = "", { background = false } = {}) => {
    if (background) {
      setIsFetching(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) {
        params.append("search", search);
      }
      const response = await apiRequest(`/admin/users?${params.toString()}`);
      setUsers(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      if (background) {
        setIsFetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  usePolling(() => fetchUsers(pagination.currentPage, searchQuery, { background: true }), 5000);

  useEffect(() => {
    const loadRegistrationLookup = async () => {
      if (!isUserModalOpen) {
        return;
      }
      if (branchOptions.length > 0 && departmentOptions.length > 0) {
        return;
      }

      setLookupLoading(true);
      setLookupError("");

      try {
        const response = await api.get("/public/registration-data");
        if (response.success) {
          setBranchOptions(response.data?.branches || []);
          setDepartmentOptions(response.data?.departments || []);
        } else {
          setLookupError(response.message || "Failed to load branch and department options");
        }
      } catch (error) {
        setLookupError(error.message || "Failed to load branch and department options");
      } finally {
        setLookupLoading(false);
      }
    };

    loadRegistrationLookup();
  }, [isUserModalOpen, branchOptions.length, departmentOptions.length]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(1, searchQuery, { background: users.length > 0 });
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, users.length]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, searchQuery, { background: users.length > 0 });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      branch: "",
      department: "",
    });
    setFormError("");
    setFormSuccess("");
    setFieldErrors({});
  };

  const handleOpenModal = () => {
    resetForm();
    setIsEditMode(false);
    setEditingUserId(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setFormData({
      name: user.name || "",
      username: user.username || "",
      password: "",
      confirmPassword: "",
      mobile: user.mobile || "",
      branch: user.branch || "",
      department: user.department || "",
    });
    setFormError("");
    setFormSuccess("");
    setFieldErrors({});
    setIsEditMode(true);
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    resetForm();
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFieldErrors({});

    // Choose validation schema based on mode
    const validationSchema = isEditMode ? editUserValidationSchema : createUserValidationSchema;

    try {
      // Validate with Yup
      await validationSchema.validate(formData, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        const errors = {};
        validationError.inner.forEach((err) => {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Please fix the errors below");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name || null,
        username: formData.username,
        mobile: formData.mobile || null,
        branch: formData.branch || null,
        department: formData.department || null,
      };

      // Only include password if it's provided (required for create, optional for edit)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditMode) {
        // Update existing user
        await apiRequest(`/admin/users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setFormSuccess("User updated successfully!");
      } else {
        // Create new user
        await apiRequest("/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setFormSuccess(
          "User created successfully! They can now login with their credentials."
        );
      }

      setTimeout(() => {
        handleCloseModal();
        // Refresh users list
        fetchUsers(pagination.currentPage, searchQuery);
      }, 2000);
    } catch (error) {
      setFormError(error.message || (isEditMode ? "Failed to update user" : "Failed to create user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u.id));
      setSelectAll(true);
    } else {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      if (newSelected.length === users.length) {
        setSelectAll(true);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#28392f] px-6 lg:px-10 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-white text-lg font-bold">ManageSys</h2>
          </div>

          {/* Search (Desktop) */}
          <div className="hidden md:flex w-full max-w-md items-center">
            <label className="flex w-full cursor-text items-center rounded-xl bg-[#1d2d25] border border-transparent focus-within:border-primary/50 transition-colors h-10 px-3">
              <span className="material-symbols-outlined text-[#9cbaa8]">
                search
              </span>
              <input
                className="w-full bg-transparent px-3 text-sm text-white placeholder-[#9cbaa8] focus:outline-none"
                placeholder="Global Search..."
              />
            </label>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative flex items-center justify-center rounded-xl bg-[#28392f] hover:bg-[#344a3d] text-white p-2 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-[#28392f]"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#28392f]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-[#9cbaa8]">Administrator</p>
              </div>
              <div className="relative size-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center border-2 border-[#28392f] shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">
                  person
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8 lg:px-12 scroll-smooth">
          <div className="mx-auto max-w-7xl flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <a
                className="text-[#9cbaa8] hover:text-primary transition-colors flex items-center gap-1"
                href="#"
              >
                <span className="material-symbols-outlined text-[18px]">
                  home
                </span>
                Home
              </a>
              <span className="text-[#9cbaa8]">/</span>
              <a
                className="text-[#9cbaa8] hover:text-primary transition-colors"
                href="#"
              >
                Admin
              </a>
              <span className="text-[#9cbaa8]">/</span>
              <span className="text-primary font-medium">System Users</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  System Users
                </h1>
                <p className="text-[#9cbaa8] mt-2">
                  Manage user access, roles, and account statuses.
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] px-5 py-3 font-bold transition-all shadow-[0_0_15px_rgba(61,245,135,0.2)] hover:shadow-[0_0_20px_rgba(61,245,135,0.4)]"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add New User</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5 lg:col-span-6">
                <label className="flex h-12 w-full items-center rounded-xl bg-surface-dark border border-[#28392f] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all px-4 shadow-sm">
                  <span className="material-symbols-outlined text-[#9cbaa8] mr-3">
                    search
                  </span>
                  <input
                    className="flex-1 bg-transparent text-white placeholder-[#5a7063] focus:outline-none text-base"
                    placeholder="Search by Name, Email, Mobile, Branch or Department"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[#9cbaa8] hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  )}
                </label>
              </div>
            </div>

            {/* Data Table */}
            <div className="admin-table-shell rounded-2xl overflow-hidden">
              <div className={`px-6 py-3 text-xs text-[#9cbaa8] border-b border-[#28392f] bg-[#111814] transition-opacity duration-200 ${isFetching && !loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                Refreshing users...
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#15261d] text-[#9cbaa8] text-xs uppercase tracking-wider font-semibold">
                      <th className="p-4 border-b border-[#28392f] w-12">
                        <input
                          className="rounded border-gray-600 bg-[#28392f] text-primary focus:ring-offset-[#102217]"
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 border-b border-[#28392f]">ID</th>
                      <th className="p-4 border-b border-[#28392f]">Name</th>
                      <th className="p-4 border-b border-[#28392f]">Email</th>
                      <th className="p-4 border-b border-[#28392f]">Mobile</th>
                      <th className="p-4 border-b border-[#28392f]">Branch</th>
                      <th className="p-4 border-b border-[#28392f]">Department</th>
                      <th className="p-4 border-b border-[#28392f]">Auth</th>
                      <th className="p-4 border-b border-[#28392f] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#28392f]">
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span className="text-[#9cbaa8]">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-[48px] text-[#5a7063]">
                              person_off
                            </span>
                            <span className="text-[#9cbaa8]">
                              {searchQuery ? "No users found matching your search" : "No users found"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-[#1d3326] transition-colors group"
                        >
                          <td className="p-4">
                            <input
                              className="rounded border-gray-600 bg-[#28392f] text-primary focus:ring-0 focus:ring-offset-0"
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </td>
                          <td className="p-4 text-white font-mono text-xs">
                            {user.id}
                          </td>
                          <td className="p-4 text-white font-medium">
                            <div className="flex flex-col">
                              <span>{user.name || "-"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-[#9cbaa8]">
                            {user.username}
                          </td>
                          <td className="p-4 text-[#9cbaa8]">
                            {user.mobile || "-"}
                          </td>
                          <td className="p-4 text-[#9cbaa8]">
                            {user.branch || "-"}
                          </td>
                          <td className="p-4 text-[#9cbaa8]">
                            {user.department || "-"}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.auth_provider === 'microsoft' 
                                ? 'bg-blue-500/10 text-blue-400' 
                                : 'bg-green-500/10 text-green-400'
                            }`}>
                              {user.auth_provider === 'microsoft' ? 'Microsoft' : 'Local'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
                                title="View Details"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  visibility
                                </span>
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-2 text-[#9cbaa8] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  edit
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {!loading && users.length > 0 && (
                <div className="admin-table-footer flex items-center justify-between border-t px-4 py-3 sm:px-6">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-[#9cbaa8]">
                        Showing{" "}
                        <span className="font-medium text-white">
                          {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-white">
                          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-white">
                          {pagination.totalItems}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        aria-label="Pagination"
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      >
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#9cbaa8]"
                        >
                          <span className="sr-only">Previous</span>
                          <span className="material-symbols-outlined text-[20px]">
                            chevron_left
                          </span>
                        </button>
                        {getPageNumbers().map((pageNum, index) => (
                          pageNum === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9cbaa8] ring-1 ring-inset ring-[#28392f]"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 ${
                                pageNum === pagination.currentPage
                                  ? "z-10 bg-primary/10 text-primary ring-primary/30"
                                  : "text-[#9cbaa8] ring-[#28392f] hover:bg-[#28392f] hover:text-white"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        ))}
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#9cbaa8]"
                        >
                          <span className="sr-only">Next</span>
                          <span className="material-symbols-outlined text-[20px]">
                            chevron_right
                          </span>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Mobile Pagination */}
                  <div className="flex items-center justify-between w-full sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center rounded-lg border border-[#28392f] bg-[#1d2d25] px-4 py-2 text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#9cbaa8]">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-lg border border-[#28392f] bg-[#1d2d25] px-4 py-2 text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#28392f]">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center size-10 rounded-xl ${isEditMode ? 'bg-blue-500/10' : 'bg-primary/10'}`}>
                  <span className={`material-symbols-outlined ${isEditMode ? 'text-blue-400' : 'text-primary'}`}>
                    {isEditMode ? 'edit' : 'person_add'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditMode ? 'Edit User' : 'Add New User'}
                  </h2>
                  <p className="text-sm text-[#9cbaa8]">
                    {isEditMode ? 'Update user account details' : 'Create a new user account'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmitUser}
              className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              {/* Error Message */}
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-[20px]">
                    error
                  </span>
                  <span className="text-red-400 text-sm">{formError}</span>
                </div>
              )}

              {/* Success Message */}
              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>
                  <span className="text-primary text-sm">{formSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                    }`}
                    placeholder="Enter full name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email (Username) */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.username
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                    }`}
                    placeholder="user@example.com"
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                      Password {!isEditMode && <span className="text-red-400">*</span>}
                      {isEditMode && <span className="text-[#5a7063] text-xs ml-1">(leave blank to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${
                        fieldErrors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                      }`}
                      placeholder={isEditMode ? "Enter new password" : "Min 3 characters"}
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-400">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                      Confirm Password {!isEditMode && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${
                        fieldErrors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                      }`}
                      placeholder="Re-enter password"
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${
                      fieldErrors.mobile
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                    }`}
                    placeholder="07xxxxxxxx"
                    maxLength={10}
                  />
                  {fieldErrors.mobile && (
                    <p className="mt-1 text-xs text-red-400">
                      {fieldErrors.mobile}
                    </p>
                  )}
                </div>

                {/* Branch & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      disabled={lookupLoading}
                      className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.branch
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                      }`}
                    >
                      <option value="">{lookupLoading ? "Loading branches..." : "Select branch"}</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.branch && (
                      <p className="mt-1 text-xs text-red-400">
                        {fieldErrors.branch}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={lookupLoading}
                      className={`w-full h-11 px-4 rounded-xl bg-[#1d2d25] border text-white focus:outline-none focus:ring-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        fieldErrors.department
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-[#28392f] focus:border-primary/50 focus:ring-primary/50"
                      }`}
                    >
                      <option value="">{lookupLoading ? "Loading departments..." : "Select department"}</option>
                      {departmentOptions.map((department) => (
                        <option key={department.id} value={department.name}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.department && (
                      <p className="mt-1 text-xs text-red-400">
                        {fieldErrors.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[#28392f]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-[#9cbaa8] hover:text-white hover:bg-[#28392f] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEditMode 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                      : 'bg-primary hover:bg-[#32d473] text-[#102217] shadow-[0_0_15px_rgba(61,245,135,0.2)] hover:shadow-[0_0_20px_rgba(61,245,135,0.4)]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        {isEditMode ? 'save' : 'person_add'}
                      </span>
                      <span>{isEditMode ? 'Save Changes' : 'Create User'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
