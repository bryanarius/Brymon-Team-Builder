# Brymon Team Builder

A full-stack Pokémon team builder built from scratch using a custom **PHP MVC architecture**, **PostgreSQL**, **JavaScript**, and the **PokéAPI**.

> 🚧 **Status:** Version 1 — In Active Development

---

# Live Demo

https://brymon-team-builder.onrender.com

---

# Screenshots

## Home

![Home](docs/high-fi/home.png)

---

## Team Builder

![Team Builder](docs/high-fi/team-builder.png)

---

## Saved Teams

![Saved Teams](docs/high-fi/saved-teams.png)

---

## About

![About](docs/high-fi/about.png)

---

# Overview

Brymon is a full-stack portfolio project built to demonstrate modern software engineering principles by designing and implementing a Pokémon team builder from scratch.

The application combines backend architecture, relational database design, frontend interactivity, and third-party API integration into a single production-deployed web application.

Current development focuses on allowing users to:

- Search Pokémon
- Filter Pokémon by generation and type
- Build teams of up to six Pokémon
- Configure each team member
- Save and manage teams
- Persist data in PostgreSQL

---

# Why Brymon?

Rather than relying on a full-stack framework, Brymon was intentionally built using a custom MVC architecture to strengthen my understanding of how web applications work beneath frameworks.

The project focuses on software architecture, maintainability, database design, and scalable application structure while providing a practical Pokémon team-building experience.

---

# Tech Stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Frontend        | HTML5, CSS3, JavaScript |
| Backend         | PHP 8                   |
| Architecture    | Custom MVC              |
| Database        | PostgreSQL              |
| Database Access | PDO                     |
| API             | PokéAPI                 |
| Deployment      | Docker, Render          |
| Version Control | Git & GitHub            |

---

# Current Features

## Authentication

- User Registration
- User Login
- Secure Password Hashing
- Session Authentication
- Route Protection

## Pokémon Browser

- Live Search
- Partial Name Search
- Generation Filters
- Type Filters
- Sorting
- Responsive Search Results

## Team Builder

- Responsive Builder Layout
- Six Pokémon Team Slots
- Team Metadata
- Dynamic Pokémon Browser

---

# Features In Progress

## Team Management

- Add Pokémon to Team
- Configure Moves
- Configure Abilities
- Configure Items
- Configure Natures
- Configure EVs
- Configure IVs

## CRUD Operations

- Save Teams
- Edit Teams
- Delete Teams
- View Saved Teams

---

# Project Roadmap

## ✅ Phase 0 — Planning

- [x] Project Planning
- [x] MVP Definition
- [x] User Flow

---

## ✅ Phase 1 — UI / UX

- [x] Low-Fidelity Wireframes
- [x] High-Fidelity Mockups
- [x] Responsive Design System

---

## ✅ Phase 2 — Backend Architecture

- [x] Database Design
- [x] MVC Architecture
- [x] Routing
- [x] Authentication
- [x] PostgreSQL Integration
- [x] Docker Deployment

---

## 🚧 Phase 3 — Core Development

- [x] Homepage
- [x] About Page
- [x] Authentication
- [x] Pokémon Search
- [x] Search Filters
- [x] Add Pokémon to Team
- [x] Pokémon Configuration
- [ ] CRUD Functionality
- [ ] Saved Teams

---

## ⏳ Phase 4 — Polish

- [ ] Form Validation
- [ ] Unit Testing
- [ ] Error Handling
- [ ] Accessibility Improvements
- [ ] Performance Optimization

---

# Architecture

```
Browser
    │
    ▼
 Router
    │
    ▼
Controllers
    │
    ▼
 Models
    │
    ▼
PostgreSQL

    ▲
    │
 PokéAPI
```

---

# Project Structure

```text
Brymon/
│
├── app/
│   ├── Controllers/
│   ├── Core/
│   ├── Models/
│   └── Views/
│
├── config/
│
├── database/
│
├── docs/
│
├── public/
│
├── routes/
│
└── storage/
```

---

# Engineering Concepts Demonstrated

- Custom MVC Architecture
- Object-Oriented PHP
- PostgreSQL Database Design
- Authentication & Authorization
- Session Management
- REST-style API Design
- CRUD Operations
- External API Integration
- JavaScript State Management
- Responsive Design
- Docker Deployment
- Git Workflow

---

# Future Roadmap

## Version 2

- Team Analysis
- Type Coverage Calculator
- Offensive / Defensive Team Analysis
- Public Team Sharing
- Community Dashboard
- User Profiles
- Pokémon Showdown Import
- Pokémon Showdown Export
- Copy Public Teams

---

## Version 3

- REST API
- React Frontend
- Laravel Backend Experiment
- Advanced Analytics
- Performance Improvements

---

# Lessons Learned

Brymon has provided hands-on experience with:

- Designing a normalized relational database
- Building a custom MVC framework
- Deploying Dockerized PHP applications
- Integrating third-party APIs
- Managing complex client-side state
- Structuring maintainable backend code
- Building responsive user interfaces

---

# Installation

```bash
git clone https://github.com/YOUR_USERNAME/brymon-team-builder.git

cd brymon-team-builder

composer install
```

Configure your PostgreSQL database credentials.

Run the database migrations.

Start the PHP development server.

```bash
php -S localhost:8000 -t public
```

Visit:

```
http://localhost:8000
```

---

# Acknowledgements

Pokémon data and artwork are provided by **PokéAPI**.

https://pokeapi.co/

Brymon is a fan-made educational portfolio project and is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.

Pokémon and all related trademarks are property of their respective owners.

---

# License

This project is licensed under the MIT License.
