package com.example.homemaster82

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val ADMIN_URL = "https://homemaster82.vercel.app/admin.html"
    private val HOME_URL = "https://homemaster82.vercel.app"
    private val CLOUD_DB_URL = "https://api.restful-api.dev/objects/ff8081819ff5b11001a01a97bf99526a"

    private var isPollingActive = true

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            val results = when {
                intent?.dataString != null -> arrayOf(Uri.parse(intent.dataString))
                intent?.clipData != null -> {
                    val clipData = intent.clipData!!
                    Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                }
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            NotificationHelper.showNotification(
                this,
                "🔔 [홈케어 관제탑 알림 활성화]",
                "실시간 알림이 100% 활성화되었습니다!"
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. 알림 채널 및 백그라운드 스케줄러 등록
        NotificationHelper.createChannel(this)
        AlarmReceiver.scheduleNextAlarm(this)
        checkNotificationPermission()

        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0F172A"))
        }

        webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportZoom(true)
                builtInZoomControls = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                userAgentString = "$userAgentString HomeMaster82App/1.0"
            }

            addJavascriptInterface(WebAppInterface(this@MainActivity), "AndroidBridge")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url == null) return false
                    if (url.startsWith("tel:") || url.startsWith("sms:") || url.startsWith("mailto:")) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = filePathCallback

                    val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "image/*"
                        putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    }

                    try {
                        fileChooserLauncher.launch(intent)
                    } catch (e: Exception) {
                        this@MainActivity.filePathCallback = null
                        return false
                    }
                    return true
                }
            }

            loadUrl(ADMIN_URL)
        }

        // Native Control Bar
        val bottomBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(56)
            )
            setBackgroundColor(Color.parseColor("#1E293B"))
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dpToPx(6), dpToPx(4), dpToPx(6), dpToPx(4))
        }

        val btnAdmin = createNavButton("🎛️ 관제탑", Color.parseColor("#F59E0B"), Color.BLACK) {
            webView.loadUrl(ADMIN_URL)
        }

        val btnHome = createNavButton("🏠 홈페이지", Color.parseColor("#334155"), Color.WHITE) {
            webView.loadUrl(HOME_URL)
        }

        val btnTestAlert = createNavButton("🔔 알림 테스트", Color.parseColor("#DC2626"), Color.WHITE) {
            NotificationHelper.showNotification(
                this,
                "🔔 [실시간 알림 테스트 성공]",
                "상단바 알림 및 진동이 100% 정상 작동 중입니다!"
            )
        }

        bottomBar.addView(btnAdmin)
        bottomBar.addView(btnHome)
        bottomBar.addView(btnTestAlert)

        rootLayout.addView(webView)
        rootLayout.addView(bottomBar)
        setContentView(rootLayout)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        // Start High-Frequency Foreground Polling Loop (every 3s)
        startForegroundPolling()
    }

    override fun onDestroy() {
        super.onDestroy()
        isPollingActive = false
    }

    private fun startForegroundPolling() {
        Thread {
            while (isPollingActive) {
                try {
                    val url = URL(CLOUD_DB_URL)
                    val conn = url.openConnection() as HttpURLConnection
                    conn.connectTimeout = 5000
                    conn.readTimeout = 5000
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

                            val prefs = getSharedPreferences("homemaster_prefs", Context.MODE_PRIVATE)
                            val lastSeenId = prefs.getLong("last_seen_id", 0L)

                            if (lastSeenId != 0L && currentId != lastSeenId && currentId > lastSeenId) {
                                val repairType = first.optString("repair_type", "집수리 시공")
                                val location = first.optString("location", "출장 방문")
                                val phone = first.optString("customer_phone", "")

                                NotificationHelper.showNotification(
                                    this@MainActivity,
                                    "🚨 [신규 예약 접수] $repairType",
                                    "지역: $location | 전화: $phone (터치하여 관제탑 열기)"
                                )

                                runOnUiThread {
                                    if (webView.url?.contains("admin") == true) {
                                        webView.reload()
                                    }
                                }
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
                    Thread.sleep(3000) // 3초 주기 초고속 감지!
                } catch (e: InterruptedException) {
                    break
                }
            }
        }.start()
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    private fun createNavButton(text: String, bgColor: Int, textColor: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            this.textSize = 12f
            this.typeface = Typeface.DEFAULT_BOLD
            this.setTextColor(textColor)
            this.setBackgroundColor(bgColor)
            val params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1.0f).apply {
                setMargins(dpToPx(3), 0, dpToPx(3), 0)
            }
            this.layoutParams = params
            setOnClickListener { onClick() }
        }
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    inner class WebAppInterface(private val activity: MainActivity) {
        @JavascriptInterface
        fun showNotification(title: String, message: String) {
            activity.runOnUiThread {
                NotificationHelper.showNotification(activity, title, message)
            }
        }

        @JavascriptInterface
        fun isNativeApp(): Boolean {
            return true
        }
    }
}
