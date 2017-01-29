# Maskerade

Maskerade is a TypeScript library for easily interfacing with
bitmasks - integers which store multiple values in specific bits.

## Why bitmasks?

Bitmasks are useful primarily for reducing memory usage. Consider, for
example, an array representing a game map, where each tile can store
two values: height and terrain type. Say you have 4 kinds of terrain
and 16 height levels. A simple JS object representing this would look
like the following:

````js
{
  terrainType: 2,
  height: 12
}
````

But this could also be stored in a single 32-bit integer, like so:

````
        unused             | height | terrainType
00000000000000000000000000    1100        10
````

This method of storing data uses vastly less memory than true objects,
but it's difficult to work with. Retrieving the data requires
bit-fiddling which is often difficult to understand, hard to write,
and totally unreadable if you're looking at the code months later.

Bitmasks are often *faster* than direct object access, but that
requires doing the bit-shifting directly, without the indirection of
method calls. In many cases, the memory benefits of bitmasks are
useful but the unreadability and bugginess of frequent bitshifting
make it unfeasible. Giving a sane interface to it allows you to reap
the memory benefits with just a small latency overhead vs objects - in
my initial testing, Maskerade is about 10% slower than direct object
access (though you can use bitshifting with Maskerade, for instance in
tight performance-sensitive loops), but only uses about 15% of the
memory.

## Creating bitmasks with Maskerade

Maskerade's interface is fairly simple. It provides a Bitmask class
which is constructed like so:

````js
import Bitmask from "maskerade";

// The dataSections should contain a set of objects with "name" and
// "length" properties. The name is used as a key when actually
// creating a bitmask. The length is the number of bits in the integer
// to use to store that piece of data - for 4 possible values we need
// 2 bits, for 16 we need 4, etc.
const dataSections = [
  { name: "terrainType", length: 2 },
  { name: "height",      length: 4 }
];

const exampleBitmask = new Bitmask(dataSections);

const val = exampleBitmask.create({
  "terrainType": 2,
  "height": 12
});

val // -> 50
Bitmask.Print(val) // -> "00000000000000000000000000110010"
````

You can also easily get and set sections of a value:

````js
exampleBitmask.getSection(val, "terrainType") // -> 2

exampleBitmask.getSection(val, "height") // -> 12

const val2 = exampleBitmask.setSection(val, "height", 11);
exampleBitmask.getSection(val2, "height") // -> 11
````

You can also turn a value into a JS object:

````js
exampleBitmask.toObject(val2)
// -> {
//   terrainType: 2,
//   height: 11
// }
````
