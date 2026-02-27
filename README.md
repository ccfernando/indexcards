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

Update `data/names.json` with a JSON array of 30 names.

## Import names

Click **Import Names** to load a local file. Supported formats:
- JSON array (recommended): `["Alice","Bob",...]`
- Plain text: one name per line

The deck size automatically adjusts to the number of names in the file.

## Behavior notes

- The top card in the stack hides its name to avoid giving away the next pick.
- When a card is pulled up from the deck, its name is hidden.
- The picker avoids choosing the same card twice in a row.
