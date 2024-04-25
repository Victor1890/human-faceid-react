import type { Config, Human, FaceResult } from '@vladmandic/human';
import { MutableRefObject, memo, useCallback, useEffect, useMemo, useState } from 'react';

const config: Partial<Config> = {
    debug: false,
    backend: "webgpu",
    modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
    // modelBasePath: 'node_modules/@vladmandic/human-models/models',
    cacheModels: true,
    filter: {
        enabled: true,
        equalization: true
    },
    face: {
        enabled: true,
        detector: { rotation: false, maxDetected: 100, minConfidence: 0.2, return: true, mask: false },
        iris: { enabled: true },
        description: { enabled: true },
        emotion: { enabled: true },
        antispoof: { enabled: true },
        liveness: { enabled: true },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: true },
}

interface Props {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    sourceRef: React.MutableRefObject<HTMLCanvasElement | null>,
    divRef: React.MutableRefObject<HTMLDivElement | null>,
    moreInfo?: boolean,
    saveRef: MutableRefObject<HTMLButtonElement | null>
    resetRef: MutableRefObject<HTMLButtonElement | null>
    setFps?: (fps: number) => void
};

let faces: FaceResult[] = []

const RunHuman = ({
    videoRef,
    canvasRef,
    sourceRef,
    divRef,
    // saveRef,
    // resetRef,
    setFps
}: Props) => {
    const [human, setHuman] = useState<Human | undefined>();
    // const [face, setFace] = useState<FaceResult | null>(null);
    const [startTime, setStartTime] = useState(0);

    const timestamp = useMemo(() => ({ detect: 0, draw: 0 }), []);

    const options = useMemo(() => ({
        minConfidence: 0.6,
        minSize: 200,
        // maxTime: 30000,
        maxTime: Infinity,
        blinkMin: 10,
        blinkMax: 800,
        threshold: 0.5,
        distanceMin: 0.4,
        distanceMax: 1.0,
        mask: config?.face?.detector?.mask,
        rotation: config?.face?.detector?.rotation,
        minScore: 0.4,
        order: 2,
        multiplier: 25,
        min: 0.2,
        max: 0.8
    }), []);

    const ok = useMemo(() => ({
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
    }), []);

    const blink = useMemo(() => ({
        start: 0,
        end: 0,
        time: 0,
    }), []);

    const allIsOk = useCallback(() =>
        ok.faceCount.status &&
        ok.faceSize.status &&
        ok.blinkDetected.status &&
        ok.facingCenter.status &&
        ok.lookingCenter.status &&
        ok.faceConfidence.status &&
        ok.antispoofCheck.status &&
        ok.livenessCheck.status &&
        ok.distance.status &&
        ok.descriptor.status &&
        ok.gender.status
        , [JSON.stringify(ok)]);

    function drawValidationTests() {
        if (!divRef.current) return;

        let y = 32;
        for (const [key, val] of Object.entries(ok)) {
            let el = document.getElementById(`ok-${key}`);
            if (!el) {
                el = document.createElement('div');
                el.id = `ok-${key}`;
                el.innerText = key;
                el.className = 'ok';
                el.style.top = `${y}px`;
                divRef.current.appendChild(el);
            }
            if (typeof val.status === 'boolean') el.style.backgroundColor = val.status ? 'lightgreen' : 'lightcoral';
            const status = val.status ? 'ok' : 'fail';
            el.innerText = `${key}: ${val.val === 0 ? status : val.val}`;
            y += 28;
        }
    }

    async function detectionLoop() {
        if (!human || !videoRef.current || !canvasRef.current) return;

        if (videoRef.current.paused) return;

        if (faces.length) {
            for (const face of faces) {
                human.tf.dispose(face.tensor);
            }
        }

        await human.detect(videoRef.current);
        const now = human.now();

        ok.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;

        setFps?.(ok.detectFPS.val);
        timestamp.detect = now;

        requestAnimationFrame(detectionLoop);
    }

    async function drawLoop() {

        if (!human || !videoRef.current || !canvasRef.current) throw new Error('Human not initialized');

        human.draw.canvas(videoRef.current, canvasRef.current);

        const now = human.now();
        ok.drawFPS.val = Math.round(10000 / (now - timestamp.draw)) / 10;
        timestamp.draw = now;

        ok.faceCount.val = human.result.face.length;
        ok.faceCount.status = ok.faceCount.val === 1;

        if (ok.faceCount.status) {
            const face = human.result.face[0];
            const gestures: string[] = Object.values(human.result.gesture).map((gesture) => gesture.gesture); // flatten all gestures
            if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) blink.start = human.now(); // blink starts when eyes get closed
            if (blink.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) blink.end = human.now(); // if blink started how long until eyes are back open
            ok.blinkDetected.status = ok.blinkDetected.status || (Math.abs(blink.end - blink.start) > options.blinkMin && Math.abs(blink.end - blink.start) < options.blinkMax);
            if (ok.blinkDetected.status && blink.time === 0) blink.time = Math.trunc(blink.end - blink.start);
            ok.facingCenter.status = gestures.includes('facing center');
            ok.lookingCenter.status = gestures.includes('looking center'); // must face camera and look at camera
            ok.faceConfidence.val = face.faceScore || face.boxScore || 0;
            ok.faceConfidence.status = ok.faceConfidence.val >= options.minConfidence;
            ok.antispoofCheck.val = face.real || 0;
            ok.antispoofCheck.status = ok.antispoofCheck.val >= options.minConfidence;
            ok.livenessCheck.val = face.live || 0;
            ok.livenessCheck.status = ok.livenessCheck.val >= options.minConfidence;
            ok.faceSize.val = Math.min(face.box[2], face.box[3]);
            ok.faceSize.status = ok.faceSize.val >= options.minSize;
            ok.distance.val = face.distance || 0;
            ok.distance.status = (ok.distance.val >= options.distanceMin) && (ok.distance.val <= options.distanceMax);
            ok.descriptor.val = face.embedding?.length || 0;
            ok.descriptor.status = ok.descriptor.val > 0;
            ok.age.val = face.age || 0;
            ok.age.status = ok.age.val > 0;
            ok.gender.val = face.genderScore || 0;
            ok.gender.status = ok.gender.val >= options.minConfidence;
        }

        ok.timeout.status = ok.elapsedMs.val < options.maxTime;

        faces = human.result.face

        if (allIsOk() || !ok.timeout.status) {
            void videoRef.current.pause();

            return;
        }

        ok.elapsedMs.val = Math.trunc(human.now() - startTime);

        drawValidationTests();

        return new Promise((resolve) => {
            const timeOut = setTimeout(async () => {
                await drawLoop()

                clearTimeout(timeOut);

                resolve(true);
            }, 30);
        });
    }

    async function detectFace() {

        if (!canvasRef.current || !human || !sourceRef.current || !videoRef.current) {
            return console.log('detectFace: Missing elements');
        }

        if (!faces.length) {
            console.log('detectFace: No face detected');
            return false;
        }

        const image = canvasRef.current.getContext('2d')?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height) as ImageData;

        void videoRef.current.pause();

        canvasRef.current.style.display = "none";
        sourceRef.current.style.display = "block";

        sourceRef.current.style.width = "50%"
        sourceRef.current.style.height = "auto"

        sourceRef.current.width = canvasRef.current.width;
        sourceRef.current.height = canvasRef.current.height;
        sourceRef.current.getContext('2d')?.putImageData(image, 0, 0);

        fetch("http://localhost:3000/api/face", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                faces
            })
        }).then(res => res.json()).then(data => {
            console.log('Face detected #2: ', data);
        }).catch(err => {
            console.error('Face detected #2: ', err);
        });

    }

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (!videoRef.current || !canvasRef.current) throw new Error('Video or canvas element not found');

        import('@vladmandic/human').then(async (H) => {
            const humanInstance = new (H as any).default(config) as Human;
            if (!humanInstance) throw new Error('Human not initialized');

            await Promise.all([
                humanInstance.load(),
                humanInstance.warmup()
            ]);

            setHuman(humanInstance);

            console.log('Human ready...');
        });
    }, [videoRef.current, canvasRef.current]);

    useEffect(() => {
        async function main() {

            if (!human || !videoRef.current || !canvasRef.current || !sourceRef.current) return;

            await detectionLoop();

            setStartTime(human.now());

            await drawLoop()

            if (!faces.length || !allIsOk()) throw new Error('Face not detected');

            await detectFace();
        }

        main();

    }, [human, videoRef, canvasRef, sourceRef]);

    return null
};

export default memo(RunHuman);
