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
