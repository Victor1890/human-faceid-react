# Face Recognition System - DEMO

This project is a real-time face recognition system built with `human.js`, `Vite`, and `React`. The system provides various metrics related to face detection and recognition, running at high frame rates to ensure efficient and accurate face recognition.

## Features

- **Real-time face detection and recognition**
- **High frame rate processing**
- **Liveness detection**
- **Anti-spoofing checks**
- **Face attribute estimation**

## Metrics Explained

### System Overview
- **FPS:** Frames per second indicating the performance of the system.

### Detected Face Information
- **faceCount:** Number of faces detected in the frame.
- **faceConfidence:** Confidence score of the detected face.
- **facingCenter:** Indicates if the detected face is facing the center.
- **lookingCenter:** Indicates if the detected face is looking at the center.
- **blinkDetected:** Detects if the subject has blinked, used for liveness check.
- **faceSize:** Size of the detected face in pixels.
- **antispoofCheck:** Score indicating the result of an anti-spoofing check.
- **livenessCheck:** Score indicating if the detected face is live.
- **distance:** Distance of the face from the camera.
- **age:** Estimated age of the detected face.
- **gender:** Gender estimation result.
- **timeout:** Status indicating if the system has experienced a timeout.
- **descriptor:** Unique identifier or feature vector for the detected face.

### System Performance Metrics
- **elapsedMs:** Time elapsed since the system started, in milliseconds.
- **detectFPS:** Frames per second for face detection.
- **drawFPS:** Frames per second for rendering the detected face on the screen.

## Technologies Used

- [**human.js:**](https://github.com/vladmandic/human) A flexible and powerful library for face detection and recognition.
- [**Vite:**](https://vitejs.dev/) A fast build tool and development server.
- [**React:**](https://react.dev/) A JavaScript library for building user interfaces.

## Installation

To run the face recognition system, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/Victor1890/human-faceid-react
    ```

2. Navigate to the project directory:
    ```bash
    cd human-faceid-react
    ```

3. Install the required dependencies:
    ```bash
    npm install
    ```

4. Run the development server:
    ```bash
    npm run dev
    ```

5. Open your browser and go to `http://localhost:5173` to see the face recognition system in action.

## Usage

To use the face recognition system, follow these steps:

1. Ensure your webcam is connected and accessible by your browser.
2. Open the application in your browser.
3. Allow the browser to access your webcam.
4. The system will start detecting faces and displaying metrics in real-time.

## Screenshots

Here is a screenshot of the face recognition system in action:

![Face Recognition System - DEMO](https://github.com/Victor1890/human-faceid-react/assets/46900196/036c2bf2-f7f9-445d-995c-648fb93ec1e2)


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the [MIT License](/LICENSE).
