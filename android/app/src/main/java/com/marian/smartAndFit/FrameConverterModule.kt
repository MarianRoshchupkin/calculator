package com.marian.smartAndFit

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.graphics.BitmapFactory
import android.graphics.Bitmap
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.io.File

class FrameConverterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FrameConverter"
    }

    @ReactMethod
    fun convertFrame(framePath: String, promise: Promise) {
        try {
            val file = File(framePath)

            if (!file.exists()) {
                promise.reject("E_NO_IMAGE", "Could not load image at path: $framePath")
                return
            }

            val bitmap: Bitmap? = BitmapFactory.decodeFile(framePath)

            if (bitmap == null) {
                promise.reject("E_NO_IMAGE", "Could not decode image at path: $framePath")
                return
            }

            val outputStream = ByteArrayOutputStream()
            val success = bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)

            if (!success) {
                promise.reject("E_COMPRESSION", "Failed to compress image")
                return
            }

            val byteArray = outputStream.toByteArray()
            val base64String = Base64.encodeToString(byteArray, Base64.NO_WRAP)

            promise.resolve(base64String)
        } catch (e: Exception) {
            promise.reject("E_CONVERT_FRAME", e.message, e)
        }
    }
}