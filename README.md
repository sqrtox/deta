# @sqrtox/deta

## About

Deta library for JavaScript.

```sh-session
npm install @sqrtox/deta
yarn add @sqrtox/deta
pnpm install @sqrtox/deta
```

## Usage
```ts
import { Base } from '@sqrtox/deta';

const PROJECT_KEY = process.env.PROJECT_KEY;

const commentsBase = new Base({
  name: 'comments',
  projectKey: PROJECT_KEY
});

const comment = await commentsBase.get('c0mment1d');
```

```ts
import { Drive } from '@sqrtox/deta';

const PROJECT_KEY = process.env.PROJECT_KEY;

const imagesDrive = new Drive({
  name: 'images',
  projectKey: PROJECT_KEY
});

const file = await imagesDrive.get('path/to/file');
```
