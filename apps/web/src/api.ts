export type Item = { id: number; title: string; done: boolean; createdAt: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const itemsApi = {
  list: () => request<Item[]>('/items'),
  create: (title: string) => request<Item>('/items', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id: number, patch: Partial<Pick<Item, 'title' | 'done'>>) =>
    request<Item>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id: number) => request<void>(`/items/${id}`, { method: 'DELETE' }),
};
