# star2star-error-formatter
format error object/messages

## Installation

```bash
npm install star2star-error-formatter --save
```

## Usage

```javascript
require("babel-polyfill");
```

When running in node you can specify the log level and pretty print using environment variables

```javascript
process.env.MS_LOGLEVEL = "debug" 
process.env.MS_LOGPRETTY = true 
```

## Changes
* 1.0.0 - 1st release - formatError
