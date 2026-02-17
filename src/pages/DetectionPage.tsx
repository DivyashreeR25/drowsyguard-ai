import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Play, Square } from "lucide-react";
import CameraFeed, { CameraFeedHandle } from "@/components/CameraFeed";

const statusStyles: Record<string, string> = {
  awake: "bg-status-awake",
  drowsy: "bg-status-drowsy",
  yawn: "bg-status-drowsy",
  no_face_detected: "bg-muted-foreground",
};

const statusLabels: Record<string, string> = {
  awake: "Awake",
  drowsy: "⚠ Drowsy!",
  yawn: "🥱 Yawning!",
  no_face_detected: "No Face Detected",
  detection_stopped: "Detection Stopped",
};

const DetectionPage = () => {
  const navigate = useNavigate();

  const cameraRef = useRef<CameraFeedHandle>(null);
  const faceMeshRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Timers
  const closedEyeStartRef = useRef<number | null>(null);
  const yawnStartRef = useRef<number | null>(null);
  const headDownStartRef = useRef<number | null>(null);

  // Baseline
  const baselineNoseYRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<string>("idle");

  // ================= BEEP =================

  const startBeep = useCallback(() => {
    if (oscillatorRef.current) return;

    console.log("🔊 ALARM STARTED");

    const ctx =
      audioCtxRef.current ||
      new (window.AudioContext || (window as any).webkitAudioContext)();

    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 850;
    osc.connect(ctx.destination);
    osc.start();

    oscillatorRef.current = osc;
  }, []);

  const stopBeep = useCallback(() => {
    if (oscillatorRef.current) {
      console.log("🔇 ALARM STOPPED");
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === "drowsy" || status === "yawn") {
      startBeep();
    } else {
      stopBeep();
    }
  }, [status, startBeep, stopBeep]);

  // ================= START =================

  const handleStart = async () => {
    try {
      console.log("🚀 Starting detection...");

      await cameraRef.current?.startCamera();

      const videoElement = cameraRef.current?.getVideoElement?.();
      if (!videoElement) {
        console.error("❌ Video element not available");
        return;
      }

      // ✅ Get FaceMesh from window (CDN)
      const FaceMeshConstructor = (window as any).FaceMesh;

      if (!FaceMeshConstructor) {
        console.error("❌ FaceMesh not loaded from CDN");
        return;
      }

      const faceMesh = new FaceMeshConstructor({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (!results.multiFaceLandmarks?.length) {
          console.log("❌ No face detected");
          setStatus("no_face_detected");
          return;
        }

        console.log("✅ Face detected");

        const landmarks = results.multiFaceLandmarks[0];

        const distance = (a: any, b: any) =>
          Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        // ================= EAR =================

        const leftEAR =
          (distance(landmarks[160], landmarks[144]) +
            distance(landmarks[158], landmarks[153])) /
          (2 * distance(landmarks[33], landmarks[133]));

        const rightEAR =
          (distance(landmarks[385], landmarks[380]) +
            distance(landmarks[387], landmarks[373])) /
          (2 * distance(landmarks[362], landmarks[263]));

        const avgEAR = (leftEAR + rightEAR) / 2;

        console.log("👁 Avg EAR:", avgEAR.toFixed(4));

        const EAR_THRESHOLD = 0.23;
        const EYE_TIME = 1500;

        if (avgEAR < EAR_THRESHOLD) {
          if (!closedEyeStartRef.current) {
            closedEyeStartRef.current = Date.now();
            console.log("⏳ Eye closed timer started");
          } else {
            const elapsed = Date.now() - closedEyeStartRef.current;
            console.log("⏱ Eye closed duration:", elapsed);

            if (elapsed > EYE_TIME) {
              console.log("⚠ DROWSINESS (Eyes)");
              setStatus("drowsy");
            }
          }
        } else {
          closedEyeStartRef.current = null;
        }

        // ================= YAWN =================

        const mouthRatio =
          distance(landmarks[13], landmarks[14]) /
          distance(landmarks[78], landmarks[308]);

        console.log("👄 Mouth Ratio:", mouthRatio.toFixed(4));

        const YAWN_THRESHOLD = 0.6;
        const YAWN_TIME = 1200;

        if (mouthRatio > YAWN_THRESHOLD) {
          if (!yawnStartRef.current) {
            yawnStartRef.current = Date.now();
            console.log("😮 Yawn timer started");
          } else {
            const elapsed = Date.now() - yawnStartRef.current;
            console.log("⏱ Yawn duration:", elapsed);

            if (elapsed > YAWN_TIME) {
              console.log("🥱 YAWN DETECTED");
              setStatus("yawn");
            }
          }
        } else {
          yawnStartRef.current = null;
        }

        // ================= HEAD NOD =================

        const nose = landmarks[1];

        if (!baselineNoseYRef.current) {
          baselineNoseYRef.current = nose.y;
          console.log("📏 Baseline nose Y set:", nose.y);
        }

        const noseDrop = nose.y - baselineNoseYRef.current;
        console.log("🧠 Nose drop:", noseDrop.toFixed(4));

        const HEAD_DROP_THRESHOLD = 0.08;
        const HEAD_TIME = 1200;

        if (noseDrop > HEAD_DROP_THRESHOLD) {
          if (!headDownStartRef.current) {
            headDownStartRef.current = Date.now();
            console.log("⬇ Head-down timer started");
          } else {
            const elapsed = Date.now() - headDownStartRef.current;
            console.log("⏱ Head-down duration:", elapsed);

            if (elapsed > HEAD_TIME) {
              console.log("🚨 HEAD NOD DETECTED");
              setStatus("drowsy");
            }
          }
        } else {
          headDownStartRef.current = null;
        }

        // ================= FACE TILT =================

        const leftEyeOuter = landmarks[33];
        const rightEyeOuter = landmarks[263];

        const deltaY = rightEyeOuter.y - leftEyeOuter.y;
        const deltaX = rightEyeOuter.x - leftEyeOuter.x;

        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        console.log("🧭 Face tilt angle:", angle.toFixed(2));

        if (
          avgEAR >= EAR_THRESHOLD &&
          mouthRatio <= YAWN_THRESHOLD &&
          noseDrop <= HEAD_DROP_THRESHOLD
        ) {
          setStatus("awake");
        }
      });

      faceMeshRef.current = faceMesh;

      const processFrame = async () => {
        if (!faceMeshRef.current) return;
        await faceMeshRef.current.send({ image: videoElement });
        animationRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
      setDetecting(true);
      setStatus("awake");

      console.log("✅ Detection running");
    } catch (error) {
      console.error("❌ Error starting detection:", error);
    }
  };

  // ================= STOP =================

  const handleStop = () => {
    console.log("🛑 Stopping detection");

    cameraRef.current?.stopCamera();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    stopBeep();
    setDetecting(false);
    setStatus("detection_stopped");

    closedEyeStartRef.current = null;
    yawnStartRef.current = null;
    headDownStartRef.current = null;
    baselineNoseYRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      stopBeep();
    };
  }, [stopBeep]);

  const statusDot = statusStyles[status];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <button
          onClick={() => {
            handleStop();
            navigate("/");
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          <span className="font-bold">DrowsyGuard</span>
        </div>

        <div className="w-20" />
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <CameraFeed ref={cameraRef} />

        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={detecting}
            className="bg-primary px-6 py-3 rounded-full text-white flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Detection
          </button>

          <button
            onClick={handleStop}
            disabled={!detecting}
            className="border px-6 py-3 rounded-full flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop Detection
          </button>
        </div>
      </main>

      <div className="border-t py-4 text-center">
        {statusDot && (
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${statusDot}`} />
        )}
        <span className="font-semibold">
          {statusLabels[status] || "Ready"}
        </span>
      </div>
    </div>
  );
};

export default DetectionPage;
