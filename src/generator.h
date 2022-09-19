#pragma once

#include <vector>

#include "patch.h"
#include "rng.h"

constexpr double PI = 3.141592653589793238462643383279502884;

class Generator
{
public:
    Generator(Patch patch) : patch(patch) {}
    std::vector<float> generate();

private:
    void repeat();
    RNG rng{1234};
    Patch patch;
    double sound_vol = 0.25;
    double gain;
    float master_vol = 1.00f;
    bool filter_on;
    bool playing_sample = false;
    int phase;
    double fperiod;
    double fmaxperiod;
    double fslide;
    double fdslide;
    int period;
    float square_duty;
    float square_slide;
    int env_stage;
    int env_time;
    int env_length[3];
    int env_length_total;
    float env_vol;
    float fphase;
    float fdphase;
    int iphase;
    float phaser_buffer[1024];
    int ipp;
    float noise_buffer[32];
    float fltp;
    float fltdp;
    float fltw;
    float fltw_d;
    float fltdmp;
    float fltphp;
    float flthp;
    float flthp_d;
    float vib_phase;
    float vib_speed;
    float vib_amp;
    int rep_time;
    int rep_limit;
    int arp_time;
    int arp_limit;
    double arp_mod;
};
