const hasMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    return Object.values(value).some((child) => hasMeaningfulValue(child));
  }
  return false;
};

const mergeObjects = (existing = {}, incoming = {}) => {
  const merged = { ...existing };
  Object.entries(incoming).forEach(([key, value]) => {
    if (hasMeaningfulValue(value)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = mergeObjects(existing?.[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
  });
  return merged;
};

const normalizeProfilePayload = (payload = {}) => {
  const normalized = {
    ...payload,
    address: payload.address || {},
    documents: payload.documents || {},
  };

  if (payload.dob && typeof payload.dob === 'string' && !payload.dob.includes('T')) {
    normalized.dob = payload.dob;
  }

  return normalized;
};

const mergeProfileData = (existing = {}, incoming = {}) => {
  const merged = { ...existing };
  Object.entries(incoming).forEach(([key, value]) => {
    if (!hasMeaningfulValue(value)) {
      return;
    }

    if (key === 'address' || key === 'documents') {
      merged[key] = mergeObjects(existing?.[key] || {}, value || {});
      return;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      merged[key] = mergeObjects(existing?.[key] || {}, value);
      return;
    }

    merged[key] = value;
  });

  return merged;
};

const calculateCompletionPercentage = (profile = {}) => {
  const fields = [
    profile.fullName,
    profile.dob,
    profile.gender,
    profile.category,
    profile.phone,
    profile.email,
    profile.aadhaar,
    profile.bloodGroup,
    profile.nationality,
    profile.address?.permanentAddress,
    profile.address?.currentAddress,
    profile.address?.state,
    profile.address?.district,
    profile.address?.pincode,
    profile.collegeName,
    profile.universityName,
    profile.degree,
    profile.department,
    profile.yearOfStudy,
    profile.rollNumber,
    profile.academicYear,
    profile.cgpa,
    profile.fatherName,
    profile.motherName,
    profile.parentOccupation,
    profile.familyIncome,
    profile.bankName,
    profile.accountHolderName,
    profile.accountNumber,
    profile.ifscCode,
    profile.branchName,
    profile.profilePhoto,
    profile.documents?.aadhaar,
    profile.documents?.incomeCertificate,
    profile.documents?.casteCertificate,
    profile.documents?.marksheet,
    profile.documents?.bankPassbook,
  ];

  const filledFieldsCount = fields.filter((field) => field !== undefined && field !== null && String(field).trim() !== '').length;
  const totalFieldsCount = fields.length;
  return Math.round((filledFieldsCount / totalFieldsCount) * 100);
};

module.exports = {
  normalizeProfilePayload,
  mergeProfileData,
  calculateCompletionPercentage,
};
