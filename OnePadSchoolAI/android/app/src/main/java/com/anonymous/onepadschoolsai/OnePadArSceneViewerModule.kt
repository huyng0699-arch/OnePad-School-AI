package com.anonymous.onepadschoolsai

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OnePadArSceneViewerModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "OnePadArSceneViewer"

  @ReactMethod
  fun openSceneViewer(modelUrl: String, title: String, promise: Promise) {
    if (!isAllowedSceneViewerUrl(modelUrl)) {
      promise.reject("AR_MODEL_URL_UNSUPPORTED", "Scene Viewer requires HTTPS or the app's local Android model server.")
      return
    }

    launchSceneViewer(modelUrl, title, promise)
  }

  @ReactMethod
  fun openBundledSceneViewer(assetPath: String, title: String, promise: Promise) {
    if (!assetPath.startsWith("models/") || !assetPath.endsWith(".glb")) {
      promise.reject("AR_ASSET_UNSUPPORTED", "Only bundled .glb files in the models folder can be opened in AR.")
      return
    }

    try {
      reactApplicationContext.assets.open(assetPath).close()
      val port = OnePadLocalArAssetServer.start(reactApplicationContext)
      val localModelUrl = "http://127.0.0.1:$port/$assetPath"
      launchSceneViewer(localModelUrl, title, promise)
    } catch (error: Exception) {
      promise.reject("AR_ASSET_NOT_FOUND", error.message ?: "Bundled AR model was not found in the Android app.")
    }
  }

  private fun isAllowedSceneViewerUrl(modelUrl: String): Boolean {
    return modelUrl.startsWith("https://", ignoreCase = true) ||
      modelUrl.startsWith("http://127.0.0.1:", ignoreCase = true) ||
      modelUrl.startsWith("http://localhost:", ignoreCase = true)
  }

  private fun launchSceneViewer(modelUrl: String, title: String, promise: Promise) {
    val encodedFile = Uri.encode(modelUrl)
    val encodedTitle = Uri.encode(title)
    val fallbackUrl = Uri.encode(modelUrl)
    val intentUri =
      "intent://arvr.google.com/scene-viewer/1.0" +
        "?file=$encodedFile" +
        "&mode=ar_preferred" +
        "&title=$encodedTitle" +
        "#Intent;" +
        "scheme=https;" +
        "package=com.google.ar.core;" +
        "action=android.intent.action.VIEW;" +
        "S.browser_fallback_url=$fallbackUrl;" +
        "end;"

    try {
      val intent = Intent.parseUri(intentUri, Intent.URI_INTENT_SCHEME).apply {
        addCategory(Intent.CATEGORY_BROWSABLE)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      val activity = reactApplicationContext.currentActivity
      if (activity != null) {
        activity.startActivity(intent)
      } else {
        reactApplicationContext.startActivity(intent)
      }
      promise.resolve(true)
    } catch (error: ActivityNotFoundException) {
      promise.reject("AR_SCENE_VIEWER_NOT_FOUND", "Google Play Services for AR is not installed or this device is not ARCore compatible.")
    } catch (error: Exception) {
      promise.reject("AR_SCENE_VIEWER_OPEN_FAILED", error.message ?: "Unable to open Android Scene Viewer.")
    }
  }
}
