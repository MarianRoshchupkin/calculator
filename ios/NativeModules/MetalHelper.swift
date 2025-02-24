import Metal
import CoreImage

class MetalHelper {
  static let shared = MetalHelper()

  let device: MTLDevice
  let commandQueue: MTLCommandQueue
  let ciContext: CIContext

  private init() {
    guard let device = MTLCreateSystemDefaultDevice() else {
      fatalError("Metal is not supported on this device")
    }

    self.device = device

    guard let queue = device.makeCommandQueue() else {
      fatalError("Could not create Metal command queue")
    }

    self.commandQueue = queue
    self.ciContext = CIContext(mtlDevice: device)
  }
}