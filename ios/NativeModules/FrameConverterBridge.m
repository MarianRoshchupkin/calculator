#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FrameConverter, NSObject)

RCT_EXTERN_METHOD(convertFrame:(NSString *)framePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end