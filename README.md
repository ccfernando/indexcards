# IndexCards

## Project description

IndexCards is a small web app that simulates a stack of index cards. You can shuffle the deck, pick a random card that lifts above the stack, and flip it to reveal the back. Each shuffle and flip plays a simple sound effect.

## Run locally

```powershell
python -m http.server 8000
```

Then open:

```
http://localhost:8000/index.html
```

## Edit names

Update `data/names.json` with a JSON array of names.

## Import names

Click **Import Names** to load a local file. Supported formats:
- JSON array (recommended): `["Alice","Bob",...]`
- Plain text: one name per line

The deck size automatically adjusts to the number of names in the file.

## Controls

- **Shuffle & Pick**: single click shuffles and picks one card
- **Shuffle & Pick (long press)**: keeps shuffling while pressed, picks on release
- **Send to Done**: moves the picked card to the Done stack
- Click a card in **Done** to return it to the deck

## Behavior notes

- The top card in the stack hides its name to avoid giving away the next pick.
- When a card is pulled up from the deck, its name is hidden.
- The picker avoids choosing the same card twice in a row.
- The picker never chooses the top card unless only one card remains.
