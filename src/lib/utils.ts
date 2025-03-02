export const CAPTURE_WIDTH = 1920;
export const CAPTURE_HEIGHT = 1080;

export const skeletonConnections = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [0, 5], [0, 6], [5, 7], [7, 9],
  [6, 8], [8, 10], [5, 6], [5, 11],
  [6, 12], [11, 12], [11, 13], [13, 15],
  [12, 14], [14, 16]
];

const getKeypointColor = (index: number): string => {
  if (index >= 0 && index <= 4) return "red";
  if (index >= 5 && index <= 10) return "blue";
  if (index >= 11 && index <= 16) return "green";
  return "white";
};

const drawSkeleton = (ctx: CanvasRenderingContext2D, analysisResult: any, isPortrait: boolean, width: number, height: number) => {
  const transformPoint = (pt: { x: number; y: number }) => {
    let x, y;

    if (isPortrait) {
      const scaleX = width / CAPTURE_HEIGHT;
      const scaleY = height / CAPTURE_WIDTH;

      x = pt.y * scaleX;
      y = pt.x * scaleY;
    } else {
      const scaleX = width / CAPTURE_WIDTH;
      const scaleY = height / CAPTURE_HEIGHT;

      x = pt.x * scaleX;
      y = pt.y * scaleY;
    }

    return { x, y };
  };

  if (analysisResult && Array.isArray(analysisResult.keypoints)) {
    skeletonConnections.forEach(([a, b]) => {
      const kp1 = analysisResult.keypoints[a];
      const kp2 = analysisResult.keypoints[b];

      if (kp1 && kp1.score > 0.5 && kp2 && kp2.score > 0.5) {
        const pt1 = transformPoint({ x: kp1.x, y: kp1.y });
        const pt2 = transformPoint({ x: kp2.x, y: kp2.y });

        ctx.beginPath();
        ctx.moveTo(Math.round(pt1.x), Math.round(pt1.y));
        ctx.lineTo(Math.round(pt2.x), Math.round(pt2.y));
        ctx.lineWidth = 2;

        const color1 = getKeypointColor(a);
        const color2 = getKeypointColor(b);
        ctx.strokeStyle = color1 === color2 ? color1 : 'lime';
        ctx.stroke();
      }
    });

    analysisResult.keypoints.forEach((kp: { x: number; y: number; score: number } | null, index: number) => {
      if (kp && kp.score > 0.5) {
        const { x, y } = transformPoint({ x: kp.x, y: kp.y });
        const pointColor = getKeypointColor(index);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = pointColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();
      }
    });
  }
};

const debounce = (func: Function, delay: number) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

const normalizeData = (data: any): WSMessage | null => {
  if (data && data.keypoints && Array.isArray(data.keypoints)) {
    const filteredKeypoints = data.keypoints.filter(
      (kp: any) => kp !== null && typeof kp === 'object'
    );
    return { id: Date.now(), keypoints: filteredKeypoints };
  }
  return null;
};

const flushBuffer = () => {
  if (pendingMessages.length > 0) {
    updateCachedData((draft) => {
      draft.push(...pendingMessages);
    });
    pendingMessages = [];
  }
};

export { drawSkeleton, debounce, throttle, normalizeData, flushBuffer };