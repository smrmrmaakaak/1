import numpy as np
import scipy.signal as signal
import scipy.io.wavfile as wav
import os
import subprocess

SAMPLE_RATE = 48000

def generate_brown_noise(num_samples):
    white = np.random.normal(0, 1, num_samples)
    brown = np.cumsum(white)
    b, a = signal.butter(2, 10 / (SAMPLE_RATE / 2), btype='high')
    brown = signal.lfilter(b, a, brown)
    brown = brown / (np.max(np.abs(brown)) + 1e-8)
    return brown

def generate_pink_noise(num_samples):
    white = np.random.normal(0, 1, num_samples)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    pink = signal.lfilter(b, a, white)
    pink = pink / (np.max(np.abs(pink)) + 1e-8)
    return pink

def butter_lowpass(data, cutoff, order=3):
    nyq = 0.5 * SAMPLE_RATE
    normal_cutoff = min(cutoff / nyq, 0.99)
    b, a = signal.butter(order, normal_cutoff, btype='low', analog=False)
    return signal.lfilter(b, a, data)

def butter_highpass(data, cutoff, order=2):
    nyq = 0.5 * SAMPLE_RATE
    normal_cutoff = max(min(cutoff / nyq, 0.99), 0.001)
    b, a = signal.butter(order, normal_cutoff, btype='high', analog=False)
    return signal.lfilter(b, a, data)

def butter_bandpass(data, lowcut, highcut, order=2):
    nyq = 0.5 * SAMPLE_RATE
    low = max(lowcut / nyq, 0.001)
    high = min(highcut / nyq, 0.99)
    b, a = signal.butter(order, [low, high], btype='band')
    return signal.lfilter(b, a, data)

def soft_clip(x, drive=1.5):
    return np.tanh(x * drive)

def apply_stereo_reverb(mono_audio, duration, mix=0.5):
    """Rich multi-tap stereo reverb & air absorption simulation"""
    delay_times_l = [0.027, 0.059, 0.118, 0.215, 0.365, 0.580, 0.890, 1.280, 1.820, 2.450]
    delay_times_r = [0.038, 0.074, 0.137, 0.248, 0.395, 0.640, 0.950, 1.370, 1.910, 2.580]
    decay_l = [0.80, 0.70, 0.60, 0.50, 0.42, 0.33, 0.25, 0.18, 0.10, 0.05]
    decay_r = [0.76, 0.67, 0.57, 0.47, 0.39, 0.31, 0.22, 0.15, 0.08, 0.04]
    
    left = mono_audio.copy()
    right = mono_audio.copy()
    
    for dt, dec in zip(delay_times_l, decay_l):
        shift = int(dt * SAMPLE_RATE)
        if shift < len(mono_audio):
            delayed = np.zeros_like(mono_audio)
            delayed[shift:] = mono_audio[:-shift] * dec
            delayed = butter_lowpass(delayed, max(250, 3200 * (1.0 - dt/3.0)))
            left += delayed * mix
            
    for dt, dec in zip(delay_times_r, decay_r):
        shift = int(dt * SAMPLE_RATE)
        if shift < len(mono_audio):
            delayed = np.zeros_like(mono_audio)
            delayed[shift:] = mono_audio[:-shift] * dec
            delayed = butter_lowpass(delayed, max(250, 3000 * (1.0 - dt/3.0)))
            right += delayed * mix
            
    return np.vstack((left, right)).T

