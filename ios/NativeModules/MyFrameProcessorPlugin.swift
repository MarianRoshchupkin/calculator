import VisionCamera
import AVFoundation
import UIKit

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

    guard let uiImage = UIImageFromCVPixelBuffer(pixelBuffer) else {
      return ""
    }

    guard let jpegData = uiImage.jpegData(compressionQuality: 0.7) else {
      return ""
    }

    return jpegData.base64EncodedString()
  }
}

func UIImageFromCVPixelBuffer(_ pixelBuffer: CVPixelBuffer) -> UIImage? {
  let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
  let context = MetalHelper.shared.ciContext

  guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
    return nil
  }

  return UIImage(cgImage: cgImage)
}
