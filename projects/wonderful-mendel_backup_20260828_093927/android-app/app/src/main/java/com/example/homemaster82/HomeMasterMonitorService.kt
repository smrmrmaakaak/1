package com.example.homemaster82

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.TrafficStats
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class HomeMasterMonitorService : Service() {

    private var isRunning = true
    private val SERVICE_CHANNEL_ID = "homemaster_fg_service_channel_v1"
    private val API_URL = "https://homemaster82.vercel.app/api/estimates"

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createServiceNotificationChannel()
        startForeground(9999, buildServiceNotification())
        startDataMonitoringThread()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
    }

    private fun createServiceNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                SERVICE_CHANNEL_ID,
                "홈케어마스터 실시간 상시 관제 서비스",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "모바일 데이터 및 와이파이 환경 24시간 실시간 예약 감시"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildServiceNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, SERVICE_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setContentTitle("목수의 홈케어마스터 24시간 관제 가동 중")
            .setContentText("데이터/와이파이 환경에서 실시간 예약을 수신합니다.")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun startDataMonitoringThread() {
        Thread {
            // Android 모바일 데이터 트래픽 태그 등록 (통신사 방화벽/절전모드 차단 해제)
            TrafficStats.setThreadStatsTag(0xF00D)

            while (isRunning) {
                try {
                    val url = URL(API_URL)
                    val conn = url.openConnection() as HttpURLConnection
                    conn.connectTimeout = 8000
                    conn.readTimeout = 8000
                    conn.requestMethod = "GET"
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 HomeMasterApp/1.0")
                    conn.setRequestProperty("Accept", "application/json")

                    if (conn.responseCode == 200) {
                        val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
                        val root = JSONObject(jsonStr)
                        val estimates = if (root.has("data") && root.get("data") is org.json.JSONArray) {
                            root.getJSONArray("data")
                        } else {
                            root.optJSONObject("data")?.optJSONArray("estimates")
                        }

                        if (estimates != null && estimates.length() > 0) {
                            val first = estimates.getJSONObject(0)
                            val currentId = first.optLong("id")

                            val prefs = getSharedPreferences("homemaster_prefs", Context.MODE_PRIVATE)
                            val lastSeenId = prefs.getLong("last_seen_id", 0L)

                            if (lastSeenId != 0L && currentId != lastSeenId && currentId > lastSeenId) {
                                val repairType = first.optString("repair_type", "집수리 시공")
                                val location = first.optString("location", "출장 방문")
                                val phone = first.optString("customer_phone", "")

                                NotificationHelper.showNotification(
                                    this@HomeMasterMonitorService,
                                    "🚨 [신규 예약 접수] $repairType",
                                    "지역: $location | 전화: $phone (터치하여 관제탑 열기)"
                                )
                            }

                            if (currentId > lastSeenId) {
                                prefs.edit().putLong("last_seen_id", currentId).apply()
                            }
                        }
                    }
                    conn.disconnect()
                } catch (e: Exception) {
                    e.printStackTrace()
                }

                try {
                    Thread.sleep(4000) // 4초 주기 감시
                } catch (e: InterruptedException) {
                    break
                }
            }
        }.start()
    }
}