def generate_massive_strike_thunder(duration=7.5):
    """1. 초대형 근접 벼락 직격타 (Super Massive Lightning Strike)"""
    num_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    # 1. Ultra sharp snap & tearing arc
    snap_env = np.exp(-t / 0.012)
    snap_noise = np.random.normal(0, 1, num_samples) * snap_env
    snap_filtered = butter_bandpass(snap_noise, 900, 14000, order=2) * 4.2
    
    # 2. Main blast
    shock_t = np.maximum(0, t - 0.008)
    shock_env = (shock_t / 0.025) * np.exp(-shock_t / 0.14)
    shock_noise = generate_pink_noise(num_samples) * shock_env
    shock_filtered = butter_lowpass(shock_noise, 750, order=3) * 4.5
    
    # 3. Sub-bass ground impact
    sub_pitch = 95.0 * np.exp(-t / 0.7) + 26.0
    sub_phase = 2 * np.pi * np.cumsum(sub_pitch) / SAMPLE_RATE
    sub_sine = np.sin(sub_phase) * np.exp(-t / 1.8) * 2.2
    sub_sine = soft_clip(sub_sine, drive=2.8) * 1.8
    
    # 4. Crackling Arc Branches
    crackles = np.zeros(num_samples)
    for _ in range(40):
        burst_time = np.random.uniform(0.03, 2.0)
        burst_idx = int(burst_time * SAMPLE_RATE)
        burst_dur = int(np.random.uniform(0.01, 0.07) * SAMPLE_RATE)
        if burst_idx + burst_dur < num_samples:
            env = np.hanning(burst_dur) * np.random.uniform(0.4, 1.4) * np.exp(-burst_time / 1.1)
            burst_noise = np.random.normal(0, 1, burst_dur) * env
            crackles[burst_idx:burst_idx+burst_dur] += burst_noise
    crackles = butter_bandpass(crackles, 400, 6000, order=2) * 2.2
    
    # 5. Deep Brownian rolling waves
    brown = generate_brown_noise(num_samples)
    undulation = (
        0.5 * np.sin(2 * np.pi * 1.7 * t) +
        0.3 * np.sin(2 * np.pi * 3.2 * t + 1.2) +
        0.2 * np.sin(2 * np.pi * 0.6 * t + 2.5) +
        0.3 * np.random.uniform(0.8, 1.2, num_samples)
    )
    undulation = np.clip(undulation, 0.1, 1.6)
    rumble_decay = (t / 0.12) / (1.0 + (t / 0.65)**1.5) * np.exp(-t / 3.4)
    rolling_rumble = butter_lowpass(brown * rumble_decay * undulation, 280, order=4) * 4.0
    
    combined = snap_filtered + shock_filtered + sub_sine + crackles + rolling_rumble
    saturated = soft_clip(combined, drive=2.0)
    stereo = apply_stereo_reverb(saturated, duration, mix=0.55)
    
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo = stereo / max_val * 0.99
    return stereo

def generate_cinematic_epic_thunder(duration=8.5):
    """2. 영화 예고편급 웅장한 시네마틱 3단 천둥 (Epic Cinematic Trailer Thunder)"""
    num_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    # Multi-stage sonic hits
    impact1_t = np.maximum(0, t - 0.0)
    impact1 = (impact1_t / 0.02) * np.exp(-impact1_t / 0.22) * generate_pink_noise(num_samples) * 3.5
    
    impact2_t = np.maximum(0, t - 0.32)
    impact2 = (impact2_t / 0.035) * np.exp(-impact2_t / 0.38) * generate_pink_noise(num_samples) * 3.0
    
    impact3_t = np.maximum(0, t - 0.85)
    impact3 = (impact3_t / 0.05) * np.exp(-impact3_t / 0.65) * generate_pink_noise(num_samples) * 2.8
    
    # Sub-bass pitch dive (60Hz -> 20Hz)
    sub = np.sin(2 * np.pi * (60 * np.exp(-t/1.4) + 22) * t) * np.exp(-t / 2.8) * 2.5
    sub = soft_clip(sub, drive=3.2)
    
    # High frequency electric rip
    rip_env = np.exp(-t / 0.07) + 0.6 * np.exp(-np.maximum(0, t - 0.32) / 0.08)
    rip = butter_bandpass(np.random.normal(0, 1, num_samples) * rip_env, 1000, 9000) * 3.0
    
    # Cinematic rolling atmosphere
    brown = generate_brown_noise(num_samples)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * t) * np.sin(2 * np.pi * 2.5 * t + 0.7)
    body_env = (t / 0.25) * np.exp(-t / 3.8) * lfo
    body = butter_lowpass(brown * body_env, 200, order=3) * 4.5
    
    combined = impact1 + impact2 + impact3 + sub + rip + body
    saturated = soft_clip(combined, drive=2.4)
    stereo = apply_stereo_reverb(saturated, duration, mix=0.62)
    
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo = stereo / max_val * 0.99
    return stereo

