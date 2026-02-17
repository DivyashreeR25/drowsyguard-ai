# DrowsyGuard – AI-Based Drowsiness Detection System

DrowsyGuard is a real-time, browser-based drowsiness detection system built using React, TypeScript, and MediaPipe FaceMesh. The application detects fatigue-related behaviors such as prolonged eye closure, yawning, head nodding, and excessive head tilt using facial landmark analysis.

All processing is performed locally in the browser without backend inference, ensuring privacy and efficient deployment.

---

## Live Demo

Deployed Application:
https://drowsyguard-ai.vercel.app/

---

## Overview

DrowsyGuard uses MediaPipe FaceMesh to extract 468 facial landmarks from a live webcam stream. Geometric relationships between specific landmark points are used to calculate fatigue indicators.

The system monitors:

* Eye Aspect Ratio (EAR) for prolonged eye closure
* Mouth Aspect Ratio (MAR) for yawning detection
* Nose displacement for head nod detection
* Eye-line angle for face tilt detection

An alarm is triggered when drowsiness conditions persist beyond configured time thresholds.

---

## Key Features

* Real-time webcam-based facial landmark detection
* Eye closure detection using EAR
* Yawn detection using MAR
* Head nod detection via nose displacement tracking
* Face tilt detection using roll angle calculation
* Timed threshold validation to prevent false positives
* Client-side inference with no image uploads
* Fully deployable on free hosting platforms

---

## Technology Stack

Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* Lucide Icons

Computer Vision

* MediaPipe FaceMesh
* Landmark-based geometric calculations

Deployment

* Vercel (CI/CD via GitHub integration)

---

## Detection Logic Summary

### Eye Aspect Ratio (EAR)

Average EAR is calculated using vertical and horizontal distances between eye landmarks.

Condition:
Average EAR < 0.23 sustained for more than 1.5 seconds

### Mouth Aspect Ratio (MAR)

Mouth opening ratio is calculated using vertical and horizontal mouth landmarks.

Condition:
MAR > 0.6 sustained for more than 1.2 seconds

### Head Nod Detection

Nose vertical displacement is compared against a baseline.

Condition:
Nose drop > 0.08 sustained for more than 1.2 seconds

### Face Tilt Detection

Tilt angle is calculated using the angle between the outer eye landmarks.

Condition:
Absolute angle > 15 degrees (logged as tilt behavior)

---

## Project Structure

```
src/
 ├── components/
 │    └── CameraFeed.tsx
 ├── pages/
 │    └── DetectionPage.tsx
 ├── App.tsx
 └── main.tsx
```

---

## Installation

Clone the repository:

```
git clone https://github.com/DivyashreeR25/drowsyguard-ai.git
cd drowsyguard-ai
```

Install dependencies:

```
npm install
```

Run locally:

```
npm run dev
```

---

## Deployment

The project is deployed using Vercel.

Each push to the main branch triggers automatic deployment via continuous integration.

---

## Privacy and Security

* No images are uploaded to any server.
* No backend processing is involved.
* All facial landmark inference runs entirely within the user's browser.
* No user data is stored.

---

## Author

Divyashree R
AI and Full-Stack Developer

GitHub: [https://github.com/DivyashreeR25](https://github.com/DivyashreeR25)

---
