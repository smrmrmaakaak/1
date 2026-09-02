package com.example.homemaster82

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "HomeMaster82:BackgroundCheckWakeLock"
        )
        wakeLock.acquire(10000)

        Thread {
            try {
                val url = URL("https://api.restful-api.dev/objects/ff8081819ff5b11001a01a97bf99526a")
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 6000
                conn.readTimeout = 6000
                conn.requestMethod = "GET"
                conn.setRequestProperty("User-Agent", "Mozilla/5.0")

                if (conn.responseCode == 200) {
                    val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val root = JSONObject(jsonStr)
                    val data = root.optJSONObject("data")
                    val estimates = data?.optJSONArray("estimates")
                    if (estimates != null && estimates.length() > 0) {
                        val first = estimates.getJSONObject(0)
                        val currentId = first.optLong("id")

                        val prefs = context.getSharedPreferences("homemaster_prefs", Context.MODE_PRIVATE)
                        val lastSeenId = prefs.getLong("last_seen_id", 0L)

                        // If brand new ID arrives or is greater than last seen ID
                        if (lastSeenId != 0L && currentId != lastSeenId && currentId > lastSeenId) {
                            val repairType = first.optString("repair_type", "집수리 시공")
                            val location = first.optString("location", "출장 방문")
                            val phone = first.optString("customer_phone", "")

                            NotificationHelper.showNotification(
                                context,
                                "🚨 [신규 예약 접수] $repairType",
                                "지역: $location | 전화: $phone (터치하여 관제탑 열기)"
                            )
                        }
                        
                        // Always keep the highest ID
                        if (currentId > lastSeenId) {
                            prefs.edit().putLong("last_seen_id", currentId).apply()
                        }
                    }
                }
                conn.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                if (wakeLock.isHeld) {
                    wakeLock.release()
                }
                scheduleNextAlarm(context)
            }
        }.start()
    }

    companion object {
        fun scheduleNextAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context, 1001, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val triggerAtMillis = System.currentTimeMillis() + 8000 // 8초 주기

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } catch (e: Exception) {
                try {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                } catch (e2: Exception) {
                    e2.printStackTrace()
                }
            }
        }
    }
}
