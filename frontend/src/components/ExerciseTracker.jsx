import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Camera, CheckCircle2, Dumbbell, Play, RotateCcw, Square, XCircle } from 'lucide-react';
import { Button } from './Button';

const MEDIAPIPE_VERSION = '0.10.35';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  import.meta.env.VITE_MEDIAPIPE_MODEL_URL ||
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

const EXERCISES = ['Squats', 'Pushups', 'Bicep Curls', 'Jumping Jacks'];
const MIN_VISIBILITY = 0.45;

const INITIAL_POSE_STATE = {
  reps: 0,
  phase: 'ready',
  feedback: 'Stand in frame',
  metric: 0,
  visible: false,
  quality: 'idle',
  confidence: 0
};

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28]
];

const REQUIRED_LANDMARKS = {
  Squats: [11, 12, 23, 24, 25, 26, 27, 28],
  Pushups: [11, 12, 13, 14, 15, 16, 23, 24, 27, 28],
  'Bicep Curls': [11, 12, 13, 14, 15, 16],
  'Jumping Jacks': [11, 12, 15, 16, 27, 28]
};

function isVisible(point) {
  return Boolean(point && (point.visibility ?? 1) >= MIN_VISIBILITY);
}

function averagePoint(points) {
  const visiblePoints = points.filter(isVisible);
  if (!visiblePoints.length) return null;
  return {
    x: visiblePoints.reduce((sum, point) => sum + point.x, 0) / visiblePoints.length,
    y: visiblePoints.reduce((sum, point) => sum + point.y, 0) / visiblePoints.length
  };
}

function mean(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function angle(a, b, c) {
  if (!isVisible(a) || !isVisible(b) || !isVisible(c)) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const magnitude = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!magnitude) return null;
  const cosine = (ab.x * cb.x + ab.y * cb.y) / magnitude;
  return Math.acos(Math.min(Math.max(cosine, -1), 1)) * (180 / Math.PI);
}

function visibilityScore(landmarks, indices) {
  const visibleCount = indices.filter((index) => isVisible(landmarks[index])).length;
  return Math.round((visibleCount / indices.length) * 100);
}

function idleState(previous, feedback = 'Step back so your full body is visible') {
  return {
    ...previous,
    visible: false,
    confidence: 0,
    quality: 'idle',
    feedback
  };
}

