# Simple Notes App

## Problem

Users need a lightweight and fast way to capture, view, and manage notes in their browser that persist reliably across page reloads.

## Target users

- Individuals seeking a straightforward, friction-free tool for writing down and organizing quick notes

## User stories

### US-01 (must)

As user, I want to see the app header and my list of saved notes, so that I can easily review all previously recorded notes in reverse chronological order.

Acceptance criteria:

- Given the user opens the application, Then they see a heading with the exact text "My Notes".
- Given existing saved notes, When the page loads, Then the notes are listed below the creation form with their title and body displayed.
- Given multiple saved notes exist, When viewing the list, Then notes are sorted newest first.
- Given notes are displayed in the list, When the user reloads the page, Then the notes persist and remain visible.

### US-02 (must)

As user, I want to create a new note with a title and body, so that I can save thoughts and information for later reference.

Acceptance criteria:

- Given the user is on the notes page, Then they see a text field labeled "Title", a text area labeled "Body", and a button labeled "Save note".
- Given the user has filled in the text field labeled "Title" and the text area labeled "Body", When the user clicks the "Save note" button, Then the note is saved, appears at the top of the saved notes list, and the form fields are cleared.
- Given a note has been saved, When the user reloads the page, Then the newly created note persists in the notes list.

### US-03 (must)

As user, I want to delete a note that I no longer need, so that I can keep my notes list clean and up to date.

Acceptance criteria:

- Given a saved note is displayed in the list, Then the note item has a button labeled "Delete".
- Given a saved note exists in the list, When the user clicks its "Delete" button, Then the note is immediately removed from the notes list.
- Given a note has been deleted, When the user reloads the page, Then the deleted note is no longer present.

## Out of scope

- User authentication, accounts, and multi-user tenancy
- Editing or updating existing notes
- Rich text formatting, markdown preview, or file attachments
- Categorization, tagging, folders, or color labeling
- Search, filtering, or manual reordering of notes
- Archiving, soft deletes, or trash restoration

## Open questions

- Should notes require both Title and Body before enabling or submitting 'Save note', or can either field be optional?
- Should there be a confirmation prompt before a note is deleted?
