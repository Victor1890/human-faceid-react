import { useEffect, memo, Fragment } from 'react';

interface Props {
    video: React.MutableRefObject<HTMLVideoElement | null>
    canvas: React.MutableRefObject<HTMLCanvasElement | null>
    source: React.MutableRefObject<HTMLCanvasElement | null>
}

const InitWebCam = ({ video, canvas, source }: Props) => {

    useEffect(() => {
        const init = async () => {
            if (typeof document === 'undefined') throw new Error('WebCam component requires a DOM');
            if (!video.current) throw new Error('Video element not found');

            const constraints = {
                audio: false,
                video: { facingMode: 'user', width: { ideal: document.body.clientWidth } }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(() => null)
            if (!stream) throw new Error('WebCam component requires access to the camera');

            const ready = new Promise((resolve) => {
                if (!video.current) throw new Error('Video element not found');
                video.current.onloadeddata = () => resolve(true);
            });

            video.current.style.display = 'none';
            video.current.srcObject = stream;
            void video.current.play();

            if (source.current) {
                source.current.style.display = 'none';
            }

            ready.then(() => console.log('WebCam ready...'));
        }

        init();

    }, [video.current, source.current]);

    useEffect(() => {

        if (!video.current || !canvas.current) return;

        video.current.onresize = () => {
            if (canvas.current) {
                canvas.current.width = video.current!.videoWidth;
                canvas.current.height = video.current!.videoHeight;

                canvas.current.style.width = '50%';
                canvas.current.style.height = '50%';
            }
        }

        canvas.current.onclick = () => {
            if (video.current) {
                video.current.paused ? video.current.play() : video.current.pause();
            }
        }
    }, [
        video.current,
        canvas.current
    ]);

    // useEffect(() => {

    //     if (!saveRef.current || !resetRef.current) return;

    //     saveRef.current.onclick = async () => {
    //         if (!sourceRef.current || !canvasRef.current || !videoRef.current) return null;

    //         const interpolated = human?.next(human.result);
    //         console.log("interpolated: ", interpolated)
    //         if (!interpolated) throw new Error('No face detected');

    //         const image = canvasRef?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    //         if (!image) throw new Error('No image data');

    //         sourceRef.current.width = videoRef.current.videoWidth;
    //         sourceRef.current.height = videoRef.current.videoHeight;

    //         sourceRef.current.style.display = 'block';

    //         sourceRef.current.style.width = '50%';
    //         sourceRef.current.style.height = '50%';

    //         sourceRef.current?.getContext('2d', { willReadFrequently: true })?.putImageData(image, 0, 0);
    //         // faceInfoCb?.({ data: interpolated, width: canvasRef.current.width });

    //         videoRef.current.style.display = 'none';
    //         void videoRef.current?.pause();
    //     }

    //     resetRef.current.onclick = async () => {
    //         if (!sourceRef.current || !canvasRef.current || !videoRef.current) return null;

    //         sourceRef.current.style.display = 'none';
    //         videoRef.current.style.display = 'none';

    //         void videoRef.current?.play();

    //         detect()
    //     }
    // }, [
    //     canvasRef,
    //     videoRef,
    //     sourceRef,
    //     resetRef,
    //     saveRef,
    // ])

    return (
        <Fragment>
            <canvas ref={canvas} />
            <video ref={video} autoPlay muted />
            <canvas ref={source} />
        </Fragment>
    )
};

export default memo(InitWebCam);