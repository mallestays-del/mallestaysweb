// E.164 phone number normalization helper
// Accepts strings like '+91 84466 20191', '918446620191', '8446620191' (with default country)

export function toE164(value, defaultCountryCode = '91') {
  if (!value) throw new Error('Phone number is required');
  let phone = String(value).trim().replace(/[\s().-]/g, '');

  // Strip leading 00 (international prefix) → +
  if (phone.startsWith('00')) phone = '+' + phone.slice(2);

  // Add + if missing but starts with digit
  if (!phone.startsWith('+')) {
    // If it starts with the default country code (e.g. 91 for India) and length > 10
    if (phone.startsWith(defaultCountryCode) && phone.length === 10 + defaultCountryCode.length) {
      phone = '+' + phone;
    } else if (phone.length === 10) {
      // Assume local number, prepend default country code
      phone = '+' + defaultCountryCode + phone;
    } else {
      phone = '+' + phone;
    }
  }

  // Final validation
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error(`Invalid phone number: ${value} (must be E.164 e.g. +919876543210)`);
  }
  return phone;
}

export function tryE164(value, defaultCountryCode = '91') {
  try {
    return toE164(value, defaultCountryCode);
  } catch {
    return null;
  }
}
