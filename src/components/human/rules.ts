export const OPTIONS = {
    minConfidence: 0.6,
    minSize: 200,
    maxTime: 30000,
    // maxTime: Infinity,
    blinkMin: 10,
    blinkMax: 800,
    threshold: 0.5,
    distanceMin: 0.4,
    distanceMax: 1.0,
    minScore: 0.4,
    order: 2,
    multiplier: 25,
    min: 0.2,
    max: 0.8
}

export const OK = {
    faceCount: { status: false, val: 0 },
    faceConfidence: { status: false, val: 0 },
    facingCenter: { status: false, val: 0 },
    lookingCenter: { status: false, val: 0 },
    blinkDetected: { status: false, val: 0 },
    faceSize: { status: false, val: 0 },
    antispoofCheck: { status: false, val: 0 },
    livenessCheck: { status: false, val: 0 },
    distance: { status: false, val: 0 },
    age: { status: false, val: 0 },
    gender: { status: false, val: 0 },
    timeout: { status: true, val: 0 },
    descriptor: { status: false, val: 0 },
    elapsedMs: { status: undefined, val: 0 }, // total time while waiting for valid face
    detectFPS: { status: undefined, val: 0 }, // mark detection fps performance
    drawFPS: { status: undefined, val: 0 }, // mark redraw fps performance
}

export const BLINK = {
    start: 0,
    end: 0,
    time: 0,
}