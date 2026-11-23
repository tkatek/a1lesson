# A1 English Lessons – Interactive Learning Platform

A standalone, static HTML5/CSS3/Vanilla JavaScript slide-based English learning platform designed for **CEFR A1 Beginner** students and integrable via link inside **EnGame** or **GitHub Pages**.

## Project Structure

```text
A1-English-Lessons/
├── index.html                  # Main lessons overview grid (5 A1 lessons)
├── pages/
│   ├── lesson.html             # Lesson introduction & learning objectives
│   └── learning.html           # Interactive slide-based learning player
├── assets/
│   ├── css/
│   │   ├── style.css           # Design tokens, dark mode, shared UI
│   │   ├── lessons.css         # Lessons grid & introduction layouts
│   │   └── player.css          # Slide stage, sidebar, bottom controls, activities
│   ├── js/
│   │   ├── lessons.js          # Lesson catalog, SVGs, localStorage progress
│   │   ├── slides.js           # Exact slide content for Lessons 01–05 (41 slides)
│   │   ├── activities.js       # Audio/TTS, quizzes, matching, builders, games
│   │   └── player.js           # Slide navigation, zoom, fullscreen, state sync
│   ├── images/                 # Lesson image folders (greetings, family, home, clothes)
│   ├── audio/                  # Local MP3 pronunciation folders
│   └── videos/                 # Local MP4 video folders
└── README.md
