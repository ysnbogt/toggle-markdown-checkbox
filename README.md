<h1 align="center">Toggle Markdown Checkbox</h1>

## Installation

```zsh
$ npm install --global toggle-markdown-checkbox
```

## Usage

```zsh
$ check <file-path>
$ check rate <file-path>
```

## Example

**`task.md`**

```md
---
GET: green
POST: cyan
PUT: yellow
DELETE: red
---

- [x] GET: /api/task/1 (due: 2023-04-01)
- [x] POST: /api/task (due: 2023-05-30)
- [x] PUT: /api/task/3 (due: 2023-05-28)
- [x] DELETE: /api/task/4 (due: 2023-06-05)
- [ ] task5 (due: 2023-05-25)
- [ ] task6
```

```zsh
$ check ./task.md
No overdue tasks.
? Select items to toggle …
✔ GET /api/task/1
✔ POST /api/task
✔ PUT /api/task/3
✔ DELETE /api/task/4
✔ task5
✔ task6
```

```zsh
$ check rate ./task.md
No overdue tasks.

Checkbox State Report: 4/6 checkboxes checked.

Completion Rate: 66.67%
```
