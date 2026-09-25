# Snake & Ladder Game 🎲 🐍 🪜

A classic 10×10 Snake & Ladder two-player pass-and-play board game built using standard web technologies with a jungle-green and gold visual theme.

---

## 📁 Project Structure

```text
Snake-Ladder-Game/
├── index.html     # Semantic HTML5 markup, game board structure, modal overlays
├── style.css      # Custom styling, dark green/gold palette, CSS animations & responsive layout
├── script.js      # Vanilla JavaScript game engine, SVG board rendering, movement animations, rules
└── README.md      # Project documentation and setup guide
```

---

## ✨ Features

- **Two-Player Pass-and-Play**: Seamless turn switching between Player 1 (Coral) and Player 2 (Sky Blue).
- **Player Name Inputs & Validation**: Requires both player names before the game can begin.
- **10×10 Alternating Board**: Squares 1–100 numbered in authentic boustrophedon (serpentine) order.
- **Dynamic SVG Rendering**: Smooth SVG curves for snakes and structured rails/rungs for ladders.
- **Animated 3D-Style Dice**: Realistic shake animation with standard 1–6 pip configurations.
- **Smooth Step-by-Step Movement**: Player tokens walk square-by-square, followed by smooth slides on snakes and ladders.
- **Exact Roll Rule**: Landing on square 100 requires an exact dice roll; overflowing rolls are skipped.
- **Winner Modal**: Celebratory trophy modal declaring the winner when square 100 is reached.
- **Restart & Exit Controls**: Restart the board at any time or cleanly exit with confirmation.
- **Full Responsive Design**: Optimized layouts for desktops, tablets, and mobile screens.
- **100% Vanilla**: No React, no Node.js, no backend, no build tools, and zero external runtime dependencies.

---

## 🕹️ Game Rules

1. **Start**: Enter names for both players and click **Start game**.
2. **Taking Turns**: Players take turns clicking **Roll dice**.
3. **Ladders**: Landing on the base of a ladder climbs up to the top.
   - Example: Square 1 ➔ 38, Square 28 ➔ 84, Square 80 ➔ 100.
4. **Snakes**: Landing on a snake's head slides down to its tail.
   - Example: Square 16 ➔ 6, Square 49 ➔ 11, Square 98 ➔ 78.
5. **Reaching 100**: You must roll the exact number needed to land on 100. If your roll exceeds 100, your turn is skipped.
6. **Winning**: The first player to reach square 100 wins!

---

## 🚀 How to Run the Project in VS Code

### Method 1: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Go to **File** > **Open Folder...** and select the `Snake-Ladder-Game` directory.
3. Install the **Live Server** extension (by *Ritwick Dey*) from the Extensions view (`Ctrl+Shift+X`).
4. Right-click `index.html` in the file explorer and select **Open with Live Server** (or click **Go Live** on the bottom status bar).
5. The game will automatically open in your default browser at `http://127.0.0.1:5500`.

### Method 2: Direct Browser Launch
1. Open the `Snake-Ladder-Game` folder in your file explorer.
2. Double-click `index.html` (or right-click > **Open with** > **Google Chrome** / **Microsoft Edge** / **Firefox**).
3. The game runs immediately in any modern browser without needing a server.