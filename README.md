# Standard
Standard library for JavaScript/TypeScript

## Features
- Lazy iterable combinators such as _map_, _filter_, _reduce_, etc.
- Lazy async iterable combinators such as _mapAsync_, _filterAsync_, etc.
- Iterable fluent containers: _Sequence_, _Set_, _Array_, _Dictionary_, and _DataTable_
- Functional combinators such as _flip_, _curry_, etc.
- Async combinators such as _promisify_, _sleep_, etc.
- Statistical functions such as mean, median, 1st/3rd quartiles, variance, etc.
- HTTP communication functionality
- Extensions of basic types: string,  number, date-time, char
- Basic utilities: types, type guards, helpers


## Install
`npm install --save @sparkwave/standard`


## Usage
```ts
// import specific functions from specific modules
import { mapAsync, ZipAsync, isAsyncIterable /*, ...*/ } from "@sparkwave/standard/collections/iterable-async"
import { map, filter, reduce, skip, take, chunk /*, ...*/ } from "@sparkwave/standard/collections/iterable"
import { keys, entries, pick, omit, mapObject, fiterObject  /*, ...*/ } from "@sparkwave/standard/collections/object"

// import everything from a module
import * as containers from "@sparkwave/standard/collections/containers"
const numArray = new containers.Array([1, 2, 3])

// import everything from package
import * as stdlib from "@sparkwave/standard"
type Predicate<T> = stdlib.Predicate<T>
```