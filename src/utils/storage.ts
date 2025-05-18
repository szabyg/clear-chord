export function saveToLocalStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}
