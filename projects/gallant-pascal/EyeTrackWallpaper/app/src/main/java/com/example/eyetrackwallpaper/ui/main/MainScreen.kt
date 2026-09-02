package com.example.eyetrackwallpaper.ui.main

import android.app.WallpaperManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import com.example.eyetrackwallpaper.InteractiveWallpaperService
import com.example.eyetrackwallpaper.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var touchNormalizedX by remember { mutableFloatStateOf(0f) }
    var touchNormalizedY by remember { mutableFloatStateOf(0f) }
    var isTouching by remember { mutableStateOf(false) }

    // Spring interpolation for smooth gaze tracking
    val animatedLookX by animateFloatAsState(
        targetValue = touchNormalizedX,
        animationSpec = spring(dampingRatio = 0.65f, stiffness = 300f),
        label = "lookX"
    )
    val animatedLookY by animateFloatAsState(
        targetValue = touchNormalizedY,
        animationSpec = spring(dampingRatio = 0.65f, stiffness = 300f),
        label = "lookY"
    )

    // Idle breathing & gentle natural eye float
    val infiniteTransition = rememberInfiniteTransition(label = "idleFloat")
    val idleOffsetY by infiniteTransition.animateFloat(
        initialValue = -5f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "idleBreath"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F14))
    ) {
        // 1. Interactive Preview Area (Full background with touch listener)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            isTouching = true
                            val normX = ((offset.x - size.width * 0.5f) / (size.width * 0.5f)).coerceIn(-1.2f, 1.2f)
                            val normY = ((offset.y - size.height * 0.35f) / (size.height * 0.5f)).coerceIn(-1.2f, 1.2f)
                            touchNormalizedX = normX
                            touchNormalizedY = normY
                        },
                        onDrag = { change, _ ->
                            val normX = ((change.position.x - size.width * 0.5f) / (size.width * 0.5f)).coerceIn(-1.2f, 1.2f)
                            val normY = ((change.position.y - size.height * 0.35f) / (size.height * 0.5f)).coerceIn(-1.2f, 1.2f)
                            touchNormalizedX = normX
                            touchNormalizedY = normY
                        },
                        onDragEnd = {
                            isTouching = false
                            coroutineScope.launch {
                                delay(1200)
                                if (!isTouching) {
                                    touchNormalizedX = 0f
                                    touchNormalizedY = 0f
                                }
                            }
                        },
                        onDragCancel = {
                            isTouching = false
                            touchNormalizedX = 0f
                            touchNormalizedY = 0f
                        }
                    )
                }
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { offset ->
                            val normX = ((offset.x - size.width * 0.5f) / (size.width * 0.5f)).coerceIn(-1.2f, 1.2f)
                            val normY = ((offset.y - size.height * 0.35f) / (size.height * 0.5f)).coerceIn(-1.2f, 1.2f)
                            touchNormalizedX = normX
                            touchNormalizedY = normY

                            coroutineScope.launch {
                                delay(1200)
                                if (!isTouching) {
                                    touchNormalizedX = 0f
                                    touchNormalizedY = 0f
                                }
                            }
                        }
                    )
                }
        ) {
            // Character Portrait Image with 3D Gaze / Parallax Matrix
            Image(
                painter = painterResource(id = R.drawable.character_portrait),
                contentDescription = "Interactive Character",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        rotationY = animatedLookX * 6.5f
                        rotationX = -animatedLookY * 5.0f
                        translationX = animatedLookX * 45f
                        translationY = animatedLookY * 30f + if (!isTouching) idleOffsetY else 0f
                        scaleX = 1.08f
                        scaleY = 1.08f
                    }
            )

            // Dark vignette overlay at bottom for controls
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .align(Alignment.BottomCenter)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color(0xCC000000), Color(0xF0000000))
                        )
                    )
            )

            // Top Status Badge
            Surface(
                color = Color(0x991A1A24),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 56.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = if (isTouching) "👀 손끝을 바라보고 있어요!" else "👆 화면을 터치하거나 드래그해보세요",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Bottom Action Controls
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 24.dp, vertical = 36.dp)
            ) {
                Text(
                    text = "아이컨택 라이브 배경화면",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "화면 터치 위치에 따라 시선과 눈동자가 실시간으로 따라옵니다",
                    color = Color(0xFFB0B0C0),
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )

                // Apply Button
                Button(
                    onClick = {
                        setAsLiveWallpaper(context)
                    },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFE91E63)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(12.dp, RoundedCornerShape(16.dp), spotColor = Color(0xFFE91E63))
                ) {
                    Text(
                        text = "💖 라이브 배경화면으로 바로 적용하기",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

private fun setAsLiveWallpaper(context: Context) {
    try {
        val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
            putExtra(
                WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                ComponentName(context, InteractiveWallpaperService::class.java)
            )
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    } catch (e: Exception) {
        try {
            val intent = Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e2: Exception) {
            e2.printStackTrace()
        }
    }
}
