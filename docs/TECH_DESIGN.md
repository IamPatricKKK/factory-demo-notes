# Technical design

Stack: NestJS 12 (ESM), React 19 + Vite, MikroORM 7 on PostgreSQL.

## Entities

### Note

| Field | Type | Nullable |
| --- | --- | --- |
| id | number | no |
| title | string | no |
| body | string | no |
| createdAt | Date | no |

## API

| Method | Path | Stories |
| --- | --- | --- |
| GET | `/api/notes` | US-01 |
| POST | `/api/notes` | US-02 |
| DELETE | `/api/notes/:id` | US-03 |

## Pages

| Route | Purpose | Stories |
| --- | --- | --- |
| `/` | Main page displaying the 'My Notes' header, note creation form, and reverse-chronological list of saved notes with delete buttons. | US-01, US-02, US-03 |

## UI contract

### `/`

| data-testid | Role | Label |
| --- | --- | --- |
| `note-heading` | heading | My Notes |
| `note-title-input` | textbox | Title |
| `note-body-input` | textbox | Body |
| `note-save` | button | Save note |
| `note-list` | list | My Notes |
| `note-row` | listitem | Note |
| `note-delete` | button | Delete |

## Tasks

| ID | Type | Title | Stories | Depends on |
| --- | --- | --- | --- | --- |
| T-01 | feature | Backend Notes API and removal of sample Items feature | US-01, US-02, US-03 | - |
| T-02 | feature | Web UI: Header and Saved Notes List | US-01 | T-01 |
| T-03 | feature | Web UI: Note Creation Form | US-02 | T-02 |
| T-04 | feature | Web UI: Note Deletion | US-03 | T-03 |
