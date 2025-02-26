import VisionCamera
import AVFoundation
import UIKit
import VideoToolbox

@objc(MyFrameProcessorPlugin)
public class MyFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any {
    guard let sampleBuffer = frame.buffer as? CMSampleBuffer else {
      return ""
    }
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return ""
    }

    CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly) }

    // Use our hardware-accelerated encoder to get JPEG data.
    guard let encodedData = HardwareEncoder.shared.encode(pixelBuffer: pixelBuffer) else {
      return ""
    }

    // Return the base64-encoded string (so the worklet’s return type stays simple).
    return encodedData.base64EncodedString()
  }
}