# Flappy Bird - Enhanced Edition

A modern, web-based recreation of the classic Flappy Bird game with enhanced features, smooth animations, and a life system. This version focuses on a polished user experience with physics-driven movement and a forgiving life-based progression.

## 🚀 Features

-   **Classic Gameplay**: Familiar mechanics with gravity-based movement and pipe navigation.
-   **Life System**: Start with 3 lives. Colliding with a pipe or the ground costs a life, but you can recover by collecting hearts.
-   **Power-ups**: Collect hearts that spawn every 50 pipes to regain lost lives.
-   **High Score Tracking**: Your best score is saved locally using `localStorage`.
-   **Responsive Design**: Optimized for a 360x640 canvas, fitting perfectly on mobile and desktop screens.
-   **Enhanced Visuals**:
    -   Smooth bird rotation based on velocity.
    -   Dynamic sky gradients and cloud backgrounds.
    -   Classic green pipe aesthetics with gradients and outlines.
    -   Animated HUD with score "pop" effects.

## 🧠 Physics & Implementation

The game's movement and rotation are handled through a simple but effective physics engine implemented in `script.js`.

### 1. Gravity and Velocity
The bird's vertical position (`birdY`) is updated every frame based on its `birdVelocity`.
-   **Gravity**: A constant `GRAVITY` (0.25) is added to the `birdVelocity` in every update cycle.
-   **Jumping**: When the player interacts (click/tap/key), the `birdVelocity` is immediately set to a negative `JUMP` value (-4.5), propelling the bird upward.
-   **Position**: The velocity is then added to the current `birdY` coordinate.

### 2. Rotation (Tilting)
The bird's rotation is dynamically calculated based on its current vertical velocity to give it a "weighty" feel:
-   **Logic**: `birdRotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, birdVelocity * 0.15))`
-   **Upward Tilt**: When the bird jumps (negative velocity), it tilts upward (up to -45 degrees).
-   **Downward Dive**: As gravity pulls the bird down (positive velocity), it tilts forward and eventually dives straight down (up to 90 degrees).
-   **Rendering**: This rotation is applied using the Canvas API's `ctx.rotate()` method during the draw call, centered on the bird's position.

## 🛠️ Technologies Used

-   **HTML5 Canvas**: For high-performance 2D rendering.
-   **CSS3**: For layout, styling, and UI animations.
-   **Vanilla JavaScript**: Core game logic, physics, and state management.

## 🎮 How to Play

1.  **Start**: Click the "Start Game" button or press any key/tap the screen.
2.  **Fly**: Click, tap, or press any key to make the bird flap upwards.
3.  **Objective**: Navigate through the gaps in the pipes. Each successful pass earns 1 point.
4.  **Lives**: You have 3 lives. If you hit a pipe, you'll lose a life and reset to a safe position.
5.  **Game Over**: The game ends when you lose all your lives.

## 📂 Project Structure

-   `index.html`: The main entry point and UI structure.
-   `style.css`: Contains all visual styling and UI animations.
-   `script.js`: The engine containing game loops, physics, and rendering logic.

## 🔧 Installation & Running

No installation is required. Simply open `index.html` in any modern web browser.

```bash
# Clone the repository
git clone https://github.com/your-username/flappy-bird.git

# Navigate to the directory
cd flappy-bird

# Open in browser
open index.html
```

## 📝 License

This project is open-source and available under the MIT License.