def generate_distant_rolling_thunder(duration=10.0):
    """3. 지평선을 울리는 웅장한 롱 롤링 천둥 (Distant Rolling Thunder)"""
    num_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    swell = np.sin(np.pi * t / duration) * (
        0.5 + 0.35 * np.sin(2 * np.pi * 0.7 * t) + 0.25 * np.sin(2 * np.pi * 1.9 * t + 1.2)
    )
    brown = generate_brown_noise(num_samples)
    pink = generate_pink_noise(num_samples)
    
    rumble = (brown * 0.8 + pink * 0.2) * swell * np.exp(-t / 7.0) * 6.0
    rumble_filtered = butter_lowpass(rumble, 220, order=3)
    
    cracks = np.zeros(num_samples)
    for t_crack in [0.5, 1.4, 2.6, 4.1, 5.8, 7.2]:
        idx = int(t_crack * SAMPLE_RATE)
        dur = int(0.18 * SAMPLE_RATE)
        if idx + dur < num_samples:
            env = np.hanning(dur) * np.exp(-t_crack / 4.5)
            cracks[idx:idx+dur] += np.random.normal(0, 1, dur) * env * 1.8
    cracks_filtered = butter_bandpass(cracks, 140, 700)
    
    combined = rumble_filtered + cracks_filtered
    saturated = soft_clip(combined, drive=1.6)
    stereo = apply_stereo_reverb(saturated, duration, mix=0.7)
    
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo = stereo / max_val * 0.99
    return stereo

def generate_apocalyptic_cataclysm_thunder(duration=9.0):
    """4. 지축을 파괴하는 세계멸망급 하이퍼 천둥 (Apocalyptic Cataclysm Thunder)"""
    num_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    # Ultra distorted massive initial blast
    lead_blast = np.exp(-t / 0.09) * np.random.normal(0, 1, num_samples) * 5.0
    lead_blast = butter_bandpass(lead_blast, 200, 10000)
    
    # Earthquake Bass (18Hz ~ 55Hz)
    quake_freq = 55.0 * np.exp(-t / 1.5) + 18.0
    quake_sine = np.sin(2 * np.pi * np.cumsum(quake_freq) / SAMPLE_RATE) * np.exp(-t / 3.0) * 3.5
    quake_dist = np.clip(quake_sine * 3.0, -1.0, 1.0)
    
    # Multiple echoing shock explosions
    shocks = np.zeros(num_samples)
    for shock_time in [0.0, 0.15, 0.45, 0.9, 1.6, 2.4]:
        idx = int(shock_time * SAMPLE_RATE)
        dur = int(0.35 * SAMPLE_RATE)
        if idx + dur < num_samples:
            env = np.hanning(dur) * np.exp(-shock_time / 1.5)
            shocks[idx:idx+dur] += generate_pink_noise(dur) * env * 3.5
    shocks = butter_lowpass(shocks, 400, order=3)
    
    # Heavy Brownian lava rumble
    brown = generate_brown_noise(num_samples)
    rumble = butter_lowpass(brown * np.exp(-t / 4.0), 160, order=4) * 6.0
    
    combined = lead_blast + quake_dist + shocks + rumble
    saturated = soft_clip(combined, drive=2.6)
    stereo = apply_stereo_reverb(saturated, duration, mix=0.65)
    
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo = stereo / max_val * 0.99
    return stereo

