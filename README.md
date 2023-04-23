<h1 align="center">TypeScript CLI Tool Template</h1>

## ⚙️ Setup

```zsh
$ git clone https://github.com/ogty/typescript-cli-tool-template <project-name>
$ cd <project-name>
```

## ✏️ Rewriting Part

1. `bin/<command-name>.js`
2. `package.json`
   - `"name": "<package-name>"`
   - `"bin": { "<command-name>": "./bin/<command-name>.js"}`
   - `"author": "<your-name>"`

## 🏃 Run

```zsh
$ make build
$ chmod +x ./bin/name.js
$ ./bin/name.js
```

## 📦 Publish

### <img src="https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png" width="5%"> Npm account creation

- [npm](https://www.npmjs.com/)
- [keywords:cli - npm search](https://www.npmjs.com/search?q=keywords:cli&page=0&ranking=optimal)

<hr>

```zsh
$ make login
$ make publish
```

> **Note**<br>
>
> ### If you get a 403 error
>
> - Conflicting package names(Not a unique name in the Nom package)
> - Version has not been changed since the last time
>
> Please check either of the above

### When you want to cancel a publish

```zsh
$ make unpublish
```
