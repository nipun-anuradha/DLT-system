const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCsvText, mapInventoryRowToPayload, expandScientificNotation } = require('../utils/inventoryCsv');

test('parses quoted CSV rows and maps the template columns into inventory fields', () => {
  const csv = [
    'Location,Dept,User Name,Category,DLT Asset No,Description,Serial Number,IMEI Number,Remark,Toner Model,Old User 03,Old User 02,Old User 01,Vendor ,Invoice No,Purchased Date, Purchased Amount ',
    'DLE,FIN,Jayendra,LAPTOP,DLT-001,Asus ExpertBook,ABC123,1234567890,Ready,HP 123,Old 3,Old 2,Old 1,Tech Corp,T00908,8-Sep-2025," 149,000.00 "',
    'DLT - HO,IT,Backup,DESKTOP,,Assemble PC,-,,,,Chandana,,,,,,',
  ].join('\n');

  const rows = parseCsvText(csv);
  assert.equal(rows.length, 2);

  const payload = mapInventoryRowToPayload(rows[0]);
  assert.equal(payload.assigned_branch, 'DLE');
  assert.equal(payload.assigned_department, 'FIN');
  assert.equal(payload.assigned_user_name, 'Jayendra');
  assert.equal(payload.item_type, 'laptop');
  assert.equal(payload.asset_tag, 'DLT-001');
  assert.equal(payload.name, 'Asus ExpertBook');
  assert.equal(payload.serial_number, 'ABC123');
  assert.equal(payload.imei_number, '1234567890');
  assert.match(payload.notes, /Ready/);
  assert.equal(payload.old_user_3, 'Old 3');
  assert.equal(payload.old_user_2, 'Old 2');
  assert.equal(payload.old_user_1, 'Old 1');
  assert.equal(payload.vendor, 'Tech Corp');
  assert.equal(payload.invoice_no, 'T00908');
  assert.equal(payload.purchased_date, '8-Sep-2025');
  assert.equal(payload.purchased_amount, '149000.00');
});

test('expands scientific notation serials without converting them to JavaScript numbers', () => {
  assert.equal(expandScientificNotation('3.20E+11'), '320000000000');
  assert.equal(expandScientificNotation('ABC123'), 'ABC123');
});
