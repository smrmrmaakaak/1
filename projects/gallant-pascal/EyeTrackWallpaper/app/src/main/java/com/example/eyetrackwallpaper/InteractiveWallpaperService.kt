package com.example.eyetrackwallpaper

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Camera
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.service.wallpaper.WallpaperService
import android.view.MotionEvent
import android.view.SurfaceHolder
import kotlin.math.sin
import kotlin.random.Random

class InteractiveWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine {
        return EyeTrackEngine()
    }

    inner class EyeTrackEngine : Engine() {
        private val handler = Handler(Looper.getMainLooper())
        private var isVisible = false
        private var surfaceWidth = 1080
        private var surfaceHeight = 2400

        private var baseBitmap: Bitmap? = null
        private val camera = Camera()
        private val matrix = Matrix()
        private val particlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#FF69B4") // Soft pink
            style = Paint.Style.FILL
        }
        private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#80FFFFFF")
            textSize = 36f
            textAlign = Paint.Align.CENTER
        }

        // Touch Tracking & Spring Physics
        private var targetLookX = 0f
        private var targetLookY = 0f
        private var currentLookX = 0f
        private var currentLookY = 0f
        private var lastTouchTime = 0L
        private var isTouching = false

        // Interactive Sparkle/Heart Particles
        private val particles = mutableListOf<TouchParticle>()

        private val drawRunnable = object : Runnable {
            override fun run() {
                drawFrame()
                if (isVisible) {
                    handler.postDelayed(this, 16L) // ~60-120fps smooth loop
                }
            }
        }

        override fun onCreate(surfaceHolder: SurfaceHolder?) {
            super.onCreate(surfaceHolder)
            setTouchEventsEnabled(true)
            loadBitmap()
        }

        private fun loadBitmap() {
            try {
                val options = BitmapFactory.Options().apply {
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }
                baseBitmap = BitmapFactory.decodeResource(resources, R.drawable.character_portrait, options)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        override fun onVisibilityChanged(visible: Boolean) {
            isVisible = visible
            if (visible) {
                handler.post(drawRunnable)
            } else {
                handler.removeCallbacks(drawRunnable)
            }
        }

        override fun onSurfaceChanged(holder: SurfaceHolder?, format: Int, width: Int, height: Int) {
            super.onSurfaceChanged(holder, format, width, height)
            surfaceWidth = width
            surfaceHeight = height
        }

        override fun onTouchEvent(event: MotionEvent?) {
            super.onTouchEvent(event)
            event ?: return

            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> {
                    isTouching = true
                    lastTouchTime = SystemClock.uptimeMillis()

                    val faceCenterX = surfaceWidth * 0.5f
                    val faceCenterY = surfaceHeight * 0.35f

                    // Normalize target gaze vector (-1.0 to 1.0)
                    targetLookX = ((event.x - faceCenterX) / (surfaceWidth * 0.5f)).coerceIn(-1.2f, 1.2f)
                    targetLookY = ((event.y - faceCenterY) / (surfaceHeight * 0.5f)).coerceIn(-1.2f, 1.2f)

                    // Spawn lovely sparkle particles at touch point
                    if (particles.size < 40) {
                        for (i in 0..1) {
                            particles.add(
                                TouchParticle(
                                    x = event.x + Random.nextFloat() * 40f - 20f,
                                    y = event.y + Random.nextFloat() * 40f - 20f,
                                    vx = (Random.nextFloat() - 0.5f) * 6f,
                                    vy = -Random.nextFloat() * 6f - 2f,
                                    size = Random.nextFloat() * 20f + 10f,
                                    alpha = 255
                                )
                            )
                        }
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    isTouching = false
                }
            }
        }

        private fun drawFrame() {
            val holder = surfaceHolder ?: return
            var canvas: Canvas? = null
            try {
                canvas = holder.lockHardwareCanvas() ?: holder.lockCanvas()
                if (canvas != null) {
                    render(canvas)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                if (canvas != null) {
                    try {
                        holder.unlockCanvasAndPost(canvas)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }

        private fun render(canvas: Canvas) {
            val bmp = baseBitmap ?: return

            // Smooth spring damping interpolation
            val springSpeed = if (isTouching) 0.16f else 0.08f
            currentLookX += (targetLookX - currentLookX) * springSpeed
            currentLookY += (targetLookY - currentLookY) * springSpeed

            // Natural idle gaze return & breathing effect
            val now = SystemClock.uptimeMillis()
            if (!isTouching && (now - lastTouchTime > 1500L)) {
                val breathCycle = sin(now / 1200.0).toFloat()
                targetLookX = breathCycle * 0.12f
                targetLookY = breathCycle * 0.08f
            }

            // Calculate scaling to fill screen nicely (Center Crop)
            val scaleX = surfaceWidth.toFloat() / bmp.width.toFloat()
            val scaleY = surfaceHeight.toFloat() / bmp.height.toFloat()
            val baseScale = maxOf(scaleX, scaleY) * 1.08f // Slight zoom buffer for parallax shift

            val facePivotX = surfaceWidth * 0.5f
            val facePivotY = surfaceHeight * 0.35f

            matrix.reset()
            // 1. Center bitmap
            matrix.postTranslate(-bmp.width / 2f, -bmp.height / 2f)
            matrix.postScale(baseScale, baseScale)

            // 2. Apply 3D Gaze & Head Parallax Tilt
            camera.save()
            // Rotate head slightly following touch direction
            camera.rotateY(currentLookX * 6.5f)
            camera.rotateX(-currentLookY * 5.0f)
            camera.getMatrix(matrix)
            camera.restore()

            // 3. Apply position offset (eyes & face shift towards touch)
            val shiftX = currentLookX * 45f
            val shiftY = currentLookY * 30f

            matrix.preTranslate(-facePivotX, -facePivotY)
            matrix.postTranslate(facePivotX + shiftX, facePivotY + shiftY)

            // Draw Background Character
            canvas.drawColor(Color.BLACK)
            canvas.drawBitmap(bmp, matrix, null)

            // Render interactive particles (sparkles / hearts)
            val iterator = particles.iterator()
            while (iterator.hasNext()) {
                val p = iterator.next()
                p.x += p.vx
                p.y += p.vy
                p.alpha = (p.alpha - 8).coerceAtLeast(0)

                particlePaint.alpha = p.alpha
                // Draw heart or sparkle star
                canvas.drawCircle(p.x, p.y, p.size * (p.alpha / 255f), particlePaint)

                if (p.alpha <= 0) {
                    iterator.remove()
                }
            }
        }

        override fun onDestroy() {
            super.onDestroy()
            handler.removeCallbacks(drawRunnable)
            baseBitmap?.recycle()
            baseBitmap = null
        }
    }

    data class TouchParticle(
        var x: Float,
        var y: Float,
        var vx: Float,
        var vy: Float,
        var size: Float,
        var alpha: Int
    )
}
