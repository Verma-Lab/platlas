# generic-filehandle2

[![NPM version](https://img.shields.io/npm/v/generic-filehandle2.svg?style=flat-square)](https://npmjs.org/package/generic-filehandle2)
[![Coverage Status](https://img.shields.io/codecov/c/github/GMOD/generic-filehandle2/master.svg?style=flat-square)](https://codecov.io/gh/GMOD/generic-filehandle2/branch/master)
[![Build Status](https://img.shields.io/github/actions/workflow/status/GMOD/generic-filehandle2/push.yml?branch=master)](https://github.com/GMOD/generic-filehandle2/actions)

Provides a uniform interface for accessing binary data from local files, remote
HTTP resources, and Blob data in the browser.

## Usage

```js
import { LocalFile, RemoteFile, BlobFile } from 'generic-filehandle2'

// operate on a local file path
const local = new LocalFile('/some/file/path/file.txt')

// operate on a remote file path
const remote = new RemoteFile('http://somesite.com/file.txt')

// operate on blob objects
const blobfile = new BlobFile(new Blob([some_data], { type: 'text/plain' }))

// read slice of file, works on remote files with range request
const buf1 = await remote.read(10, 10)
// read whole file
const buf2 = await remote.readFile()
```

Important: under node.js, you should supply a fetch function to the RemoteFile
constructor

```js
import { RemoteFile } from 'generic-filehandle2'
import fetch from 'node-fetch'
const remote = new RemoteFile('http://somesite.com/file.txt', { fetch })
```

## API

### `async read(length: number, position: number=0, opts?: Options): Promise<Uint8Array>`

- length - a length of data to read
- position - the byte offset in the file to read from
- opts - optional Options object

Returns a Promise for the Uint8Array

### `async readFile(opts?: Options): Promise<Uint8Array | string>`

Returns a Promise for Uint8Array or string containing the contents of the whole
file.

### `async stat() : Promise<{size: number}>`

Returns a Promise for an object containing as much information about the file as
is available. At minimum, the `size` of the file will be present.

### Options

The Options object for the constructor, `read` and `readFile` can contain abort
signal to customize behavior. All entries are optional.

- signal `<AbortSignal>` - an AbortSignal that is passed to remote file fetch()
  API or other file readers
- headers `<Object <string, string> >`- extra HTTP headers to pass to remote
  file fetch() API
- overrides `<Object>` - extra parameters to pass to the remote file fetch() API
- fetch `<Function>` - a custom fetch callback, otherwise defaults to the
  environment (initialized in constructor)
- encoding `<string>` - if specified, then this function returns a string.
  Otherwise it returns a Uint8Array. Currently only `utf8` encoding is
  supported.

The Options object for `readFile` can also contain an entry `encoding`. The
default is no encoding, in which case the file contents are returned as a
Uint8Array. Currently, the only available encoding is `utf8`, and specifying
that will cause the file contents to be returned as a string. For compatibility
with the Node API, the `readFile` method will accept the string "utf8" instead
of an Options object.

## References

This module attempts to modernize the original generic-filehandle API by not
requiring node.js Buffer polyfill, and in doing so disconnected somewhat with
the true Node.js fs API https://github.com/GMOD/generic-filehandle
