import Foundation
import UIKit

@objc(FrameConverter)
class FrameConverter: NSObject {

  @objc
  func convertFrame(_ framePath: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let image = UIImage(contentsOfFile: framePath as String) else {
      reject("E_NO_IMAGE", "Could not load image at path: \(framePath)", nil)
      return
    }

    guard let jpegData = image.jpegData(compressionQuality: 0.7) else {
      reject("E_COMPRESSION", "Failed to compress image", nil)
      return
    }

    let base64String = jpegData.base64EncodedString()
    resolve(base64String)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}