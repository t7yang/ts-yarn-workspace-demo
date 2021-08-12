# TS Yarn Workspace Demo

This repo is to show how to setup a TypeScript + Yarn workspace (1.x) project.

When you have serveral highly coupled projects which you want to organize them together, you can consider a monorepo.

Yarn (1.x) provide the workspace feature to help you organize monorepo project.

Yarn workspace has serveral advantages like:
- Hoist same dependecies to top level to avoid duplicate install.
- Upgrade dependencies is much more easier.
- Easy to run a same script for all projects.

A typical monorepo is a backend api and frontend SPA project.

This demo show only the steps to setup the `shared` part and the `backend` part.

The source code can find in [https://github.com/t7yang/ts-yarn-workspace-demo](https://github.com/t7yang/ts-yarn-workspace-demo)

## File Structure

```
.
├── backend
│   ├── package.json
│   ├── src
│   │   └── index.ts
├── shared
│   ├── package.json
│   ├── src
│   │   ├── index.ts
├── package.json
```

## How to

### Setup yarn workspace in `package.json`
Yarn workspace must set `private` to `true`. In `workspaces` field you either explicitly list the path of projects or put all projects under a directory (said `packages`) then write as `packages/*` in `workspaces` field.

```json
{
  "private": true,
  "workspaces": [
    "shared",
    "backend"
  ]
}
```

### Add shortcut for projects (optional)
You don't need `cd` into each project to run a script, simply run `yarn workspace 'workspacename' 'scriptname'` in project's root.

A shortcut can make this easier:

```json
  ...
  "scripts": {
    "backend": "yarn workspace backend",
    "be": "yarn workspace backend",
    "shared": "yarn workspace shared"
  }
```

Then you can run script in more shorter way, the scripts below is equivalance.

```
$ yarn workspace backend start
$ yarn backend start
$ yarn be start
```

### Add TypeScript dependency
Just like the scripts above, adding dependency to a workspace is:

```
$ yarn workspace shared add -D typescript
$ yarn workspace backend add -D typescript
```

Run `yarn install` again in root project, yarn will hoist the same dependencies among sub projects to the top level `node_modules`.

### Setting `tsconfig.json`
A share `tsconfig.json` can place in the root project:

```json5
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5",
    "module": "commonjs",
    "lib": ["ESNext"],

    /* Strict Type-Checking Options */
    "strict": true,

    /* Module Resolution Options */
    "moduleResolution": "node",
    "esModuleInterop": true,

    /* Advanced Options */
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

For the `shared` sub project, `composite: true` field is required, other fields is optional but highly recommended, especially `outDir` and `rootDir`.

```json5
{
  "compilerOptions": {
    /* Basic Options */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Due the transpiled code of `shared` sub project is `dist`, point the `main` and `types` fields in `package.json` to `dist`.

```json5
{
  /* ... */
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  /* ... */
}
```

For the `backend` sub project, `references` field is required. The `path` field should point to the folder contain `tsconfig.json` or the `tsconfig.json` itself (here we point to the folder for short).

```json5
{
  "compilerOptions": {
    /* Basic Options */
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

### Start Coding
After the routine setup, now we can start coding. Add some code in `shared/src`, don't forget to export them to `shared/src/index.ts`

```typescript
// shared/src/user.ts
export interface User {
  name: string;
  age: number;
}

export const createUser = (name: string, age: number): User => ({ name, age });

export const showUser = (user: User) => console.log(`${user.name} is ${user.age} years old.`);

// shared/src/index.ts
export * from './user';
```

Import the code from `shared` in `backend` files, if everything is setup correctly, vscode will not complain and recognize the imports properly.

```typescript
// backend/src/index.ts
import { createUser, showUser, User } from 'shared';

const user: User = createUser('t7yang', 18);

showUser(user);
```

### Add Script and Run
Finally, add the `build` and `start` script for `backend`.

```json5
{
  /* ... */
  "scripts": {
    "build": "tsc --build",
    "start": "yarn build && node dist/index.js"
  },
  /* ... */
}
```

Run `yarn backend start` in root project, the `backend` project will transpile and run correctly.

```
$ yarn backend start
yarn run v1.22.4
$ yarn workspace backend start
$ yarn build && node dist/index.js
$ tsc --build
t7yang is 18 years old.
```

You may curious why we don't have to build `shared` before we build `backend`.

`tsc` is smart enough to transpile the project which referenced by `backend` and transpile them if necessary before transpile itself.

## Summary
By combining TypeScript project references and Yarn workpsace, we can setup a monorepo fast and easy.

If you need more powerful monorepo features, consider to use [lerna](https://github.com/lerna/lerna) or Yarn [v2 Workspace](https://yarnpkg.com/features/workspaces).

References:
- [Yarn Workspace](https://classic.yarnpkg.com/en/docs/workspaces/)
- TypeScript [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
