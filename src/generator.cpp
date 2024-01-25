#include "generator.h"

#include <cmath>
#include <cstdint>
#include <vector>

void Generator::repeat()
{
    rep_time = 0;
    fperiod = 100.0 / (patch.base_freq * patch.base_freq + 0.001);
    period = static_cast<int>(fperiod);
    fmaxperiod = 100.0 / (patch.freq_limit * patch.freq_limit + 0.001);
    fslide = 1.0 - pow((double)patch.freq_ramp, 3.0) * 0.01;
    fdslide = -pow((double)patch.freq_dramp, 3.0) * 0.000001;
    square_duty = 0.5f - patch.duty * 0.5f;
    square_slide = -patch.duty_ramp * 0.00005f;
    if (patch.arp_mod >= 0.0f)
    {
        arp_mod = 1.0 - pow((double)patch.arp_mod, 2.0) * 0.9;
    }
    else
    {
        arp_mod = 1.0 + pow((double)patch.arp_mod, 2.0) * 10.0;
    }
    arp_time = 0;
    arp_limit = (int)(pow(1.0f - patch.arp_speed, 2.0f) * 20000 + 32);
    if (patch.arp_speed == 1.0f)
    {
        arp_limit = 0;
    }
}

std::vector<float> Generator::generate()
{
    std::vector<float> output;

    // Misnomer, repeat resets things at start
    repeat();

    // Filter
    fltp = 0.0f;
    fltdp = 0.0f;
    fltw = pow(patch.lpf_freq, 3.0f) * 0.1f;
    fltw_d = 1.0f + patch.lpf_ramp * 0.0001f;
    fltdmp = 5.0f / (1.0f + pow(patch.lpf_resonance, 2.0f) * 20.0f) *
             (0.01f + fltw);
    if (fltdmp > 0.8f)
    {
        fltdmp = 0.8f;
    }
    fltphp = 0.0f;
    flthp = pow(patch.hpf_freq, 2.0f) * 0.1f;
    flthp_d = 1.0 + patch.hpf_ramp * 0.0003f;

    // Vibrato
    vib_phase = 0.0f;
    vib_speed = pow(patch.vib_speed, 2.0f) * 0.01f;
    vib_amp = patch.vib_strength * 0.5f;

    // Envelope
    env_vol = 0.0f;
    env_stage = 0;
    env_time = 0;
    env_length[0] = (int)(patch.env_attack * patch.env_attack * 100000.0f);
    env_length[1] =
        (int)(patch.env_sustain * patch.env_sustain * 100000.0f);
    env_length[2] = (int)(patch.env_decay * patch.env_decay * 100000.0f);
    env_length_total = env_length[0] + env_length[1] + env_length[2];

    // Phaser
    phase = 0;
    fphase = pow(patch.pha_offset, 2.0f) * 1020.0f;
    if (patch.pha_offset < 0.0f)
    {
        fphase = -fphase;
    }
    fdphase = pow(patch.pha_ramp, 2.0f) * 1.0f;
    if (patch.pha_ramp < 0.0f)
    {
        fdphase = -fdphase;
    }
    iphase = std::abs((int)fphase);
    ipp = 0;
    for (int i = 0; i < 1024; i++) 
    {
        phaser_buffer[i] = 0.0f;
    }
    
    // Noise
    for (int i = 0; i < 32; i++) 
    {
        noise_buffer[i] = rng.frnd(2.0f) - 1.0f;
    }
    
    // Repeat
    rep_limit = (int)(pow(1.0f - patch.repeat_speed, 2.0f) * 20000 + 32);
    if (patch.repeat_speed == 0.0f)
    {
        rep_limit = 0;
    }
    
    gain = exp(sound_vol) - 1.0;
    
    // Generate
    for (int t = 0; ; ++t)
    {
        // Repeats
        if (rep_limit != 0 && ++rep_time >= rep_limit)
        {
            repeat();
        }

        // Arpeggio (single)
        if (arp_limit != 0 && t >= arp_limit)
        {
            arp_limit = 0;
            fperiod *= arp_mod;
        }

        // Frequency slide
        fslide += fdslide;
        fperiod *= fslide;
        if (fperiod > fmaxperiod)
        {
            fperiod = fmaxperiod;
        }
        
        // Vibrato
        float rfperiod = fperiod;
        if (vib_amp > 0.0f)
        {
            vib_phase += vib_speed;
            rfperiod = fperiod * (1.0 + sin(vib_phase) * vib_amp);
        }
        period = static_cast<int>(rfperiod);
        if (period < 8)
        {
            period = 8;
        }

        // Duty cycle slide
        square_duty += square_slide;
        if (square_duty < 0.0f)
        {
            square_duty = 0.0f;
        }
        if (square_duty > 0.5f)
        {
            square_duty = 0.5f;
        }

        // Volume envelope
        env_time++;
        if (env_time > env_length[env_stage])
        {
            env_time = 1;
            env_stage++;
            while (env_stage < 3 && env_length[env_stage] == 0)
            {
                env_stage++;
            }
            if (env_stage == 3)
            {
                break;
            }
        }
        if (env_stage == 0)
        {
            env_vol = (float)env_time / env_length[0];
        }
        else if (env_stage == 1)
        {
            env_vol = 1.0f + pow(1.0f - (float)env_time / env_length[1], 1.0f) * 2.0f * patch.env_punch;
        }
        else
        {
            // env_stage == 2
            env_vol = 1.0f - (float)env_time / env_length[2];
        }

        // Phaser step
        fphase += fdphase;
        iphase = std::abs(static_cast<int>(fphase));
        if (iphase > 1023) iphase = 1023;

        if (flthp_d != 0.0f)
        {
            flthp *= flthp_d;
            if (flthp < 0.00001f)
            {
                flthp = 0.00001f;
            }
            if (flthp > 0.1f)
            {
                flthp = 0.1f;
            }
        }

        // 8x supersampling
        float sample = 0.0f;
        for (int si = 0; si < 8; si++)
        {
            float sub_sample = 0.0f;
            phase++;
            if (phase >= period)
            {
                phase %= period;
                if (patch.wave_type == Wave::NOISE)
                {
                    for (int i = 0; i < 32; i++)
                    {
                        noise_buffer[i] = rng.frnd(2.0f) - 1.0f;
                    }
                }
            }
            // base waveform
            float fp = static_cast<float>(phase) / period;
            switch (patch.wave_type)
            {
                case Wave::SQUARE:
                    if (fp < square_duty)
                    {
                        sub_sample = 0.5f;
                    }
                    else
                    {
                        sub_sample = -0.5f;
                    }
                    break;
                case Wave::SAWTOOTH:
                    sub_sample = 1.0f - fp * 2.0f;
                    break;
                case Wave::SINE:
                    sub_sample = static_cast<float>(sin(fp * 2.0f * PI));
                    break;
                case Wave::NOISE:
                    sub_sample = noise_buffer[static_cast<int>(phase * 32 / period)];
                    break;
                case Wave::TRIANGLE:
                    sub_sample = fabs(1.0f - fp * 2.0f) - 1.0f;
                    break;
                case Wave::BREAKER:
                    sub_sample = fabs(1.0f - fp * fp * 2.0f) - 1.0f;
                    break;
                default:
                    break;
            }

            // Low-pass filter
            float pp = fltp;
            fltw *= fltw_d;
            if (fltw < 0.0f)
            {
                fltw = 0.0f;
            }
            if (fltw > 0.1f)
            {
                fltw = 0.1f;
            }
            if (patch.lpf_freq != 1.0f)
            {
                fltdp += (sub_sample - fltp) * fltw;
                fltdp -= fltdp * fltdmp;
            }
            else
            {
                fltp = sub_sample;
                fltdp = 0.0f;
            }
            fltp += fltdp;

            // High-pass filter
            fltphp += fltp - pp;
            fltphp -= fltphp * flthp;
            sub_sample = fltphp;

            // Phaser
            phaser_buffer[ipp & 1023] = sub_sample;
            sub_sample += phaser_buffer[(ipp - iphase + 1024) & 1023];
            ipp = (ipp + 1) & 1023;

            // Final accumulation and envelope application
            sample += sub_sample * env_vol;
        }
        sample = sample / 8.0f * master_vol;
        sample *= gain;

        output.push_back(sample);
    }
    return output;
}
