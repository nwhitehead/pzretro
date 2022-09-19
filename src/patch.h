#pragma once

#include <sstream>

enum class Wave
{
    SQUARE,
    SAWTOOTH,
    SINE,
    NOISE,
    TRIANGLE,
    BREAKER,
    SIZE
};

class Patch
{
   public:
    Wave wave_type;
    double env_attack;
    double env_sustain;
    double env_punch;
    double env_decay;
    double base_freq;
    double freq_limit;
    double freq_ramp;
    double freq_dramp;
    double vib_strength;
    double vib_speed;
    double arp_mod;
    double arp_speed;
    double duty;
    double duty_ramp;
    double repeat_speed;
    double pha_offset;
    double pha_ramp;
    double lpf_freq;
    double lpf_ramp;
    double lpf_resonance;
    double hpf_freq;
    double hpf_ramp;

    Patch()
    {
        wave_type = Wave::SQUARE;
        env_attack = 0.0;
        env_sustain = 0.3;
        env_punch = 0.0;
        env_decay = 0.4;
        base_freq = 0.3;
        freq_limit = 0.0;
        freq_ramp = 0.0;
        freq_dramp = 0.0;
        vib_strength = 0.0;
        vib_speed = 0.0;
        arp_mod = 0.0;
        arp_speed = 0.0;
        duty = 0.0;
        duty_ramp = 0.0;
        repeat_speed = 0.0;
        pha_offset = 0.0;
        pha_ramp = 0.0;
        lpf_freq = 1.0;
        lpf_ramp = 0.0;
        lpf_resonance = 0.0;
        hpf_freq = 0.0;
        hpf_ramp = 0.0;
    }
    std::string str()
    {
        std::stringstream ss;
        ss 
    << "\n wave_type     = " << (int)wave_type
    << "\n env_attack    = " <<  env_attack                           
    << "\n env_sustain   = " <<  env_sustain                               
    << "\n env_punch     = " <<  env_punch                               
    << "\n env_decay     = " <<  env_decay                               
    << "\n base_freq     = " <<  base_freq                               
    << "\n freq_limit    = " <<  freq_limit                               
    << "\n freq_ramp     = " <<  freq_ramp                               
    << "\n freq_dramp    = " <<  freq_dramp                               
    << "\n vib_strength  = " <<  vib_strength                               
    << "\n vib_speed     = " <<  vib_speed                               
    << "\n arp_mod       = " <<  arp_mod                               
    << "\n arp_speed     = " <<  arp_speed                               
    << "\n duty          = " <<  duty                                 
    << "\n duty_ramp     = " <<  duty_ramp                               
    << "\n repeat_speed  = " <<  repeat_speed                               
    << "\n pha_offset    = " <<  pha_offset                               
    << "\n pha_ramp      = " <<  pha_ramp                               
    << "\n lpf_freq      = " <<  lpf_freq                               
    << "\n lpf_ramp      = " <<  lpf_ramp                               
    << "\n lpf_resonance = " <<  lpf_resonance                               
    << "\n hpf_freq      = " <<  hpf_freq                               
    << "\n hpf_ramp      = " <<  hpf_ramp;
        return ss.str();
    }
};