def generate_storm_rain_thunder(duration=10.0):
    """5. 폭풍우 빗소리와 함께 울리는 리얼 천둥 (Storm Rain + Thunder Ambience)"""
    num_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    # Rain ambience layer (pink noise + highpass)
    rain_noise = generate_pink_noise(num_samples)
    rain = butter_bandpass(rain_noise, 800, 14000, order=2) * 0.25
    # Rain droplets texture
    drops = np.random.binomial(1, 0.003, num_samples).astype(float) * np.random.uniform(0.1, 0.4, num_samples)
    rain += drops
    
    # Thunder strike at t = 1.5s
    strike_t = np.maximum(0, t - 1.5)
    strike_env = (strike_t / 0.03) * np.exp(-strike_t / 0.18)
    strike = butter_lowpass(generate_pink_noise(num_samples) * strike_env, 700) * 3.5
    
    # Electric snap at 1.5s
    snap_env = np.exp(-strike_t / 0.015) * (t >= 1.5)
    snap = butter_bandpass(np.random.normal(0, 1, num_samples) * snap_env, 1200, 12000) * 3.0
    
    # Thunder rumble from 1.5s onwards
    rumble_decay = (strike_t / 0.2) * np.exp(-strike_t / 3.5) * (t >= 1.5)
    undulation = 0.6 + 0.4 * np.sin(2 * np.pi * 1.5 * strike_t)
    brown = generate_brown_noise(num_samples)
    rumble = butter_lowpass(brown * rumble_decay * undulation, 250, order=3) * 4.0
    
    # Sub bass boom
    sub = np.sin(2 * np.pi * (70 * np.exp(-strike_t / 0.9) + 25) * strike_t) * np.exp(-strike_t / 2.0) * (t >= 1.5) * 2.0
    sub = soft_clip(sub, drive=2.5)
    
    thunder_mono = strike + snap + rumble + sub
    thunder_saturated = soft_clip(thunder_mono, drive=1.9)
    thunder_stereo = apply_stereo_reverb(thunder_saturated, duration, mix=0.6)
    
    # Rain stereo
    rain_l = rain + np.random.normal(0, 0.05, num_samples)
    rain_r = rain + np.random.normal(0, 0.05, num_samples)
    rain_stereo = np.vstack((rain_l, rain_r)).T
    
    combined = thunder_stereo + rain_stereo
    max_val = np.max(np.abs(combined))
    if max_val > 0:
        combined = combined / max_val * 0.99
    return combined

def export_audio(stereo_data, filename_base, out_dir):
    wav_path = os.path.join(out_dir, f"{filename_base}.wav")
    mp3_path = os.path.join(out_dir, f"{filename_base}.mp3")
    
    audio_int16 = (stereo_data * 32767).astype(np.int16)
    wav.write(wav_path, SAMPLE_RATE, audio_int16)
    print(f"Saved WAV: {wav_path}")
    
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", wav_path,
            "-b:a", "320k", mp3_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"Saved MP3: {mp3_path}")
    except Exception as e:
        print(f"MP3 conversion error: {e}")

if __name__ == "__main__":
    out_dir = os.path.abspath("./thunder_sfx")
    os.makedirs(out_dir, exist_ok=True)
    
    print("1. Generating Massive Lightning Strike Thunder...")
    export_audio(generate_massive_strike_thunder(7.5), "01_massive_strike_thunder", out_dir)
    
    print("2. Generating Cinematic Epic Trailer Thunder...")
    export_audio(generate_cinematic_epic_thunder(8.5), "02_cinematic_epic_thunder", out_dir)
    
    print("3. Generating Distant Deep Rolling Thunder...")
    export_audio(generate_distant_rolling_thunder(10.0), "03_distant_rolling_thunder", out_dir)
    
    print("4. Generating Apocalyptic Cataclysm Thunder...")
    export_audio(generate_apocalyptic_cataclysm_thunder(9.0), "04_apocalyptic_cataclysm_thunder", out_dir)
    
    print("5. Generating Storm Rain & Thunder Ambience...")
    export_audio(generate_storm_rain_thunder(10.0), "05_storm_rain_thunder", out_dir)
    
    print("All 5 Thunder SFX variations created successfully!")
