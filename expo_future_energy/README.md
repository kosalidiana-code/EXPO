# EXPO Future Energy — Astana

An A-Frame browser game about defending Astana and exploring the NUR ALEM Museum of Future Energy.

## Game objective

- Defeat all **10 rogue robots** roaming the city to win.
- Robots detect the player within their awareness range and walk toward the player's position.
- A robot collision removes **one life**. The player starts with **3 lives**.
- Enter the NUR ALEM sphere to reach a protected safe zone. Entering the museum automatically restores the player to **3 lives**.
- Explore four interactive exhibits inside the museum: a mini wind turbine, a kinetic fabric installation, an electric vehicle and a photovoltaic solar panel.

## Controls

- **W / A / S / D** or **Arrow Keys** — move.
- **Mouse** — look around and aim with the center reticle.
- **Space** or **left mouse button** — cast a magic spell at the robot under the reticle.
- **Enter NUR ALEM** — enter the safe zone when close to the sphere.
- **Exit to City** — leave the museum and return to the city.

## Run locally

1. Extract the ZIP archive.
2. Open the project folder in Visual Studio Code or a terminal.
3. Start a local web server in this folder:

   ```bash
   python -m http.server 8000
   ```

4. Open <http://localhost:8000> in a browser.

The project loads A-Frame 1.5.0 from its public CDN, so an internet connection is required when opening the game for the first time.

## Project files

- `index.html` — game interface and A-Frame scene.
- `styles.css` — interface styling and responsive layout.
- `game.js` — city generation, robot AI, combat, lives, safe zone and exhibits.

## Notes

The city landmarks and NUR ALEM pavilion are stylized real-time 3D approximations built from A-Frame primitives. The exhibit explanations are in English and can be read or played with the browser's English speech synthesis voice, when one is available.
