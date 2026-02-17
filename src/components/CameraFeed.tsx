import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

export interface CameraFeedHandle {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

const CameraFeed = forwardRef<CameraFeedHandle>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    async startCamera() {
      if (streamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    },

    stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    },

    getVideoElement() {
      return videoRef.current;
    },
  }));

  return (
    <div className="w-[500px] h-[350px] bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
    </div>
  );
});

export default CameraFeed;
