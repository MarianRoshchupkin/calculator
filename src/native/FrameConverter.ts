import {NativeModules} from 'react-native';

const {FrameConverter} = NativeModules;
console.log('All native modules:', NativeModules);
console.log('FrameConverter:', NativeModules.FrameConverter);

export default {
  convertFrame: (framePath: string): Promise<string> => {
    return FrameConverter.convertFrame(framePath);
  },
};