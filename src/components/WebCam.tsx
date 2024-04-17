import { useState, useEffect, useRef } from 'react';

interface Props { elementId: string }

const InitWebCam = ({ elementId }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [ready, setReady] = useState(false);
    const [stream, setStream] = useState<MediaStream | undefined>();
    const [track, setTrack] = useState<MediaStreamTrack | undefined>();
    const [settings, setSettings] = useState<MediaTrackSettings | undefined>();
    const [constraints, setConstraints] = useState<MediaStreamConstraints | undefined>();
    const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | undefined>();

    useEffect(() => {
        if (typeof document === 'undefined') {
            throw new Error('WebCam component requires a DOM');
        }

        const video = document.getElementById(elementId) as HTMLVideoElement || document.createElement('video');
        video.style.display = 'none';
        video.id = elementId;
        videoRef.current = video;

        const constraints = {
            audio: false,
            video: { facingMode: 'user', width: { ideal: document.body.clientWidth } }
        };
        setConstraints(constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            setStream(stream);
            setTrack(track);
            setCapabilities(capabilities);
            setSettings(settings);

            video.onloadeddata = () => setReady(true);
            video.srcObject = stream;
            video.play();
        });
    }, [elementId]);

    useEffect(() => {
        if (ready && videoRef.current && track) {
            console.log(
                'video:',
                videoRef.current.videoWidth,
                videoRef.current.videoHeight,
                track.label,
                {
                    stream,
                    track,
                    settings,
                    constraints,
                    capabilities
                }
            );
        }
    }, [ready, stream, track, settings, constraints, capabilities]);

    return null;
};

export default InitWebCam;