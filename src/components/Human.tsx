import { useState, useEffect, useRef } from 'react';
import type { Human, Config, Result } from '@vladmandic/human';
import { Database } from '../libs/database'

const database = Database.instance;

const config: Partial<Config> = {
    cacheSensitivity: 0,
    debug: false,
    modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
    cacheModels: true,
    filter: {
        enabled: true,
        equalization: true
    },
    face: {
        enabled: true,
        detector: {
            rotation: true,
            return: true,
            mask: true
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

interface Props {
    inputId: string,
    outputId: string,
    callback?: (human: Result) => void
};

const RunHuman = ({ inputId, outputId, callback }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [human, setHuman] = useState<Human | undefined>();
    const [ready, setReady] = useState(false);
    const [frame, setFrame] = useState(0);
    const [, setFps] = useState(0);
    const timestamp = useRef(0);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        videoRef.current = document.getElementById(inputId) as HTMLVideoElement || document.createElement('video');
        canvasRef.current = document.getElementById(outputId) as HTMLCanvasElement || document.createElement('canvas');

        database.settings().then(() => {
            import('@vladmandic/human').then((H) => {
                const humanInstance = new (H as any).default(config) as Human;
                humanInstance.load().then(() => {
                    humanInstance.warmup().then(() => {
                        setReady(true);
                        setHuman(humanInstance);
                        console.log('ready...');
                    });
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
        // ready,
        // human,
        frame
    ]);

    const detect = async () => {
        if (!human || !videoRef.current || !canvasRef.current) return;
        await human.detect(videoRef.current);
        const now = human.now();

        const fps = 1000 / (now - timestamp.current);

        console.log("FPS: ", fps)

        setFps(fps);
        timestamp.current = now;
        setFrame(prev => ++prev);
    }

    if (!videoRef.current || !canvasRef.current || !human || !human.result) return null;
    if (!videoRef.current.paused) {
        const interpolated = human.next(human.result);

        if (callback) callback(interpolated);

        human.draw.canvas(videoRef.current, canvasRef.current);
        human.draw.all(canvasRef.current, interpolated);
    }

    return null;
};

export default RunHuman;