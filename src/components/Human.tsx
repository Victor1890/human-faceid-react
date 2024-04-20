import { useState, useEffect, useRef, memo, MutableRefObject } from 'react';
import type { Human, Config, Result } from '@vladmandic/human';
import { Database } from '../libs/database'

const database = Database.instance;

const config: Partial<Config> = {
    cacheSensitivity: 0,
    debug: false,
    // modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
    modelBasePath: 'node_modules/@vladmandic/human-models/models',
    cacheModels: true,
    filter: {
        enabled: true,
        equalization: true
    },
    face: {
        enabled: true,
        detector: {
            rotation: true,
            minConfidence: 0.2,
            return: true,
            mask: true,
        },
        description: { enabled: true },
        iris: { enabled: true },
        emotion: { enabled: true },
        antispoof: { enabled: true },
        liveness: { enabled: true },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: true },
}

interface FaceInfo {
    face?: Result
}

interface Props {
    inputId: string,
    outputId: string,
    sourceId: string,
    moreInfo?: boolean,
    faceInfoCb?: (data: FaceInfo) => void,
    saveRef: MutableRefObject<HTMLButtonElement | null>
    resetRef: MutableRefObject<HTMLButtonElement | null>
};

const RunHuman = ({
    inputId,
    outputId,
    sourceId,
    saveRef,
    resetRef,
    moreInfo = false,
    faceInfoCb,
}: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sourceRef = useRef<HTMLCanvasElement | null>(null);
    const [human, setHuman] = useState<Human | undefined>();
    const [ready, setReady] = useState(false);
    const [frame, setFrame] = useState(0);
    const timestamp = useRef(0);

    const detect = async () => {
        if (!human || !videoRef.current || !canvasRef.current) return;
        await human.detect(videoRef.current);
        const now = human.now();

        timestamp.current = now;
        setFrame(prev => ++prev);
    }

    useEffect(() => {
        if (typeof document === 'undefined') return;
        videoRef.current = document.getElementById(inputId) as HTMLVideoElement || document.createElement('video');
        canvasRef.current = document.getElementById(outputId) as HTMLCanvasElement || document.createElement('canvas');
        sourceRef.current = document.getElementById(sourceId) as HTMLCanvasElement || document.createElement('source');

        database.settings().then(() => {
            import('@vladmandic/human').then((H) => {
                const humanInstance = new (H as any).default(config) as Human;
                Promise.all([
                    humanInstance.load(),
                    humanInstance.warmup()
                ]).then(() => {
                    setReady(true);
                    setHuman(humanInstance);
                    console.log('ready...');
                });
            });
        });
    }, [inputId, outputId]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.onresize = () => {
                if (canvasRef.current) {
                    canvasRef.current.width = videoRef.current!.videoWidth;
                    canvasRef.current.height = videoRef.current!.videoHeight;

                    canvasRef.current.style.width = '50%';
                    canvasRef.current.style.height = '50%';
                }
            }
        }

        if (canvasRef.current) {
            canvasRef.current.onclick = () => {
                if (videoRef.current) {
                    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                }
            }
        }
    }, [
        frame
    ]);

    useEffect(() => {
        if (ready && human && videoRef.current && canvasRef.current) {
            detect();
        }
    }, [
        ready,
        human,
        frame
    ]);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current || !human || !human.result) return;
        if (videoRef.current.paused) return

        const interpolated = human.next(human.result);
        human.draw.canvas(videoRef.current, canvasRef.current);
        moreInfo && human.draw.all(canvasRef.current, interpolated);

    }, [
        videoRef.current,
        canvasRef.current,
        human,
        frame
    ]);

    useEffect(() => {

        if (!saveRef.current || !resetRef.current) return;

        saveRef.current.onclick = async () => {
            if (!sourceRef.current || !canvasRef.current) return null;


            const interpolated = human?.next(human.result);
            console.log("human.result: ", human?.result)
            console.log("interpolated: ", interpolated)
            if (!interpolated) throw new Error('No face detected');

            const image = canvasRef?.current?.getContext('2d')?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (!image) throw new Error('No image data');

            sourceRef.current.width = videoRef.current!.videoWidth;
            sourceRef.current.height = videoRef.current!.videoHeight;

            sourceRef.current.style.display = 'block';

            sourceRef.current.style.width = '50%';
            sourceRef.current.style.height = '50%';

            sourceRef.current?.getContext('2d')?.putImageData(image, 0, 0);
            faceInfoCb?.({ face: interpolated });

            void videoRef.current?.pause();
        }

        resetRef.current.onclick = async () => {
            if (!sourceRef.current || !canvasRef.current) return null;

            sourceRef.current.style.display = 'none';

            void videoRef.current?.play();

        }

    }, [
        resetRef,
        saveRef,
    ])

    return null
};

export default memo(RunHuman);
