# CPU Scheduling Visualizer

A full-stack web application that visualizes CPU scheduling algorithms in real time. The frontend is built with React + Vite, and the backend is powered by **Drogon** — a high-performance C++ web framework — which handles all the scheduling logic and exposes it via a REST API. Process history is stored in MongoDB.

**Live Demo:** [cpu-scheduling-visualizer-khaki.vercel.app](https://cpu-scheduling-visualizer-khaki.vercel.app)

---

## What It Does

Instead of reading about CPU scheduling in a textbook, you can watch it happen. Enter your processes, pick an algorithm, and the app sends them to the C++ backend via Drogon, computes the schedule, and renders an animated Gantt chart with all the stats — waiting time, turnaround time, CPU utilization — laid out clearly.

---

## Algorithms Supported

- **FCFS** — First Come, First Served
- **SJF** — Shortest Job First (Non-Preemptive)
- **SRTF** — Shortest Remaining Time First (Preemptive)
- **Round Robin** — with configurable time quantum
- **Priority Scheduling** — Non-Preemptive
- **Priority Scheduling** — Preemptive
- **HRRN** — Highest Response Ratio Next

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite |
| Backend | C++ with [Drogon](https://github.com/drogonframework/drogon) framework |
| Database | MongoDB |
| Containerization | Docker, Docker Compose |
| Deployment | Vercel (frontend) |

The scheduling algorithms run entirely in C++ via Drogon, which serves a REST API on port `8080`. The React frontend (Vite dev server on port `5173`) talks to this API, and MongoDB stores process/session history.

---

## Project Structure

```
Cpu-Scheduling-Visualizer/
├── Backend/              # Drogon C++ application (scheduling engine + REST API)
├── frontend/             # React + Vite application
├── docker-compose.yml    # Orchestrates all three services
└── .gitignore
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

That's it if you're using Docker. If you want to run things manually, you'll also need:

- [Node.js](https://nodejs.org/) v16+
- [Drogon](https://github.com/drogonframework/drogon) and its dependencies (CMake, C++17 compiler)
- [MongoDB](https://www.mongodb.com/)

---

### Option 1 — Docker (Recommended)

The easiest way. One command starts the C++ backend, MongoDB, and the React frontend together.

```bash
# Clone the repo
git clone https://github.com/KunalTechs/Cpu-Scheduling-Visualizer.git
cd Cpu-Scheduling-Visualizer

# Copy the example env file and fill in your values
cp .env.example .env

# Build and start all services
docker-compose up --build
```

Once everything is running:

| Service | URL |
|---------|-----|
| Frontend (React/Vite) | http://localhost:3000 |
| Backend (Drogon API) | http://localhost:8081 |
| MongoDB | localhost:27017 |

To stop:
```bash
docker-compose down
```

---

### Option 2 — Run Manually

**1. Start MongoDB**

Make sure MongoDB is running locally on port `27017`.

**2. Start the Backend (Drogon / C++)**

```bash
cd Backend
mkdir build && cd build
cmake ..
make
./scheduling_backend   # Drogon starts on port 8080
```

**3. Start the Frontend (React + Vite)**

```bash
cd frontend
npm install
npm run dev   # Vite dev server starts on port 5173
```

Open `http://localhost:5173` in your browser.

---

## How to Use

1. **Add processes** — Enter process ID, arrival time, burst time, and priority (if applicable).
2. **Choose an algorithm** — Select from the dropdown.
3. **Set time quantum** — Only needed for Round Robin.
4. **Visualize** — Hit run and watch the Gantt chart build in real time.
5. **Read the results** — Per-process waiting time, turnaround time, and averages are shown below the chart.

---

## Environment Variables

Create a `.env` file in the project root before running:

```env
MONGO_URI=mongodb://mongodb:27017
```

Adjust the URI if you're running MongoDB somewhere other than the Docker network.

---

## Contributing

If you want to add an algorithm, improve the UI, or fix a bug — contributions are welcome.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "Add: brief description of what you did"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please keep PRs focused — one thing per PR makes reviews much easier.

---

## Author

**Kunal** — [@KunalTechs](https://github.com/KunalTechs)

If this helped you understand CPU scheduling, a ⭐ on GitHub goes a long way.
