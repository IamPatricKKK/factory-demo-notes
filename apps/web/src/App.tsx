import { useEffect, useState } from 'react'
import { notesApi, type Note } from './api.ts'

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    notesApi.list().then(setNotes).catch((e: Error) => setError(e.message))
  }, [])

  return (
    <main>
      <h1 data-testid="note-heading">My Notes</h1>
      {error && (
        <p role="alert" data-testid="error">
          {error}
        </p>
      )}
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
