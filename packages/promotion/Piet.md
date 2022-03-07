This file is written in markdown so the table can be easily formatted using Prettier.

`(n)` represents the size of that block, omitted if equal to 1.

The stack representation ends at the first input command, where the actual puzzle begins.

It's not recommended to read this table though, as it makes the puzzle a lot easier.

|  Output | Command | Stack |     |     |     |
| ------: | ------- | ----- | --- | --- | --- |
|         | nop(6)  |       |     |     |     |
|         | push(6) | 6     |     |     |     |
|         | push    | 6     | 6   |     |     |
|         | mul     | 36    |     |     |     |
|         | dup(2)  | 36    | 36  |     |     |
|         | push    | 36    | 36  | 2   |     |
|         | add(2)  | 36    | 38  |     |     |
|         | push    | 36    | 38  | 2   |     |
|         | mul     | 36    | 76  |     |     |
|       L | out     | 36    |     |     |     |
|         | dup     | 36    | 36  |     |     |
|         | push    | 36    | 36  | 1   |     |
|         | add(3)  | 36    | 37  |     |     |
|         | push    | 36    | 37  | 3   |     |
|         | mul     | 36    | 111 |     |     |
|         | dup     | 36    | 111 | 111 |     |
|       o | out     | 36    | 111 |     |     |
|         | dup(7)  | 36    | 111 | 111 |     |
|         | push    | 36    | 111 | 111 | 7   |
|         | add     | 36    | 111 | 118 |     |
|       v | out     | 36    | 111 |     |     |
|         | dup(10) | 36    | 111 | 111 |     |
|         | push    | 36    | 111 | 111 | 10  |
|         | sub     | 36    | 111 | 101 |     |
|       e | out     | 36    | 111 |     |     |
|         | dup(3)  | 36    | 111 | 111 |     |
|         | push    | 36    | 111 | 111 | 3   |
|         | sub     | 36    | 111 | 108 |     |
|       l | out(10) | 36    | 111 |     |     |
|         | push    | 36    | 111 | 10  |     |
|         | add     | 36    | 121 |     |     |
|       y | out(4)  | 36    |     |     |     |
|         | push    | 36    | 4   |     |     |
|         | sub     | 32    |     |     |     |
| (space) | out     |       |     |     |     |
|         | in      |
|         | dup     |
|         | dup     |
|         | dup     |
|         | in      |
|         | add     |
|         | dup(11) |
|         | push    |
|         | sub(3)  |
|         | push    |
|         | div     |
|         | out     |
|         | dup(2)  |
|         | push    |
|         | div(6)  |
|         | push    |
|         | add     |
|         | out     |
|         | sub(2)  |
|         | push    |
|         | mul     |
|         | add     |
|         | push(2) |
|         | push    |
|         | sub     |
|         | mul     |
|         | dup(16) |
|         | push    |
|         | sub     |
|         | out     |
|         | out     |
|         | in      |
|         | add(2)  |
|         | push    |
|         | div(12) |
|         | push    |
|         | sub     |
|         | dup     |
|         | out(2)  |
|         | push    |
|         | add(3)  |
|         | push    |
|         | div     |
|         | out     |
