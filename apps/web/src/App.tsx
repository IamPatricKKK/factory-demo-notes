import { useEffect, useState, type FormEvent } from 'react'
import { notesApi, type Note } from './api.ts'

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    notesApi.list().then(setNotes).catch((e: Error) => setError(e.message))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const created = await notesApi.create({ title, body })
      setNotes((prev) => [created, ...prev])
      setTitle('')
      setBody('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create note')
      }
    }
  }

  return (
    <main>
      <h1 data-testid="note-heading">My Notes</h1>
      {error && (
        <p role="alert" data-testid="error">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="note-title">Title</label>
        <input
          id="note-title"
          data-testid="note-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="note-body">Body</label>
        <textarea
          id="note-body"
          data-testid="note-body-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button type="submit" data-testid="note-save">
          Save note
        </button>
      </form>
      <ul data-testid="note-list" aria-label="My Notes">
        {notes.map((note) => (
          <li key={note.id} data-testid="note-row" aria-label="Note">
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
