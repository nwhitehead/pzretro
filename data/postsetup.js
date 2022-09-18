// SFXR
SoundEffect.generate = function(seed, params) {

	var sound = {};
	sound.seed = seed;
	sound.play = function() {
		print("SFXR play " + parseInt(this.seed));
	}

	native_generate_sound(
		parseInt(seed), 
		// Envelope
		params.p_env_attack,   // Attack time
		params.p_env_sustain,  // Sustain time
		params.p_env_punch,    // Sustain punch
		params.p_env_decay,    // Decay time

		// Tone
		params.p_base_freq,    // Start frequency
		params.p_freq_limit,   // Min frequency cutoff
		params.p_freq_ramp,    // Slide (SIGNED)
		params.p_freq_dramp,   // Delta slide (SIGNED)

		// Vibrato
		params.p_vib_strength, // Vibrato depth
		params.p_vib_speed,    // Vibrato speed

		// Tonal change
		params.p_arp_mod,      // Change amount (SIGNED)
		params.p_arp_speed,    // Change speed

		// Duty
		params.p_duty,         // Square duty
		params.p_duty_ramp,    // Duty sweep (SIGNED)

		// Repeat
		params.p_repeat_speed, // Repeat speed

		// Phaser
		params.p_pha_offset,   // Phaser offset (SIGNED)
		params.p_pha_ramp,     // Phaser sweep (SIGNED)

		// Low-pass filter
		params.p_lpf_freq,     // Low-pass filter cutoff
		params.p_lpf_ramp,     // Low-pass filter cutoff sweep (SIGNED)
		params.p_lpf_resonance,// Low-pass filter resonance

		// High-pass filter
		params.p_hpf_freq,     // High-pass filter cutoff
		params.p_hpf_ramp,     // High-pass filter cutoff sweep (SIGNED));

		// Main parameters
		params.sound_vol,
		params.sample_rate,
		params.bit_depth,
		params.wave_type
	);
	return sound;
}

var sfxCache = [];

function cacheSeed(seed) {
    if (sound in sfxCache) {
        return sound;
    }

    var params = generateFromSeed(seed);
    params.sound_vol = SOUND_VOL;
    params.sample_rate = SAMPLE_RATE;
    params.bit_depth = BIT_DEPTH;

    var sound = SoundEffect.generate(seed, params);
    sfxCache[sound] = sound;

    return sound;
}

function killAudioButton() {}
function showAudioButton() {}
function toggleMute() {}
function muteAudio() {}
function unMuteAudio() {}

var AUDIO_CONTEXT = {};
