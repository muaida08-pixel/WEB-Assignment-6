# Assignment 6 — Party Files

Aida Mukusheva · IT-2509

Repository: https://github.com/muaida08-pixel/WEB-Assignment-6

Open `index.html`, then choose Task 1 or Task 2. All assets, including jQuery
3.7.1 and Open Peeps avatars, are stored locally. No build or installation is
needed. Optional local server: `python3 -m http.server 8000`.

## Structure

- `task1/`: Selector Detective, all 20 cases.
- `task2/`: a copy extended with spotlight, guest details, move and sort effects.
- `assets/data.js`: the 21 guests transcribed from the assignment picture.
- `assets/data.json`: the same data in a readable interchange format.
- `assets/style.css`: layout only; no CSS transitions or animations.
- `assets/avatars/`: downloaded DiceBear Open Peeps avatars.

Both tasks retain an independent app.js copy. The Task 2 page enables the motion
features through its data-task attribute. All behavior and DOM construction use
jQuery. Case functions search the DOM, not the source array.

Each case rebuilds from the current party array. Task 1 keeps its initial array;
Task 2 updates the array after moving and sorting. Cases 18 and 19 are temporary
scene changes and are reset by the next case. Reset party restores the picture.
Sorting twice returns guests to picture order. Moved guests receive an order
number after existing guests in their destination.

## Animation handling

- Spotlight: fadeTo(300, 0.2), Clear: fadeTo(300, 1).
- Matches: one upward and downward animate() sequence.
- Details: animate position and dimensions from/to the avatar.
- Move: a flying clone, shrinking source slot and growing destination slot.
- Sort: capture coordinates, reorder DOM, animate relative offsets to zero.
- Rapid sorts finish the current effect with stop(true, true), clear queues,
  then apply the next requested state. A short move lock prevents competing
  changes while the clone is in flight. Cases rebuild and cancel old scene nodes.

## Sources and licenses

- Assignment 6 supplied course brief.
- jQuery 3.7.1, MIT license: https://jquery.org/license/
- Avatar generator: https://www.dicebear.com/styles/open-peeps/
- Open Peeps artwork by Pablo Stanley, CC0.
- Avatars generated using https://api.dicebear.com/9.x/open-peeps/svg?seed=NAME

Review the report and code before defending the assignment. Be able to explain
selectors, traversal, effect queues, callbacks and the distinction between the
source array and rendered DOM. The defense requires independent understanding.
