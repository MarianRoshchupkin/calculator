import { NativeModules } from 'react-native';

const { FrameProcessorPlugin } = NativeModules;
console.log('All native modules:', NativeModules);
console.log('FrameProcessorPlugin:', FrameProcessorPlugin);

export default {
  convertFrame: (frame: any): Promise<string> => {
    return FrameProcessorPlugin.call(frame, []);
  },
};