# MineSweeper

This is a Javascript version of the classic mine sweeper game with design similar to what could be seen in the earlier windows versions.

A rule based solver has been implemented using a local evaluation method (Rule 1) and if it fails to find find a safe move a more advnaced algorithm (Rule 2) is used. If logical rules can't find a safe move the solver will pick any random square and click it (This is not ideal guessing and might be improved in the future).  

## Rule 1

Rule 1 consits of two steps, where the first one is,

If the number on this square (this hint) is the same as unopened adjacent squares minus adjacent flags then all unopened squares are bombs,
flag them!
If the number of flags adjacent to this square is equal to the hint then all unopened squares are safe to click.

## Rule 2

Rule 2 makes a matrix with all squares as variables and each hint is added as a row in the matrix. By trying to find the row reduced echelon representation of the matrix partial solutions can be extracted. Safe moves are then carried out. 

A working demo can be found at [www.kimericsvensson.se/minesweeper](https://www.kimericsvensson.se/minesweeper).