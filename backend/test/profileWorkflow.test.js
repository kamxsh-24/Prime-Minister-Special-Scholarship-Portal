const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeProfileData, calculateCompletionPercentage } = require('../src/utils/profileWorkflow');

test('mergeProfileData preserves existing values and updates provided fields', () => {
  const existing = {
    fullName: 'Alice',
    email: 'alice@example.com',
    phone: '9999999999',
    address: { permanentAddress: 'Old', currentAddress: 'Old', state: 'Delhi' },
    documents: { aadhaar: 'old-link' },
    completionPercentage: 20,
  };

  const incoming = {
    fullName: 'Alice Updated',
    address: { currentAddress: 'New Address' },
    documents: { incomeCertificate: 'new-link' },
  };

  const merged = mergeProfileData(existing, incoming);

  assert.equal(merged.fullName, 'Alice Updated');
  assert.equal(merged.email, 'alice@example.com');
  assert.equal(merged.address.permanentAddress, 'Old');
  assert.equal(merged.address.currentAddress, 'New Address');
  assert.equal(merged.documents.aadhaar, 'old-link');
  assert.equal(merged.documents.incomeCertificate, 'new-link');
});

test('mergeProfileData preserves existing values when incoming values are empty', () => {
  const existing = {
    fullName: 'Alice',
    address: { permanentAddress: 'Old Address', currentAddress: 'Old Current', state: 'Delhi', district: 'Delhi', pincode: '110001' },
    documents: { aadhaar: 'aadhaar.pdf' },
  };

  const incoming = {
    fullName: '',
    address: { permanentAddress: '', currentAddress: 'New Current', state: '', district: '', pincode: '' },
    documents: { aadhaar: '', incomeCertificate: 'income.pdf' },
  };

  const merged = mergeProfileData(existing, incoming);

  assert.equal(merged.fullName, 'Alice');
  assert.equal(merged.address.permanentAddress, 'Old Address');
  assert.equal(merged.address.currentAddress, 'New Current');
  assert.equal(merged.documents.aadhaar, 'aadhaar.pdf');
  assert.equal(merged.documents.incomeCertificate, 'income.pdf');
});

test('calculateCompletionPercentage counts filled fields', () => {
  const profile = {
    fullName: 'Alice',
    dob: '2000-01-01',
    gender: 'Female',
    category: 'General',
    email: 'alice@example.com',
    phone: '9999999999',
    aadhaar: '123412341234',
    nationality: 'Indian',
    address: { permanentAddress: 'x', currentAddress: 'y', state: 'Delhi', district: 'Delhi', pincode: '110001' },
    collegeName: 'ABC',
    universityName: 'XYZ',
    degree: 'B.Tech',
    department: 'CSE',
    yearOfStudy: '2nd Year',
    rollNumber: '1001',
    academicYear: '2024-25',
    cgpa: 8.5,
    fatherName: 'Bob',
    motherName: 'Mary',
    parentOccupation: 'Engineer',
    familyIncome: 600000,
    bankName: 'SBI',
    accountHolderName: 'Alice',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    branchName: 'Main',
    profilePhoto: 'photo.jpg',
    documents: { aadhaar: 'doc1.pdf', incomeCertificate: 'doc2.pdf', marksheet: 'doc3.pdf', bankPassbook: 'doc4.pdf' },
  };

  const completion = calculateCompletionPercentage(profile);
  assert.ok(completion >= 90);
  assert.ok(completion <= 100);
});
