import Foundation
import AVFoundation
import VideoToolbox

class HardwareEncoder {
  static let shared = HardwareEncoder()
  private var compressionSession: VTCompressionSession?
  private let width: Int32 = 1920
  private let height: Int32 = 1080
  private var isSessionReady = false
  private var encodedData: Data?

  private init() {
    var session: VTCompressionSession?
    let status = VTCompressionSessionCreate(
      allocator: kCFAllocatorDefault,
      width: width,
      height: height,
      codecType: kCMVideoCodecType_JPEG,
      encoderSpecification: nil,
      imageBufferAttributes: nil,
      compressedDataAllocator: nil,
      outputCallback: HardwareEncoder.compressionOutputCallback,
      refcon: nil,
      compressionSessionOut: &session)

    if status == noErr, let session = session {
      compressionSession = session
      VTSessionSetProperty(session, key: kVTCompressionPropertyKey_RealTime, value: kCFBooleanTrue)
      isSessionReady = true
    } else {
      print("Failed to create VTCompressionSession with JPEG codec, status: \(status)")
    }
  }

  private static let compressionOutputCallback: VTCompressionOutputCallback = { (outputCallbackRefCon, sourceFrameRefCon, status, infoFlags, sampleBuffer) in
    if status != noErr {
      print("Error encoding frame: \(status)")
      return
    }

    guard let sampleBuffer = sampleBuffer, CMSampleBufferDataIsReady(sampleBuffer), let dataBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else {
      return
    }

    var length: Int = 0
    var dataPointer: UnsafeMutablePointer<Int8>?
    let status = CMBlockBufferGetDataPointer(dataBuffer, atOffset: 0, lengthAtOffsetOut: nil, totalLengthOut: &length, dataPointerOut: &dataPointer)
    if status == noErr, let dataPointer = dataPointer {
      let outputData = Data(bytes: dataPointer, count: length)
      // Store the encoded data.
      HardwareEncoder.shared.encodedData = outputData
    }
  }

  func encode(pixelBuffer: CVPixelBuffer) -> Data? {
    guard let session = compressionSession, isSessionReady else {
      return nil
    }

    var flags: VTEncodeInfoFlags = []
    let pts = CMTimeMake(value: 0, timescale: 1)
    let duration = CMTimeMake(value: 1, timescale: 30)

    VTCompressionSessionCompleteFrames(session, untilPresentationTimeStamp: pts)

    let status = VTCompressionSessionEncodeFrame(session, imageBuffer: pixelBuffer, presentationTimeStamp: pts, duration: duration, frameProperties: nil, sourceFrameRefcon: nil, infoFlagsOut: &flags)

    if status != noErr {
      print("Error encoding frame: \(status)")
      return nil
    }

    // Wait for the callback to store the encoded data.
    while HardwareEncoder.shared.encodedData == nil {
      usleep(1000)  // Small delay to prevent blocking the thread.
    }

    return HardwareEncoder.shared.encodedData
  }
}