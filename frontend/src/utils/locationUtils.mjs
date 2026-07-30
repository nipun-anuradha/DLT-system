const normalizeBranchValue = (value) => {
  if (value === null || value === undefined) return '';

  const normalized = String(value).trim();
  if (!normalized) return '';

  const aliases = {
    dle: 'DLE',
    sapugaskanda: 'DLE',
    'sapugaskanda, sri lanka': 'DLE',
    'dlt - dnk': 'DLT - DNK',
    'dlt-dnk': 'DLT - DNK',
    dankotuwa: 'DLT - DNK',
    'dlt - ho': 'DLT - HO',
    'dlt-ho': 'DLT - HO',
    rajagiriya: 'DLT - HO',
  };

  const key = normalized.toLowerCase();
  return aliases[key] || normalized;
};

const branchValuesMatch = (leftValue, rightValue) => {
  const normalizedLeft = normalizeBranchValue(leftValue);
  const normalizedRight = normalizeBranchValue(rightValue);

  if (!normalizedLeft || !normalizedRight) {
    return true;
  }

  return normalizedLeft === normalizedRight;
};

export { normalizeBranchValue, branchValuesMatch };
