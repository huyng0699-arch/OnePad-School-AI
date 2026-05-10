package com.anonymous.onepadschoolsai

import android.content.Context
import java.io.BufferedOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import kotlin.concurrent.thread

object OnePadLocalArAssetServer {
  private var serverSocket: ServerSocket? = null
  private var port: Int = 0

  @Synchronized
  fun start(context: Context): Int {
    val existingPort = port
    if (serverSocket?.isClosed == false && existingPort > 0) {
      return existingPort
    }

    val socket = ServerSocket(0)
    serverSocket = socket
    port = socket.localPort

    thread(name = "OnePadLocalArAssetServer", isDaemon = true) {
      while (!socket.isClosed) {
        try {
          socket.accept().use { client ->
            serveRequest(context.applicationContext, client)
          }
        } catch (_: Exception) {
          if (!socket.isClosed) {
            continue
          }
        }
      }
    }

    return port
  }

  private fun serveRequest(context: Context, client: Socket) {
    val input = client.getInputStream().bufferedReader()
    val requestLine = input.readLine().orEmpty()
    val parts = requestLine.split(" ")
    val method = parts.getOrNull(0).orEmpty()
    val rawPath = parts.getOrNull(1).orEmpty().substringBefore("?")
    val assetPath = URLDecoder.decode(rawPath.removePrefix("/"), StandardCharsets.UTF_8.name())
    val output = BufferedOutputStream(client.getOutputStream())

    if ((method != "GET" && method != "HEAD") || !assetPath.startsWith("models/") || !assetPath.endsWith(".glb")) {
      writeText(output, 404, "Not Found", "Not Found")
      return
    }

    try {
      val modelBytes = context.assets.open(assetPath).use { it.readBytes() }
      val headers =
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: model/gltf-binary\r\n" +
          "Content-Length: ${modelBytes.size}\r\n" +
          "Access-Control-Allow-Origin: *\r\n" +
          "Connection: close\r\n" +
          "\r\n"
      output.write(headers.toByteArray(StandardCharsets.UTF_8))
      if (method == "GET") {
        output.write(modelBytes)
      }
      output.flush()
    } catch (_: Exception) {
      writeText(output, 404, "Not Found", "Model not found")
    }
  }

  private fun writeText(output: BufferedOutputStream, statusCode: Int, statusText: String, body: String) {
    val bodyBytes = body.toByteArray(StandardCharsets.UTF_8)
    val headers =
      "HTTP/1.1 $statusCode $statusText\r\n" +
        "Content-Type: text/plain; charset=utf-8\r\n" +
        "Content-Length: ${bodyBytes.size}\r\n" +
        "Connection: close\r\n" +
        "\r\n"
    output.write(headers.toByteArray(StandardCharsets.UTF_8))
    output.write(bodyBytes)
    output.flush()
  }
}
