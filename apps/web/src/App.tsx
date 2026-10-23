import { useEffect, useState, type FormEvent } from 'react'
import { itemsApi, type Item } from './api.ts'

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    itemsApi.list().then(setItems).catch((e: Error) => setError(e.message))
  }, [])

  async function run(action: () => Promise<void>) {
    try {
      setError(null)
      await action()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    void run(async () => {
      const item = await itemsApi.create(title.trim())
      setItems((prev) => [...prev, item])
      setTitle('')
    })
  }

  const toggle = (item: Item) =>
    run(async () => {
      const updated = await itemsApi.update(item.id, { done: !item.done })
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    })

  const remove = (item: Item) =>
    run(async () => {
      await itemsApi.remove(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    })

  return (
    <main>
      <h1>Items</h1>
      <form onSubmit={add}>
        <label htmlFor="new-item">New item</label>
        <input id="new-item" data-testid="item-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit" data-testid="item-add">Add</button>
      </form>
      {error && <p role="alert" data-testid="error">{error}</p>}
      <ul data-testid="item-list">
        {items.map((item) => (
          <li key={item.id} data-testid="item-row">
            <label>
              <input type="checkbox" data-testid="item-toggle" checked={item.done} onChange={() => void toggle(item)} />
              <span className={item.done ? 'done' : undefined}>{item.title}</span>
            </label>
            <button type="button" data-testid="item-delete" aria-label={`Delete ${item.title}`} onClick={() => void remove(item)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