function analyzePose(exercise, landmarks, previous) {
  if (!landmarks?.length) return idleState(previous, 'Move into frame');

  const confidence = visibilityScore(landmarks, REQUIRED_LANDMARKS[exercise]);
  if (confidence < 65) return idleState(previous);

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  let reps = previous.reps;
  let phase = previous.phase;
  let feedback = 'Good form';
  let metric = 0;
  let quality = 'good';

  if (exercise === 'Squats') {
    const kneeAngle = mean([
      angle(leftHip, leftKnee, leftAnkle),
      angle(rightHip, rightKnee, rightAnkle)
    ]);
    if (!kneeAngle) return idleState(previous);

    metric = Math.round(kneeAngle);
    if (kneeAngle < 105) phase = 'bottom';
    if (previous.phase === 'bottom' && kneeAngle > 160) {
      reps += 1;
      phase = 'top';
    }

    const kneeGap = Math.abs(leftKnee.x - rightKnee.x);
    const ankleGap = Math.abs(leftAnkle.x - rightAnkle.x);
    if (ankleGap > 0.08 && kneeGap < ankleGap * 0.55) {
      feedback = 'Press knees outward';
      quality = 'warning';
    } else if (kneeAngle > 165) {
      feedback = 'Start your squat';
    } else if (kneeAngle < 115) {
      feedback = 'Drive up through heels';
    } else {
      feedback = 'Lower under control';
    }
  }

  if (exercise === 'Pushups') {
    const elbowAngle = mean([
      angle(leftShoulder, leftElbow, leftWrist),
      angle(rightShoulder, rightElbow, rightWrist)
    ]);
    const shoulder = averagePoint([leftShoulder, rightShoulder]);
    const hip = averagePoint([leftHip, rightHip]);
    const ankle = averagePoint([leftAnkle, rightAnkle]);
    if (!elbowAngle || !shoulder || !hip || !ankle) return idleState(previous);

    metric = Math.round(elbowAngle);
    if (elbowAngle < 95) phase = 'down';
    if (previous.phase === 'down' && elbowAngle > 155) {
      reps += 1;
      phase = 'top';
    }

    const expectedHipY = (shoulder.y + ankle.y) / 2;
    if (Math.abs(hip.y - expectedHipY) > 0.14) {
      feedback = 'Keep hips in line';
      quality = 'warning';
    } else if (elbowAngle < 105) {
      feedback = 'Press up';
    } else if (elbowAngle > 155) {
      feedback = 'Lower your chest';
    } else {
      feedback = 'Smooth pushup';
    }
  }

  if (exercise === 'Bicep Curls') {
    const elbowAngle = mean([
      angle(leftShoulder, leftElbow, leftWrist),
      angle(rightShoulder, rightElbow, rightWrist)
    ]);
    if (!elbowAngle) return idleState(previous);

    metric = Math.round(elbowAngle);
    if (elbowAngle < 70) phase = 'curl';
    if (previous.phase === 'curl' && elbowAngle > 145) {
      reps += 1;
      phase = 'extended';
    }

    const leftDrift = isVisible(leftElbow) && isVisible(leftShoulder) ? Math.abs(leftElbow.x - leftShoulder.x) : 0;
    const rightDrift = isVisible(rightElbow) && isVisible(rightShoulder) ? Math.abs(rightElbow.x - rightShoulder.x) : 0;
    if (Math.max(leftDrift, rightDrift) > 0.18) {
      feedback = 'Pin elbows near torso';
      quality = 'warning';
    } else if (elbowAngle < 80) {
      feedback = 'Extend with control';
    } else if (elbowAngle > 145) {
      feedback = 'Curl up';
    } else {
      feedback = 'Steady curl';
    }
  }

  if (exercise === 'Jumping Jacks') {
    const shoulder = averagePoint([leftShoulder, rightShoulder]);
    if (!shoulder || !isVisible(leftWrist) || !isVisible(rightWrist) || !isVisible(leftAnkle) || !isVisible(rightAnkle)) {
      return idleState(previous);
    }

    const footSpread = Math.abs(leftAnkle.x - rightAnkle.x);
    const wristsOverShoulders = leftWrist.y < shoulder.y && rightWrist.y < shoulder.y;
    const wristsDown = leftWrist.y > shoulder.y && rightWrist.y > shoulder.y;
    const open = footSpread > 0.32 && wristsOverShoulders;
    const closed = footSpread < 0.22 && wristsDown;

    metric = Math.round(footSpread * 100);
    if (open) phase = 'open';
    if (previous.phase === 'open' && closed) {
      reps += 1;
      phase = 'closed';
    }

    if (open) {
      feedback = 'Arms overhead';
    } else if (closed) {
      feedback = 'Open arms and feet';
    } else {
      feedback = 'Finish the full range';
    }
  }

  return {
    reps,
    phase,
    feedback,
    metric,
    visible: true,
    quality,
    confidence
  };
}

function waitForVideo(video) {
  if (video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });
}

