export type WSMessage = {
  id: number;
  keypoints: Array<{ x: number; y: number; score: number }>;
}