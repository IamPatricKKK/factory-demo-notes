export type Note = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const notesApi = {
  list: () => request<Note[]>('/notes'),
  create: (data: { title: string; body: string }) =>
    request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/notes/${id}`, {
      method: 'DELETE',
    }),
};
