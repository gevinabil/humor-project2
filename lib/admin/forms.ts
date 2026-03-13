export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? value : null;
}

export function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value ? Number(value) : null;
}

export function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}
