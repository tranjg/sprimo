# Sprimo – Sprint Health Dashboard

Sprimo is a sprint health dashboard that integrates data from Jira and GitHub to provide actionable insights into your team's sprint performance. With intuitive visualizations and real-time metrics, Sprimo helps engineering teams stay aligned, identify blockers, and improve delivery outcomes.

## Features

- Jira + GitHub Integration – Seamlessly connects to your project management and source control tools.
- Sprint Metrics Visualization – Displays charts and graphs for sprint progress, issue status, PR activity, and more.
- Team Health Insights – Highlights potential risks, bottlenecks, and velocity trends.

## Project Structure
sprimo/

├── backend/ # API and data integration logic

├── frontend/ # React-based UI for dashboard visualization

├── .gitignore


- **Backend**: Handles data fetching from Jira and GitHub, processes metrics, and serves them via RESTful APIs.
- **Frontend**: Built with TypeScript and React, renders interactive dashboards and charts.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn or npm
- Access tokens for Jira and GitHub APIs

### Installation

```bash
# Clone the repository
git clone https://github.com/tranjg/sprimo.git
cd sprimo

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```
## Running Locally
### Start backend server
```bash
cd backend
npm start
```
### Start frontend app
```bash
cd ../frontend
npm run dev
```




