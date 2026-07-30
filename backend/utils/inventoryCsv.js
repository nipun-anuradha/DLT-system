const { parse } = require('csv-parse/sync');

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
};

const parseCsvText = (text) => {
  if (!text || !text.trim()) return [];
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
};

const inferItemType = (value) => {
  const normalized = normalizeValue(value).toLowerCase();
  if (!normalized) return 'other';
  const aliases = {
    laptop: 'laptop',
    desktop: 'desktop',
    printer: 'printer',
    mobile: 'mobile',
    phone: 'mobile',
    monitor: 'monitor',
    projector: 'projector',
    scanner: 'scanner',
    server: 'server',
    router: 'router',
    switch: 'switch',
    ups: 'ups',
    dongle: 'dongle',
    '4g lte mifi device': 'dongle',
    '4g lte': 'dongle',
    'access point': 'router',
    'slt fiber router': 'router',
    'slt vpn router': 'router',
    'fast ethernet media converter': 'other',
  };

  return aliases[normalized] || normalized.replace(/\s+/g, '_');
};

const mapInventoryRowToPayload = (row) => {
  const location = normalizeValue(row.Location || row.location);
  const department = normalizeValue(row.Dept || row.Dept || row.department || row.Department);
  const userName = normalizeValue(row['User Name'] || row['User Name'] || row.user || row.User);
  const category = normalizeValue(row.Category || row.category || row.Category || row.type);
  const assetTag = normalizeValue(row['DLT Asset No'] || row['DLT Asset No'] || row.asset_tag || row.assetTag);
  const description = normalizeValue(row.Description || row.description || row.name || row.Name);
  const serialNumber = normalizeValue(row['Serial Number'] || row.serial_number || row.serialNumber);
  const imeiNumber = normalizeValue(row['IMEI Number'] || row.imei || row.imei_number || row.imeiNumber);
  const remark = normalizeValue(row.Remark || row.remark || row.notes);
  const tonerModel = normalizeValue(row['Toner Model'] || row.toner_model || row.tonerModel);
  const oldUser3 = normalizeValue(row['Old User 03'] || row.old_user_3 || row.oldUser3);
  const oldUser2 = normalizeValue(row['Old User 02'] || row.old_user_2 || row.oldUser2);
  const oldUser1 = normalizeValue(row['Old User 01'] || row.old_user_1 || row.oldUser1);
  const vendor = normalizeValue(row.Vendor || row.vendor || row.VendorName);
  const invoiceNo = normalizeValue(row['Invoice No'] || row.invoice_no || row.invoiceNo);
  const purchasedDate = normalizeValue(row['Purchased Date'] || row.purchased_date || row.purchaseDate);
  const purchasedAmount = normalizeValue(row['Purchased Amount'] || row.purchased_amount || row.purchasedAmount);

  const notesParts = [
    remark,
    tonerModel ? `Toner: ${tonerModel}` : '',
    oldUser3 ? `Old User 03: ${oldUser3}` : '',
    oldUser2 ? `Old User 02: ${oldUser2}` : '',
    oldUser1 ? `Old User 01: ${oldUser1}` : '',
    vendor ? `Vendor: ${vendor}` : '',
    invoiceNo ? `Invoice No: ${invoiceNo}` : '',
    purchasedDate ? `Purchased Date: ${purchasedDate}` : '',
    purchasedAmount ? `Purchased Amount: ${purchasedAmount}` : '',
    imeiNumber ? `IMEI: ${imeiNumber}` : '',
  ].filter(Boolean);

  return {
    item_type: inferItemType(category),
    name: description || category || 'Unnamed asset',
    model: description || category || '',
    serial_number: serialNumber || null,
    asset_tag: assetTag || null,
    specs: '',
    status: 'available',
    assigned_user_name: userName || '',
    assigned_department: department || null,
    assigned_branch: location || null,
    location: location || null,
    notes: notesParts.join(' | '),
    old_user_3: oldUser3 || '',
    old_user_2: oldUser2 || '',
    old_user_1: oldUser1 || '',
    vendor: vendor || '',
    invoice_no: invoiceNo || '',
    purchased_date: purchasedDate || '',
    purchased_amount: purchasedAmount ? String(purchasedAmount).replace(/[^0-9.-]/g, '') : '',
    imei_number: imeiNumber || '',
    imported_from_csv: true,
  };
};

module.exports = {
  parseCsvText,
  mapInventoryRowToPayload,
  normalizeValue,
  inferItemType,
};
