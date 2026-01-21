# Neon Racer – 3D Programming Challenge 1

## 📌 Overview
Neon Racer is a simple 3D racing game prototype developed for the **3D Programming – Challenge 1** assignment.  
The project demonstrates the use of **3D rendering** and **physics simulation** to create an interactive racing experience in a web environment.

The main objective of this project is to practice:
- Working with 3D scenes and cameras
- Applying physics-based movement
- Handling user input
- Implementing basic game mechanics such as laps and timing

---

## 🛠️ Technologies Used
- **THREE.js** – 3D graphics rendering
- **CANNON-ES** – Physics engine for rigid body simulation
- **HTML5 & JavaScript (ES Modules)**
- **Web Browser** (Google Chrome / Microsoft Edge recommended)

---

## 🎮 Controls
| Key | Function |
|----|---------|
| W | Accelerate |
| S | Brake / Reverse |
| A | Turn Left |
| D | Turn Right |
| R | Reset Car |

> Click on the game screen to ensure keyboard input is detected.

---

## 🏁 Features
- Physics-based car movement using forces and angular velocity
- Smooth third-person camera following the car
- Lap system with checkpoints
- Real-time HUD displaying:
  - Speed (km/h)
  - Lap count
  - Elapsed time
  - Gear indicator (N / D / R)
- Neon-style city environment

---

## 📂 Project Structure
project-root/
│── index.html # Main game file
│── car.js # Car physics & control logic (if separated)
│── README.md # Project documentation
└── assets/ # Optional models or textures

pgsql
Sao chép mã

---

## ▶️ How to Run the Project
⚠️ This project must be run using a local web server due to ES module imports.

### Option 1: VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Option 2: Simple Local Server
```bash
npx serve
or

bash
Sao chép mã
python -m http.server
Then open the provided local URL in your browser.