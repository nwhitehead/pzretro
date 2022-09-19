// SFXR
SoundEffect.generate = function(seed, params) {

	var sound = {};
	sound.seed = seed;
	sound.play = function() {
		native_play_sound(parseInt(this.seed));
	}

	native_generate_sound(parseInt(seed));
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