export function ExerciseTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const exerciseRef = useRef('Squats');
  const trackingRef = useRef(false);
  const startingRef = useRef(false);
  const stateRef = useRef(INITIAL_POSE_STATE);

  const [exercise, setExercise] = useState('Squats');
  const [status, setStatus] = useState('Ready');
  const [tracking, setTracking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [poseState, setPoseState] = useState(INITIAL_POSE_STATE);

  const feedbackState = poseState.quality === 'warning' ? 'warning' : poseState.visible ? 'good' : 'idle';
  const metricLabel = exercise === 'Jumping Jacks' ? 'Foot spread' : 'Joint angle';
  const metricValue = exercise === 'Jumping Jacks' ? `${poseState.metric}%` : `${poseState.metric} deg`;

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      trackingRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const stream = video?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
      if (video) video.srcObject = null;
      detectorRef.current?.close?.();
    };
  }, []);

  async function loadDetector() {
    if (detectorRef.current) return detectorRef.current;

    setStatus('Loading MediaPipe model');
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);

    try {
      detectorRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });
    } catch {
      detectorRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });
    }

    return detectorRef.current;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function syncCanvasSize() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const width = video.videoWidth || 960;
    const height = video.videoHeight || 540;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }

  function drawPose(landmarks) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks?.length) return;

    context.save();
    context.lineWidth = Math.max(3, canvas.width * 0.004);
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(45, 212, 191, 0.92)';

    for (const [start, end] of POSE_CONNECTIONS) {
      const from = landmarks[start];
      const to = landmarks[end];
      if (!isVisible(from) || !isVisible(to)) continue;
      context.beginPath();
      context.moveTo(from.x * canvas.width, from.y * canvas.height);
      context.lineTo(to.x * canvas.width, to.y * canvas.height);
      context.stroke();
    }

    for (const point of landmarks) {
      if (!isVisible(point)) continue;
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(4, canvas.width * 0.006), 0, Math.PI * 2);
      context.fillStyle = '#f8fafc';
      context.fill();
      context.lineWidth = Math.max(2, canvas.width * 0.0025);
      context.strokeStyle = '#2dd4bf';
      context.stroke();
    }

    context.restore();
  }

  function resetCounter(nextFeedback = 'Stand in frame') {
    const nextState = {
      ...INITIAL_POSE_STATE,
      feedback: nextFeedback
    };
    stateRef.current = nextState;
    setPoseState(nextState);
  }

  function stopTracking(nextStatus = 'Paused') {
    trackingRef.current = false;
    startingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const video = videoRef.current;
    const stream = video?.srcObject;
    stream?.getTracks?.().forEach((track) => track.stop());
    if (video) video.srcObject = null;

    lastVideoTimeRef.current = -1;
    clearCanvas();
    setStarting(false);
    setTracking(false);
    setStatus(nextStatus);
  }

  function loop() {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!trackingRef.current || !video || !detector) return;

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      syncCanvasSize();
      const result = detector.detectForVideo(video, performance.now());
      const landmarks = result.landmarks?.[0];

      drawPose(landmarks);
      const nextState = analyzePose(exerciseRef.current, landmarks, stateRef.current);
      stateRef.current = nextState;
      setPoseState(nextState);
    }

    animationRef.current = requestAnimationFrame(loop);
  }

  async function startTracking() {
    if (trackingRef.current || startingRef.current) return;

    let stream;
    try {
      startingRef.current = true;
      setStarting(true);
      setStatus('Preparing webcam tracker');

      const detector = await loadDetector();
      setStatus('Requesting webcam access');

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      const video = videoRef.current;
      if (!video) throw new Error('Video element is not ready');

      video.srcObject = stream;
      await waitForVideo(video);
      await video.play();

      detectorRef.current = detector;
      trackingRef.current = true;
      lastVideoTimeRef.current = -1;
      resetCounter('Find your starting position');
      setTracking(true);
      setStatus('Tracking live');
      animationRef.current = requestAnimationFrame(loop);
    } catch (error) {
      stream?.getTracks?.().forEach((track) => track.stop());
      trackingRef.current = false;
      const message = error?.name === 'NotAllowedError' ? 'Camera permission was blocked' : error?.message || 'Camera/model unavailable';
      setStatus(message);
      setTracking(false);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }

  function switchExercise(nextExercise) {
    exerciseRef.current = nextExercise;
    setExercise(nextExercise);
    resetCounter('Find your starting position');
  }

  return (
    <section id="tracker" className="glass rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-950 p-2 text-mint dark:bg-white dark:text-slate-950">
            <Camera />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Exercise Tracking</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">MediaPipe webcam posture detection and rep counting.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => resetCounter('Counter reset')} disabled={starting}>
            <RotateCcw size={16} /> Reset
          </Button>
          {!tracking ? (
            <Button variant="accent" onClick={startTracking} disabled={starting}>
              <Play size={16} /> {starting ? 'Starting' : 'Start'}
            </Button>
          ) : (
            <Button variant="danger" onClick={() => stopTracking()}>
              <Square size={16} /> Stop
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full scale-x-[-1] object-cover transition-opacity ${tracking ? 'opacity-100' : 'opacity-0'}`}
            playsInline
            muted
          />
          <canvas ref={canvasRef} width={960} height={540} className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />

          {!tracking && (
            <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
              <div>
                <Dumbbell className="mx-auto mb-3 text-mint" size={42} />
                <p className="text-xl font-bold">{starting ? 'Starting camera' : 'Webcam pose monitor'}</p>
                <p className="mt-2 text-sm text-slate-300">{starting ? 'Loading model and waiting for camera access.' : 'Start tracking to count reps and check movement quality.'}</p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-lg bg-slate-950/80 px-3 py-2 text-xs font-bold text-white backdrop-blur">
            {status}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchExercise(item)}
                className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  exercise === item
                    ? 'border-mint bg-mint text-slate-950'
                    : 'border-slate-200 bg-white/70 hover:border-mint dark:border-slate-700 dark:bg-slate-950/50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/70 p-4 dark:bg-slate-950/50">
              <p className="text-sm text-slate-500">Reps</p>
              <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{poseState.reps}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-4 dark:bg-slate-950/50">
              <p className="text-sm text-slate-500">{metricLabel}</p>
              <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{metricValue}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              {feedbackState === 'warning' && <XCircle className="text-coral" />}
              {feedbackState === 'good' && <CheckCircle2 className="text-mint" />}
              {feedbackState === 'idle' && <Camera className="text-slate-400" />}
              <p className="font-bold">{poseState.feedback}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900">
                <p className="text-xs text-slate-500">Phase</p>
                <p className="font-bold capitalize">{poseState.phase}</p>
              </div>
              <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900">
                <p className="text-xs text-slate-500">Pose confidence</p>
                <p className="font-bold">{poseState.confidence}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Keep your whole body inside the camera view for best counting.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
