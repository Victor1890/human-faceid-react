import type { Config, Human, FaceResult } from '@vladmandic/human';
import { MutableRefObject, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { BLINK, OK, OPTIONS } from './rules'

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
    const [startTime, setStartTime] = useState(0);

    const timestamp = useMemo(() => ({ detect: 0, draw: 0 }), []);

    let faces: FaceResult[] = useMemo(() => [], []);

    const options = useMemo(() => ({
        ...OPTIONS,
        mask: config?.face?.detector?.mask,
        rotation: config?.face?.detector?.rotation,
    }), []);

    const allIsOk = useCallback(() =>
        OK.faceCount.status &&
        OK.faceSize.status &&
        OK.blinkDetected.status &&
        OK.facingCenter.status &&
        OK.lookingCenter.status &&
        OK.faceConfidence.status &&
        OK.antispoofCheck.status &&
        OK.livenessCheck.status &&
        OK.distance.status &&
        OK.descriptor.status &&
        OK.gender.status
        , [JSON.stringify(OK)]);

    function drawValidationTests() {
        if (!divRef.current || videoRef.current?.paused) return;

        let y = 32;
        for (const [key, val] of Object.entries(OK)) {
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

        OK.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;

        setFps?.(OK.detectFPS.val);
        timestamp.detect = now;

        requestAnimationFrame(detectionLoop);
    }

    async function drawLoop() {

        if (!human || !videoRef.current || !canvasRef.current) throw new Error('Human not initialized');

        human.draw.canvas(videoRef.current, canvasRef.current);

        const now = human.now();
        OK.drawFPS.val = Math.round(10000 / (now - timestamp.draw)) / 10;
        timestamp.draw = now;

        OK.faceCount.val = human.result.face.length;
        OK.faceCount.status = OK.faceCount.val === 1;

        if (OK.faceCount.status) {
            const face = human.result.face[0];
            const gestures: string[] = Object.values(human.result.gesture).map((gesture) => gesture.gesture);
            if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) BLINK.start = human.now();
            if (BLINK.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) BLINK.end = human.now();
            OK.blinkDetected.status = OK.blinkDetected.status || (Math.abs(BLINK.end - BLINK.start) > options.blinkMin && Math.abs(BLINK.end - BLINK.start) < options.blinkMax);
            if (OK.blinkDetected.status && BLINK.time === 0) BLINK.time = Math.trunc(BLINK.end - BLINK.start);
            OK.facingCenter.status = gestures.includes('facing center');
            OK.lookingCenter.status = gestures.includes('looking center');
            OK.faceConfidence.val = face.faceScore || face.boxScore || 0;
            OK.faceConfidence.status = OK.faceConfidence.val >= options.minConfidence;
            OK.antispoofCheck.val = face.real || 0;
            OK.antispoofCheck.status = OK.antispoofCheck.val >= options.minConfidence;
            OK.livenessCheck.val = face.live || 0;
            OK.livenessCheck.status = OK.livenessCheck.val >= options.minConfidence;
            OK.faceSize.val = Math.min(face.box[2], face.box[3]);
            OK.faceSize.status = OK.faceSize.val >= options.minSize;
            OK.distance.val = face.distance || 0;
            OK.distance.status = (OK.distance.val >= options.distanceMin) && (OK.distance.val <= options.distanceMax);
            OK.descriptor.val = face.embedding?.length || 0;
            OK.descriptor.status = OK.descriptor.val > 0;
            OK.age.val = face.age || 0;
            OK.age.status = OK.age.val > 0;
            OK.gender.val = face.genderScore || 0;
            OK.gender.status = OK.gender.val >= options.minConfidence;
        }

        OK.timeout.status = OK.elapsedMs.val < options.maxTime;

        faces = human.result.face

        if (allIsOk() || !OK.timeout.status) {
            return videoRef.current.pause();
        }

        OK.elapsedMs.val = Math.trunc(human.now() - startTime);

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
