## Prerequisites

* [node + npm](https://nodejs.org/) (Current Version)

## Project Structure

* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory - these files are auto generated by the build. Don't need to mess with these.

## Setup

[in the folder you wish the 'project40s' folder to be placed]
```
git clone https://github.com/PoseidonOcto/project40s.git
cd project40s
npm install
```

Load the extension in chrome - in the chrome extensions page, load `dist` directory.
(see https://betterprogramming.pub/creating-chrome-extensions-with-typescript-914873467b65#:~:text=5.%20Load%20the%20extension)

## Build (every time you make a change)

```
npm run build
```

## References
Used the template 'https://github.com/chibat/chrome-extension-typescript-starter' (many thanks).
