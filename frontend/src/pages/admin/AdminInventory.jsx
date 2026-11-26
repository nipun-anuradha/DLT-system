import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useAuth } from '../../context';
import { usePolling } from '../../hooks';
import api, { getAdminToken } from '../../utils/api';
import { API_BASE_URL } from '../../utils/constants';
import { branchValuesMatch, normalizeBranchValue } from '../../utils/locationUtils.mjs';

const typeLabels = {
  pc: 'PC',
  printer: 'Printer',
  mobile: 'Mobile',
  dongle: 'Dongle',
  other: 'Other',
};

const statusLabels = {
  available: 'Available',
  assigned: 'Assigned',
  repair: 'Repair',
  retired: 'Retired',
};

const defaultItemForm = {
  item_type: '',
  name: '',
  model: '',
  serial_number: '',
  asset_tag: '',
  specs: '',
  status: 'available',
  assigned_user_id: '',
  assigned_department: '',
  assigned_branch: '',
  location: '',
  notes: '',
};

const defaultTransferForm = {
  to_user_id: '',
  to_department: '',
  to_branch: '',
  model: '',
  notes: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatSerialNumber = (value) => {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!match) return normalized || '-';

  const [, sign, integerPart, fractionalPart = '', exponentText] = match;
  const digits = `${integerPart}${fractionalPart}`;
  const decimalIndex = integerPart.length + Number(exponentText);

  if (decimalIndex <= 0) return `${sign}0.${'0'.repeat(-decimalIndex)}${digits}`;
  if (decimalIndex >= digits.length) return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`;
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
};

const badgeClass = (status) => {
  switch (status) {
    case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'assigned': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'repair': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'retired': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const AdminInventory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalItems: 0,
    availableItems: 0,
    assignedItems: 0,
    repairItems: 0,
    retiredItems: 0,
    groupedByType: [],
  });
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetTypesLoading, setAssetTypesLoading] = useState(false);
  const [assetTypesError, setAssetTypesError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [itemForm, setItemForm] = useState(defaultItemForm);
  const [transferForm, setTransferForm] = useState(defaultTransferForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);
  const [importFeedback, setImportFeedback] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);
  const { admin } = useAuth();

  const filteredBranches = useMemo(() => {
    if (branchOptions && branchOptions.length > 0) return branchOptions;
    return [...new Set(users.map((user) => user.branch).filter(Boolean))].sort();
  }, [users, branchOptions]);

  const filteredDepartments = useMemo(() => {
    if (departmentOptions && departmentOptions.length > 0) return departmentOptions;
    return [...new Set(users.map((user) => user.department).filter(Boolean))].sort();
  }, [users, departmentOptions]);
  
  const modelOptions = useMemo(() => {
    return [...new Set(items.map((item) => item.model).filter(Boolean))].sort();
  }, [items]);

  const assetTypeLabels = useMemo(() => {
    return assetTypes.reduce((acc, assetType) => {
      acc[assetType.name] = assetType.name;
      return acc;
    }, {});
  }, [assetTypes]);

  const getAssetTypeLabel = (type) => {
    return assetTypeLabels[type] || typeLabels[type] || type;
  };

  const availableUsersForItem = useMemo(() => {
    return users.filter((u) => {
      if (itemForm.assigned_branch && !branchValuesMatch(u.branch, itemForm.assigned_branch)) return false;
      if (itemForm.assigned_department && u.department !== itemForm.assigned_department) return false;
      return true;
    });
  }, [users, itemForm.assigned_branch, itemForm.assigned_department]);

  const availableUsersForTransfer = useMemo(() => {
    return users.filter((u) => {
      if (transferForm.to_branch && !branchValuesMatch(u.branch, transferForm.to_branch)) return false;
      if (transferForm.to_department && u.department !== transferForm.to_department) return false;
      return true;
    });
  }, [users, transferForm.to_branch, transferForm.to_department]);

  const fetchSummary = useCallback(async () => {
    const response = await api.get('/admin/inventory/summary');
    if (response.success) {
      setSummary(response.data);
    }
  }, []);

  const fetchAssetTypes = useCallback(async () => {
    setAssetTypesLoading(true);
    setAssetTypesError('');

    try {
      const response = await api.get('/admin/inventory/asset-types');
      if (response.success) {
        setAssetTypes(response.data || []);
      } else {
        setAssetTypesError(response.message || 'Failed to load asset types');
      }
    } catch (error) {
      setAssetTypesError(error.message || 'Failed to load asset types');
    } finally {
      setAssetTypesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const response = await api.get('/admin/users?limit=200&page=1');
    if (response.success) {
      setUsers(response.data || []);
    }
  }, []);

  const fetchRegistrationData = useCallback(async () => {
    try {
      const response = await api.get('/public/registration-data');
      if (response.success) {
        const branches = (response.data?.branches || []).map((b) => b.name).filter(Boolean).sort();
        const departments = (response.data?.departments || []).map((d) => d.name).filter(Boolean).sort();
        setBranchOptions(branches);
        setDepartmentOptions(departments);
      }
    } catch (error) {
      // ignore - we'll fall back to deriving from users
    }
  }, []);

  const fetchItems = useCallback(async (opts = { background: false }) => {
    const { background } = opts;
    if (background) {
      setIsRefreshing(true);
    }

    const params = new URLSearchParams({ page: '1', limit: '100' });
    const query = searchInput.trim();
    if (query) params.append('search', query);
    if (typeFilter !== 'all') params.append('type', typeFilter);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (branchFilter !== 'all') params.append('branch', branchFilter);
    if (departmentFilter !== 'all') params.append('department', departmentFilter);
    if (userFilter) params.append('userId', userFilter);

    try {
      const response = await api.get(`/admin/inventory/items?${params.toString()}`);
      if (response.success) {
        const nextItems = response.data || [];
        setItems(nextItems);
        setSelectedItem((currentSelectedItem) => {
          if (currentSelectedItem && nextItems.some((item) => item.id === currentSelectedItem.id)) {
            return currentSelectedItem;
          }
          return nextItems[0] || null;
        });
      }
    } finally {
      if (background) setIsRefreshing(false);
    }
  }, [branchFilter, departmentFilter, searchInput, statusFilter, typeFilter, userFilter]);

  const fetchSelectedItemHistory = useCallback(async (itemId) => {
    if (!itemId) {
      setSelectedItemHistory(null);
      return;
    }

    const response = await api.get(`/admin/inventory/items/${itemId}/history`);
    if (response.success) {
      setSelectedItemHistory(response.data);
    }
  }, []);

  const fetchSelectedUserHistory = useCallback(async (userId) => {
    if (!userId) {
      setSelectedUserHistory(null);
      return;
    }

    const response = await api.get(`/admin/inventory/users/${userId}/history`);
    if (response.success) {
      setSelectedUserHistory(response.data);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSummary(), fetchUsers(), fetchItems(), fetchAssetTypes(), fetchRegistrationData()]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const userIdFromQuery = searchParams.get('userId');
    if (userIdFromQuery && users.length > 0) {
      const user = users.find((entry) => String(entry.id) === String(userIdFromQuery));
      if (user) {
        setSelectedUser(user);
        setUserFilter(String(user.id));
      }
    }
  }, [searchParams, users]);

  useEffect(() => {
    const itemIdFromQuery = searchParams.get('itemId');
    if (itemIdFromQuery && items.length > 0) {
      const item = items.find((entry) => String(entry.id) === String(itemIdFromQuery));
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [items, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems({ background: items.length > 0 });
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchItems, items.length]);

  usePolling(() => {
    fetchSummary();
    fetchItems();
    if (selectedItem?.id) fetchSelectedItemHistory(selectedItem.id);
    if (selectedUser?.id) fetchSelectedUserHistory(selectedUser.id);
  }, 10000);

  useEffect(() => {
    if (selectedItem?.id) {
      fetchSelectedItemHistory(selectedItem.id);
    } else {
      setSelectedItemHistory(null);
    }
  }, [fetchSelectedItemHistory, selectedItem?.id]);

  useEffect(() => {
    if (selectedUser?.id) {
      fetchSelectedUserHistory(selectedUser.id);
    } else {
      setSelectedUserHistory(null);
    }
  }, [fetchSelectedUserHistory, selectedUser?.id]);

  const resetForms = () => {
    setItemForm(defaultItemForm);
    setTransferForm(defaultTransferForm);
    setEditingItemId(null);
    setFormError('');
    setFormSuccess('');
  };

  const openCreateModal = () => {
    resetForms();
    setItemForm((current) => ({
      ...current,
      item_type: assetTypes.length > 0 ? assetTypes[0].name : '',
    }));
    setItemModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      item_type: item.item_type || 'other',
      name: item.name || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      asset_tag: item.asset_tag || '',
      specs: item.specs || '',
      status: item.status || 'available',
      assigned_user_id: item.assigned_user_id || '',
      assigned_department: item.assigned_department || '',
      assigned_branch: item.assigned_branch || '',
      location: item.location || '',
      notes: item.notes || '',
    });
    setFormError('');
    setFormSuccess('');
    setItemModalOpen(true);
  };

  const openTransferModal = (item) => {
    setSelectedItem(item);
    setTransferForm({
      to_user_id: item.assigned_user_id || '',
      to_department: item.assigned_department || '',
      to_branch: item.assigned_branch || '',
      model: item.model || '',
      notes: '',
    });
    setFormError('');
    setFormSuccess('');
    setTransferModalOpen(true);
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportingCsv(true);
    setImportFeedback({ type: '', message: '' });
    setFormError('');
    setFormSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/admin/inventory/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to import CSV');
      }

      setImportFeedback({
        type: 'success',
        message: `Imported ${result.data.createdCount || 0} new asset(s) and updated ${result.data.updatedCount || 0} existing asset(s).`,
      });
      await Promise.all([fetchSummary(), fetchUsers(), fetchItems(), fetchAssetTypes()]);
    } catch (error) {
      setImportFeedback({
        type: 'error',
        message: error.message || 'Failed to import CSV',
      });
    } finally {
      setImportingCsv(false);
      event.target.value = '';
    }
  };

  const handleCsvExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/inventory/export`, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to export inventory CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inventory-export.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setImportFeedback({ type: 'success', message: 'Inventory export downloaded successfully.' });
    } catch (error) {
      setImportFeedback({ type: 'error', message: error.message || 'Failed to export CSV' });
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserFilter(String(user.id));
    setSearchParams((params) => {
      params.set('userId', String(user.id));
      params.delete('itemId');
      return params;
    });
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setSearchParams((params) => {
      params.set('itemId', String(item.id));
      params.delete('userId');
      return params;
    });
  };

  const handleAssignedUserChange = (value) => {
    const user = users.find((u) => String(u.id) === String(value));
    setItemForm((current) => ({
      ...current,
      assigned_user_id: value || '',
      assigned_department: user ? user.department || '' : '',
      assigned_branch: user ? normalizeBranchValue(user.branch) || '' : '',
    }));
  };

  const handleTransferUserChange = (value) => {
    const user = users.find((u) => String(u.id) === String(value));
    setTransferForm((current) => ({
      ...current,
      to_user_id: value || '',
      to_department: user ? user.department || '' : '',
      to_branch: user ? normalizeBranchValue(user.branch) || '' : '',
    }));
  };

  const openAssetRouteModal = (item) => {
    selectItem(item);
    setDetailModalOpen(true);
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        ...itemForm,
        assigned_user_id: itemForm.assigned_user_id || null,
        assigned_department: itemForm.assigned_department || null,
        assigned_branch: itemForm.assigned_branch || null,
      };

      if (editingItemId) {
        await api.put(`/admin/inventory/items/${editingItemId}`, payload);
        setFormSuccess('Inventory item updated successfully.');
      } else {
        await api.post('/admin/inventory/items', payload);
        setFormSuccess('Inventory item created successfully.');
      }

      await Promise.all([fetchSummary(), fetchItems()]);
      setTimeout(() => {
        setItemModalOpen(false);
        resetForms();
      }, 700);
    } catch (error) {
      setFormError(error.message || 'Failed to save inventory item');
    } finally {
      setSaving(false);
    }
  };

  const handleTransferSubmit = async (event) => {
    event.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    setFormError('');
    setFormSuccess('');

    try {
      await api.post(`/admin/inventory/items/${selectedItem.id}/transfer`, {
        ...transferForm,
        to_user_id: transferForm.to_user_id || null,
        to_department: transferForm.to_department || null,
        to_branch: transferForm.to_branch || null,
      });

      setFormSuccess('Transfer saved successfully.');
      await Promise.all([fetchSummary(), fetchItems(), fetchSelectedItemHistory(selectedItem.id)]);
      setTimeout(() => {
        setTransferModalOpen(false);
        setFormSuccess('');
      }, 700);
    } catch (error) {
      setFormError(error.message || 'Failed to transfer item');
    } finally {
      setSaving(false);
    }
  };

  const selectedUserAssets = selectedUserHistory?.currentItems || [];
  const selectedUserTransfers = selectedUserHistory?.transferHistory || [];
  const selectedItemTransfers = selectedItemHistory?.transfers || [];
  const currentHeldBy = selectedItemHistory?.item?.assignedUser || selectedItem?.assignedUser || null;

  const renderTimelineCard = (entry, index) => {
    const fromName = entry.fromUser?.name || entry.from_department || entry.from_branch || 'Stock';
    const toName = entry.toUser?.name || entry.to_department || entry.to_branch || 'Unassigned';

    return (
      <div key={`${entry.id}-${index}`} className="rounded-2xl border border-[#28392f] bg-[#111814] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{fromName} → {toName}</p>
            <p className="text-[#9cbaa8] text-sm mt-1">{entry.item?.name || selectedItemHistory?.item?.name || 'Asset'}</p>
            {entry.notes && <p className="text-[#9cbaa8] text-sm mt-2 whitespace-pre-line">{entry.notes}</p>}
          </div>
          <span className="text-xs text-[#9cbaa8] whitespace-nowrap">{formatDateTime(entry.transferred_at || entry.createdAt)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-background-dark text-white font-display h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-[#9cbaa8]">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
        <header className="h-16 flex items-center justify-between border-b border-[#28392f] px-6 lg:px-8 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-white text-lg font-bold">Inventory</h2>
          </div>

          <div className="hidden lg:flex items-center max-w-md w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9cbaa8]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#28392f] rounded-xl leading-5 bg-[#162b20] text-gray-300 placeholder-[#9cbaa8] focus:outline-none focus:bg-[#1f382a] focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                placeholder="Search asset, model, serial, asset id, department, location, or user..."
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvImport} />
            <button onClick={() => fileInputRef.current?.click()} disabled={importingCsv} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#28392f] bg-[#111814] px-4 py-2 font-semibold text-white transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>{importingCsv ? 'Importing...' : 'Import CSV'}</span>
            </button>
            <button onClick={handleCsvExport} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#28392f] bg-[#111814] px-4 py-2 font-semibold text-white transition-colors hover:border-primary hover:text-primary">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Export CSV</span>
            </button>
            <button onClick={openCreateModal} className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] px-4 py-2 font-bold transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add Asset</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#28392f]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-[#9cbaa8]">Administrator</p>
              </div>
              <div className="relative size-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center border-2 border-[#28392f] shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">inventory_2</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <nav className="flex text-sm text-[#9cbaa8]">
                <span className="hover:text-primary transition-colors">Admin</span>
                <span className="mx-2">/</span>
                <span className="text-white">Inventory</span>
              </nav>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">Asset Registry</h1>
                  <p className="text-[#9cbaa8]">Browse and manage assets with model, serial, location, and user details in one registry.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => fileInputRef.current?.click()} disabled={importingCsv} className="inline-flex sm:hidden items-center justify-center gap-2 rounded-xl border border-[#28392f] bg-[#111814] px-4 py-2 font-semibold text-white transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    <span>{importingCsv ? 'Importing...' : 'Import CSV'}</span>
                  </button>
                  <button onClick={handleCsvExport} className="inline-flex sm:hidden items-center justify-center gap-2 rounded-xl border border-[#28392f] bg-[#111814] px-4 py-2 font-semibold text-white transition-colors hover:border-primary hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Export CSV</span>
                  </button>
                  <button onClick={openCreateModal} className="inline-flex sm:hidden items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] px-4 py-2 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Add Asset</span>
                  </button>
                </div>
              </div>
            </div>

            {importFeedback.message && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${importFeedback.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'}`}>
                {importFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {[
                { label: 'Total Assets', value: summary.totalItems },
                { label: 'Available', value: summary.availableItems, tone: 'green' },
                { label: 'Assigned', value: summary.assignedItems, tone: 'blue' },
                { label: 'Repair', value: summary.repairItems, tone: 'amber' },
                { label: 'Retired', value: summary.retiredItems, tone: 'slate' },
              ].map((card) => (
                <div key={card.label} className="bg-surface-dark border border-[#28392f] rounded-2xl p-5">
                  <p className="text-[#9cbaa8] text-sm font-medium">{card.label}</p>
                  <h3 className={`text-2xl font-bold mt-2 ${card.tone === 'green' ? 'text-emerald-400' : card.tone === 'blue' ? 'text-blue-400' : card.tone === 'amber' ? 'text-amber-400' : 'text-white'}`}>{card.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 items-start">
              <div className="bg-surface-dark border border-[#28392f] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#28392f] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-[#9cbaa8]">Asset Registry</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['All Items', 'PCs', 'Printers', 'Mobile', 'Dongles'].map((tab) => (
                        <button key={tab} type="button" className="rounded-full border border-[#28392f] px-3 py-1 text-xs text-[#9cbaa8] hover:border-primary hover:text-white transition-colors">{tab}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select value={typeFilter} onChange={(event) => {
                        setTypeFilter(event.target.value);
                        if (selectedUser) {
                          setSelectedUser(null);
                          setUserFilter('');
                          setSearchParams((params) => {
                            params.delete('userId');
                            return params;
                          });
                        }
                      }} className="bg-[#111814] border border-[#28392f] rounded-lg px-3 py-2 text-sm text-white">
                      <option value="all">All Types</option>
                      {assetTypes.length > 0 ? (
                        assetTypes.map((type) => (
                          <option key={type.name} value={type.name}>{type.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>{assetTypesLoading ? 'Loading asset types...' : 'No asset types available'}</option>
                      )}
                    </select>
                    <select value={statusFilter} onChange={(event) => {
                        setStatusFilter(event.target.value);
                        if (selectedUser) {
                          setSelectedUser(null);
                          setUserFilter('');
                          setSearchParams((params) => {
                            params.delete('userId');
                            return params;
                          });
                        }
                      }} className="bg-[#111814] border border-[#28392f] rounded-lg px-3 py-2 text-sm text-white">
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="repair">Repair</option>
                      <option value="retired">Retired</option>
                    </select>
                    <select value={branchFilter} onChange={(event) => {
                        setBranchFilter(event.target.value);
                        if (selectedUser) {
                          setSelectedUser(null);
                          setUserFilter('');
                          setSearchParams((params) => {
                            params.delete('userId');
                            return params;
                          });
                        }
                      }} className="bg-[#111814] border border-[#28392f] rounded-lg px-3 py-2 text-sm text-white">
                      <option value="all">All Branches</option>
                      {filteredBranches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                    <select value={departmentFilter} onChange={(event) => {
                        setDepartmentFilter(event.target.value);
                        if (selectedUser) {
                          setSelectedUser(null);
                          setUserFilter('');
                          setSearchParams((params) => {
                            params.delete('userId');
                            return params;
                          });
                        }
                      }} className="bg-[#111814] border border-[#28392f] rounded-lg px-3 py-2 text-sm text-white">
                      <option value="all">All Departments</option>
                      {filteredDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
                    </select>
                    <select value={userFilter} onChange={(event) => {
                        const value = event.target.value;
                        setUserFilter(value);
                        if (!value && selectedUser) {
                          setSelectedUser(null);
                          setSearchParams((params) => {
                            params.delete('userId');
                            return params;
                          });
                        }
                      }} className="bg-[#111814] border border-[#28392f] rounded-lg px-3 py-2 text-sm text-white">
                      <option value="">All Users</option>
                      {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.username}</option>)}
                    </select>
                  </div>
                </div>

                <div className={`px-0 transition-all`}>
                  <div className={`px-6 py-3 text-sm text-[#9cbaa8] border-b border-[#28392f] bg-[#111814] transition-opacity duration-200 ${isRefreshing && !loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    Refreshing assets...
                  </div>
                  <div className="overflow-x-auto">
                  <table className="admin-table w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#111814] text-[#9cbaa8] text-xs uppercase tracking-wider">
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Asset</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Model</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Serial</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Asset ID</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Department</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Location / Branch</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Current User</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f]">Status</th>
                        <th className="px-5 py-4 font-medium border-b border-[#28392f] text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[#28392f]">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-5 py-10 text-center text-[#9cbaa8]">No assets found</td>
                        </tr>
                      ) : items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#1f382a] transition-colors cursor-pointer" onClick={() => openAssetRouteModal(item)}>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-white font-semibold">{item.name}</span>
                              <span className="text-xs text-[#9cbaa8] uppercase tracking-wider">{getAssetTypeLabel(item.item_type)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#9cbaa8]">{item.model || '-'}</td>
                          <td className="px-5 py-4 text-[#9cbaa8] font-mono text-xs">{formatSerialNumber(item.serial_number)}</td>
                          <td className="px-5 py-4 text-[#9cbaa8] font-mono text-xs">{item.asset_tag || '-'}</td>
                          <td className="px-5 py-4 text-[#9cbaa8]">{item.assigned_department || item.assignedUser?.department || '-'}</td>
                          <td className="px-5 py-4 text-[#9cbaa8]">{item.location || item.assigned_branch || item.assignedUser?.branch || '-'}</td>
                          <td className="px-5 py-4">
                            {item.assignedUser ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  selectUser(item.assignedUser);
                                }}
                                className="text-white font-medium hover:text-primary transition-colors"
                              >
                                {item.assignedUser.name || item.assignedUser.username}
                              </button>
                            ) : (
                              <span className="text-[#9cbaa8]">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass(item.status)}`}>{statusLabels[item.status] || item.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={(event) => { event.stopPropagation(); openEditModal(item); }} className="p-2 rounded-lg text-[#9cbaa8] hover:text-white hover:bg-[#28392f] transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                              <button onClick={(event) => { event.stopPropagation(); openTransferModal(item); }} className="p-2 rounded-lg text-[#9cbaa8] hover:text-primary hover:bg-primary/10 transition-colors"><span className="material-symbols-outlined text-[20px]">sync_alt</span></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

              {/* Right-column modules removed: User Asset History, Asset Route, Type Split */}
            </div>
          </div>
        </main>
      </div>

      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setItemModalOpen(false)} />
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#28392f]">
              <div>
                <h2 className="text-xl font-bold text-white">{editingItemId ? 'Edit Asset' : 'Add Asset'}</h2>
                <p className="text-sm text-[#9cbaa8]">Keep the database aligned with current ownership and location.</p>
              </div>
              <button onClick={() => setItemModalOpen(false)} className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4" onSubmit={handleItemSubmit}>
              {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}
              {formSuccess && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{formSuccess}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Asset type</span>
                  <select value={itemForm.item_type} onChange={(event) => setItemForm((current) => ({ ...current, item_type: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    {assetTypes.length > 0 ? (
                      assetTypes.map((type) => (
                        <option key={type.name} value={type.name}>{type.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>{assetTypesLoading ? 'Loading asset types...' : 'No asset types available'}</option>
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Status</span>
                  <select value={itemForm.status} onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="repair">Repair</option>
                    <option value="retired">Retired</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Asset name</span>
                  <input value={itemForm.name} onChange={(event) => setItemForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white" placeholder="Asset name" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Model</span>
                  <input value={itemForm.model} onChange={(event) => setItemForm((current) => ({ ...current, model: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white" placeholder="Model" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Serial number</span>
                  <input value={itemForm.serial_number} onChange={(event) => setItemForm((current) => ({ ...current, serial_number: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white" placeholder="Serial number" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Asset ID</span>
                  <input value={itemForm.asset_tag} onChange={(event) => setItemForm((current) => ({ ...current, asset_tag: event.target.value }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white" placeholder="Asset ID / Asset tag" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-[#9cbaa8]">Specs</span>
                <textarea value={itemForm.specs} onChange={(event) => setItemForm((current) => ({ ...current, specs: event.target.value }))} rows={3} className="mt-1 w-full px-4 py-3 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white resize-none" placeholder="Basic specs: CPU, RAM, storage, OS, etc." />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Branch</span>
                  <select value={itemForm.assigned_branch} onChange={(event) => setItemForm((current) => ({ ...current, assigned_branch: event.target.value, assigned_department: '', assigned_user_id: '' }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Select branch</option>
                    {filteredBranches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Department</span>
                  <select value={itemForm.assigned_department} onChange={(event) => setItemForm((current) => ({ ...current, assigned_department: event.target.value, assigned_user_id: '' }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Select department</option>
                    {filteredDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Assigned user</span>
                  <select value={itemForm.assigned_user_id} onChange={(event) => handleAssignedUserChange(event.target.value)} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Assign to user</option>
                    {availableUsersForItem.map((user) => <option key={user.id} value={user.id}>{user.name || user.username}</option>)}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-[#9cbaa8]">Notes</span>
                <textarea value={itemForm.notes} onChange={(event) => setItemForm((current) => ({ ...current, notes: event.target.value }))} rows={2} className="mt-1 w-full px-4 py-3 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white resize-none" placeholder="Notes" />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#28392f]">
                <button type="button" onClick={() => setItemModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[#9cbaa8] hover:text-white hover:bg-[#28392f] font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] font-bold disabled:opacity-50">{saving ? 'Saving...' : editingItemId ? 'Save Asset' : 'Create Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#28392f]">
              <div>
                <h2 className="text-xl font-bold text-white">Asset Route</h2>
                <p className="text-sm text-[#9cbaa8]">Review the selected asset's transfer history and current status.</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="rounded-2xl border border-[#28392f] bg-[#111814] p-5">
                <p className="text-white font-semibold text-lg">{selectedItem.name}</p>
                <p className="text-[#9cbaa8] text-sm mt-2">{selectedItem.model || '-'} • {selectedItem.serial_number || '-'} • {selectedItem.asset_tag || '-'}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-[#9cbaa8]">
                  <div><span className="block text-[#9cbaa8]">Status</span><span className="text-white">{statusLabels[selectedItem.status] || selectedItem.status}</span></div>
                  <div><span className="block text-[#9cbaa8]">Location</span><span className="text-white">{selectedItem.location || selectedItem.assigned_branch || '-'}</span></div>
                  <div><span className="block text-[#9cbaa8]">Assigned to</span><span className="text-white">{currentHeldBy ? currentHeldBy.name || currentHeldBy.username : 'Unassigned'}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold">Transfer history</h3>
                    <p className="text-[#9cbaa8] text-sm">History of ownership and location changes for this asset.</p>
                  </div>
                  <button type="button" onClick={() => fetchSelectedItemHistory(selectedItem.id)} className="text-xs text-primary hover:text-emerald-300">Refresh</button>
                </div>

                {selectedItemTransfers.length === 0 ? (
                  <div className="rounded-2xl border border-[#28392f] bg-[#111814] p-4 text-[#9cbaa8] text-sm">No transfer history found.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedItemTransfers.map((entry, index) => renderTimelineCard(entry, index))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {transferModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTransferModalOpen(false)} />
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#28392f]">
              <div>
                <h2 className="text-xl font-bold text-white">Transfer Asset</h2>
                <p className="text-sm text-[#9cbaa8]">{selectedItem.name}</p>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg"><span className="material-symbols-outlined">close</span></button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleTransferSubmit}>
              {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}
              {formSuccess && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{formSuccess}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Branch</span>
                  <select value={transferForm.to_branch} onChange={(event) => setTransferForm((current) => ({ ...current, to_branch: event.target.value, to_department: '', to_user_id: '' }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Branch</option>
                    {filteredBranches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Department</span>
                  <select value={transferForm.to_department} onChange={(event) => setTransferForm((current) => ({ ...current, to_department: event.target.value, to_user_id: '' }))} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Select department</option>
                    {filteredDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#9cbaa8]">Move to user</span>
                  <select value={transferForm.to_user_id} onChange={(event) => handleTransferUserChange(event.target.value)} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white">
                    <option value="">Move to user</option>
                    {availableUsersForTransfer.map((user) => <option key={user.id} value={user.id}>{user.name || user.username}</option>)}
                  </select>
                </label>
              </div>

              <textarea value={transferForm.notes} onChange={(event) => setTransferForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white resize-none" placeholder="Transfer note" />

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#28392f]">
                <button type="button" onClick={() => setTransferModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[#9cbaa8] hover:text-white hover:bg-[#28392f] font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] font-bold disabled:opacity-50">{saving ? 'Saving...' : 'Save Transfer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
