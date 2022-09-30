#include "sfxr.h"

namespace sfxr
{

Patch pickupCoin(RNG rng)
{
    Patch result;
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::NOISE)
    {
        result.wave_type = Wave::SQUARE;
    }
    result.base_freq = 0.4 + rng.frnd(0.5);
    result.env_attack = 0.0;
    result.env_sustain = rng.frnd(0.1);
    result.env_decay = 0.1 + rng.frnd(0.4);
    result.env_punch = 0.3 + rng.frnd(0.3);
    if (rng.rnd(1))
    {
        result.arp_speed = 0.5 + rng.frnd(0.2);
        float num = (rng.irnd(7) | 1) + 1;
        float den = num + (rng.irnd(7) | 1) + 2;
        result.arp_mod = num / den;
    }
    return result;
}

Patch laserShoot(RNG rng)
{
    Patch result;
    result.wave_type =
        static_cast<Wave>(rng.rnd(2));
    if (result.wave_type == Wave::SINE && rng.rnd(1))
    {
        result.wave_type = static_cast<Wave>(rng.rnd(1));
    }
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::NOISE)
    {
        result.wave_type = Wave::SQUARE;
    }
    result.base_freq = 0.5 + rng.frnd(0.5);
    result.freq_limit = result.base_freq - 0.2 - rng.frnd(0.6);
    if (result.freq_limit < 0.2) result.freq_limit = 0.2;
    result.freq_ramp = -0.15 - rng.frnd(0.2);
    if (rng.rnd(2) == 0)
    {
        result.base_freq = 0.3 + rng.frnd(0.6);
        result.freq_limit = rng.frnd(0.1);
        result.freq_ramp = -0.35 - rng.frnd(0.3);
    }
    if (rng.rnd(1))
    {
        result.duty = rng.frnd(0.5);
        result.duty_ramp = rng.frnd(0.2);
    }
    else
    {
        result.duty = 0.4 + rng.frnd(0.5);
        result.duty_ramp = -rng.frnd(0.7);
    }
    result.env_attack = 0.0;
    result.env_sustain = 0.1 + rng.frnd(0.2);
    result.env_decay = rng.frnd(0.4);
    if (rng.rnd(1)) result.env_punch = rng.frnd(0.3);
    if (rng.rnd(2) == 0)
    {
        result.pha_offset = rng.frnd(0.2);
        result.pha_ramp = -rng.frnd(0.2);
    }
    if (rng.rnd(1))
    {
        result.hpf_freq = rng.frnd(0.3);
    }
    return result;
}

Patch explosion(RNG rng)
{
    Patch result;
    if (rng.rnd(1))
    {
        result.base_freq = 0.1 + rng.frnd(0.4);
        result.freq_ramp = -0.1 + rng.frnd(0.4);
    }
    else
    {
        result.base_freq = 0.2 + rng.frnd(0.7);
        result.freq_ramp = -0.2 - rng.frnd(0.2);
    }
    result.base_freq *= result.base_freq;
    if (rng.rnd(4) == 0)
    {
        result.freq_ramp = 0.0;
    }
    if (rng.rnd(2) == 0)
    {
        result.repeat_speed = 0.3 + rng.frnd(0.5);
    }
    result.env_attack = 0.0;
    result.env_sustain = 0.1 + rng.frnd(0.3);
    result.env_decay = rng.frnd(0.5);
    if (rng.rnd(1) == 0)
    {
        result.pha_offset = -0.3 + rng.frnd(0.9);
        result.pha_ramp = -rng.frnd(0.3);
    }
    result.env_punch = 0.2 + rng.frnd(0.6);
    if (rng.rnd(1))
    {
        result.vib_strength = rng.frnd(0.7);
        result.vib_speed = rng.frnd(0.6);
    }
    if (rng.rnd(2) == 0)
    {
        result.arp_speed = 0.6 + rng.frnd(0.3);
        result.arp_mod = 0.8 - rng.frnd(1.6);
    }
    return result;
}

Patch powerUp(RNG rng)
{
    Patch result;
    if (rng.rnd(1))
    {
        result.wave_type = Wave::SAWTOOTH;
    }
    else
    {
        result.duty = rng.frnd(0.6);
    }
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::NOISE)
    {
        result.wave_type = Wave::SQUARE;
    }
    if (rng.rnd(1))
    {
        result.base_freq = 0.2 + rng.frnd(0.3);
        result.freq_ramp = 0.1 + rng.frnd(0.4);
        result.repeat_speed = 0.4 + rng.frnd(0.4);
    }
    else
    {
        result.base_freq = 0.2 + rng.frnd(0.3);
        result.freq_ramp = 0.05 + rng.frnd(0.2);
        if (rng.rnd(1))
        {
            result.vib_strength = rng.frnd(0.7);
            result.vib_speed = rng.frnd(0.6);
        }
    }
    result.env_attack = 0.0;
    result.env_sustain = rng.frnd(0.4);
    result.env_decay = 0.1 + rng.frnd(0.4);
    return result;
}

Patch hitHurt(RNG rng)
{
    Patch result;
    result.wave_type = static_cast<Wave>(rng.rnd(2));
    if (result.wave_type == Wave::SINE)
    {
        result.wave_type = Wave::NOISE;
    }
    if (result.wave_type == Wave::SQUARE)
    {
        result.duty = rng.frnd(0.6);
    }
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    result.base_freq = 0.2 + rng.frnd(0.6);
    result.freq_ramp = -0.3 - rng.frnd(0.4);
    result.env_attack = 0.0;
    result.env_sustain = rng.frnd(0.1);
    result.env_decay = 0.1 + rng.frnd(0.2);
    if (rng.rnd(1))
    {
        result.hpf_freq = rng.frnd(0.3);
    }
    return result;
};

Patch jump(RNG rng)
{
    Patch result;
    result.wave_type = Wave::SQUARE;
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::NOISE)
    {
        result.wave_type = Wave::SQUARE;
    }
    result.duty = rng.frnd(0.6);
    result.base_freq = 0.3 + rng.frnd(0.3);
    result.freq_ramp = 0.1 + rng.frnd(0.2);
    result.env_attack = 0.0;
    result.env_sustain = 0.1 + rng.frnd(0.3);
    result.env_decay = 0.1 + rng.frnd(0.2);
    if (rng.rnd(1))
    {
        result.hpf_freq = rng.frnd(0.3);
    }
    if (rng.rnd(1))
    {
        result.lpf_freq = 1.0 - rng.frnd(0.6);
    }
    return result;
};

Patch blipSelect(RNG rng)
{
    Patch result;
    result.wave_type = static_cast<Wave>(rng.rnd(1));
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::NOISE)
    {
        result.wave_type = static_cast<Wave>(rng.rnd(1));
    }
    if (result.wave_type == Wave::SQUARE)
    {
        result.duty = rng.frnd(0.6);
    }
    result.base_freq = 0.2 + rng.frnd(0.4);
    result.env_attack = 0.0;
    result.env_sustain = 0.1 + rng.frnd(0.1);
    result.env_decay = rng.frnd(0.2);
    result.hpf_freq = 0.1;
    return result;
};

Patch pushSound(RNG rng)
{
    Patch result;
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::SINE)
    {
        result.wave_type = Wave::NOISE;
    }
    if (result.wave_type == Wave::SQUARE)
    {
        result.wave_type = Wave::NOISE;
    }
    result.base_freq = 0.1 + rng.frnd(0.4);
    result.freq_ramp = 0.05 + rng.frnd(0.2);

    result.env_attack = 0.01 + rng.frnd(0.09);
    result.env_sustain = 0.01 + rng.frnd(0.09);
    result.env_decay = 0.01 + rng.frnd(0.09);

    result.repeat_speed = 0.3 + rng.frnd(0.5);
    result.pha_offset = -0.3 + rng.frnd(0.9);
    result.pha_ramp = -rng.frnd(0.3);
    result.arp_speed = 0.6 + rng.frnd(0.3);
    result.arp_mod = 0.8 - rng.frnd(1.6);
    return result;
}

Patch random(RNG rng)
{
    Patch result;
    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    result.base_freq = pow(rng.frnd(2.0) - 1.0, 2.0);
    if (rng.rnd(1))
    {
        result.base_freq = pow(rng.frnd(2.0) - 1.0, 3.0) + 0.5;
    }
    result.freq_limit = 0.0;
    result.freq_ramp = pow(rng.frnd(2.0) - 1.0, 5.0);
    if (result.base_freq > 0.7 && result.freq_ramp > 0.2)
    {
        result.freq_ramp = -result.freq_ramp;
    }
    if (result.base_freq < 0.2 && result.freq_ramp < -0.05)
    {
        result.freq_ramp = -result.freq_ramp;
    }
    result.freq_dramp = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.duty = rng.frnd(2.0) - 1.0;
    result.duty_ramp = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.vib_strength = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.vib_speed = rng.frnd(2.0) - 1.0;
    result.env_attack = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.env_sustain = pow(rng.frnd(2.0) - 1.0, 2.0);
    result.env_decay = rng.frnd(2.0) - 1.0;
    result.env_punch = pow(rng.frnd(0.8), 2.0);
    if (result.env_attack + result.env_sustain + result.env_decay < 0.2)
    {
        result.env_sustain += 0.2 + rng.frnd(0.3);
        result.env_decay += 0.2 + rng.frnd(0.3);
    }
    result.lpf_resonance = rng.frnd(2.0) - 1.0;
    result.lpf_freq = 1.0 - pow(rng.frnd(1.0), 3.0);
    result.lpf_ramp = pow(rng.frnd(2.0) - 1.0, 3.0);
    if (result.lpf_freq < 0.1 && result.lpf_ramp < -0.05)
    {
        result.lpf_ramp = -result.lpf_ramp;
    }
    result.hpf_freq = pow(rng.frnd(1.0), 5.0);
    result.hpf_ramp = pow(rng.frnd(2.0) - 1.0, 5.0);
    result.pha_offset = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.pha_ramp = pow(rng.frnd(2.0) - 1.0, 3.0);
    result.repeat_speed = rng.frnd(2.0) - 1.0;
    result.arp_speed = rng.frnd(2.0) - 1.0;
    result.arp_mod = rng.frnd(2.0) - 1.0;
    return result;
}

Patch bird(RNG rng)
{
    Patch result;

    if (rng.frnd(10) < 1)
    {
        result.wave_type =
            static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
        if (result.wave_type == Wave::NOISE)
        {
            result.wave_type = Wave::SQUARE;
        }
        result.env_attack = 0.4304400932967592 + rng.frnd(0.2) - 0.1;
        result.env_sustain = 0.15739346034252394 + rng.frnd(0.2) - 0.1;
        result.env_punch = 0.004488201744871758 + rng.frnd(0.2) - 0.1;
        result.env_decay = 0.07478075528212291 + rng.frnd(0.2) - 0.1;
        result.base_freq = 0.9865265720147687 + rng.frnd(0.2) - 0.1;
        result.freq_limit = 0 + rng.frnd(0.2) - 0.1;
        result.freq_ramp = -0.2995018224359539 + rng.frnd(0.2) - 0.1;
        if (rng.frnd(1.0) < 0.5)
        {
            result.freq_ramp = 0.1 + rng.frnd(0.15);
        }
        result.freq_dramp = 0.004598608156964473 + rng.frnd(0.1) - 0.05;
        result.vib_strength = -0.2202799497929496 + rng.frnd(0.2) - 0.1;
        result.vib_speed = 0.8084998703158364 + rng.frnd(0.2) - 0.1;
        result.arp_mod = 0;
        result.arp_speed = 0;
        result.duty = -0.9031808754347107 + rng.frnd(0.2) - 0.1;
        result.duty_ramp = -0.8128699999808343 + rng.frnd(0.2) - 0.1;
        result.repeat_speed = 0.6014860189319991 + rng.frnd(0.2) - 0.1;
        result.pha_offset = -0.9424902314367765 + rng.frnd(0.2) - 0.1;
        result.pha_ramp = -0.1055482222272056 + rng.frnd(0.2) - 0.1;
        result.lpf_freq = 0.9989765717851521 + rng.frnd(0.2) - 0.1;
        result.lpf_ramp = -0.25051720626043017 + rng.frnd(0.2) - 0.1;
        result.lpf_resonance = 0.32777871505494693 + rng.frnd(0.2) - 0.1;
        result.hpf_freq = 0.0023548750981756753 + rng.frnd(0.2) - 0.1;
        result.hpf_ramp = -0.002375673204842568 + rng.frnd(0.2) - 0.1;
        return result;
    }

    if (rng.frnd(10) < 1)
    {
        result.wave_type =
            static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
        if (result.wave_type == Wave::NOISE)
        {
            result.wave_type = Wave::SQUARE;
        }
        result.env_attack = 0.5277795946672003 + rng.frnd(0.2) - 0.1;
        result.env_sustain = 0.18243733568468432 + rng.frnd(0.2) - 0.1;
        result.env_punch = -0.020159754546840117 + rng.frnd(0.2) - 0.1;
        result.env_decay = 0.1561353422051903 + rng.frnd(0.2) - 0.1;
        result.base_freq = 0.9028855606533718 + rng.frnd(0.2) - 0.1;
        result.freq_limit = -0.008842787837148716;
        result.freq_ramp = -0.1;
        result.freq_dramp = -0.012891241489551925;
        result.vib_strength = -0.17923136138403065 + rng.frnd(0.2) - 0.1;
        result.vib_speed = 0.908263385610142 + rng.frnd(0.2) - 0.1;
        result.arp_mod = 0.41690153355414894 + rng.frnd(0.2) - 0.1;
        result.arp_speed = 0.0010766233195860703 + rng.frnd(0.2) - 0.1;
        result.duty = -0.8735363011184684 + rng.frnd(0.2) - 0.1;
        result.duty_ramp = -0.7397985366747507 + rng.frnd(0.2) - 0.1;
        result.repeat_speed = 0.0591789344172107 + rng.frnd(0.2) - 0.1;
        result.pha_offset = -0.9961184222777699 + rng.frnd(0.2) - 0.1;
        result.pha_ramp = -0.08234769395850523 + rng.frnd(0.2) - 0.1;
        result.lpf_freq = 0.9412475115697335 + rng.frnd(0.2) - 0.1;
        result.lpf_ramp = -0.18261358925834958 + rng.frnd(0.2) - 0.1;
        result.lpf_resonance = 0.24541438107389477 + rng.frnd(0.2) - 0.1;
        result.hpf_freq = -0.01831940280978611 + rng.frnd(0.2) - 0.1;
        result.hpf_ramp = -0.03857383633171346 + rng.frnd(0.2) - 0.1;
        return result;
    }
    if (rng.frnd(10) < 1)
    {
        result.wave_type =
            static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
        if (result.wave_type == Wave::NOISE)
        {
            result.wave_type = Wave::SQUARE;
        }
        result.env_attack = 0.4304400932967592 + rng.frnd(0.2) - 0.1;
        result.env_sustain = 0.15739346034252394 + rng.frnd(0.2) - 0.1;
        result.env_punch = 0.004488201744871758 + rng.frnd(0.2) - 0.1;
        result.env_decay = 0.07478075528212291 + rng.frnd(0.2) - 0.1;
        result.base_freq = 0.9865265720147687 + rng.frnd(0.2) - 0.1;
        result.freq_limit = 0 + rng.frnd(0.2) - 0.1;
        result.freq_ramp = -0.2995018224359539 + rng.frnd(0.2) - 0.1;
        result.freq_dramp = 0.004598608156964473 + rng.frnd(0.2) - 0.1;
        result.vib_strength = -0.2202799497929496 + rng.frnd(0.2) - 0.1;
        result.vib_speed = 0.8084998703158364 + rng.frnd(0.2) - 0.1;
        result.arp_mod = -0.46410459213693644 + rng.frnd(0.2) - 0.1;
        result.arp_speed = -0.10955361249587248 + rng.frnd(0.2) - 0.1;
        result.duty = -0.9031808754347107 + rng.frnd(0.2) - 0.1;
        result.duty_ramp = -0.8128699999808343 + rng.frnd(0.2) - 0.1;
        result.repeat_speed = 0.7014860189319991 + rng.frnd(0.2) - 0.1;
        result.pha_offset = -0.9424902314367765 + rng.frnd(0.2) - 0.1;
        result.pha_ramp = -0.1055482222272056 + rng.frnd(0.2) - 0.1;
        result.lpf_freq = 0.9989765717851521 + rng.frnd(0.2) - 0.1;
        result.lpf_ramp = -0.25051720626043017 + rng.frnd(0.2) - 0.1;
        result.lpf_resonance = 0.32777871505494693 + rng.frnd(0.2) - 0.1;
        result.hpf_freq = 0.0023548750981756753 + rng.frnd(0.2) - 0.1;
        result.hpf_ramp = -0.002375673204842568 + rng.frnd(0.2) - 0.1;
        return result;
    }
    if (rng.frnd(5) > 1)
    {
        result.wave_type =
            static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
        if (result.wave_type == Wave::NOISE)
        {
            result.wave_type = Wave::SQUARE;
        }
        if (rng.rnd(1))
        {
            result.arp_mod = 0.2697849293151393 + rng.frnd(0.2) - 0.1;
            result.arp_speed = -0.3131172257760948 + rng.frnd(0.2) - 0.1;
            result.base_freq = 0.8090588299313949 + rng.frnd(0.2) - 0.1;
            result.duty = -0.6210022920964955 + rng.frnd(0.2) - 0.1;
            result.duty_ramp = -0.00043441813553182567 + rng.frnd(0.2) - 0.1;
            result.env_attack = 0.004321877246874195 + rng.frnd(0.2) - 0.1;
            result.env_decay = 0.1 + rng.frnd(0.2) - 0.1;
            result.env_punch = 0.061737781504416146 + rng.frnd(0.2) - 0.1;
            result.env_sustain = 0.4987252564798832 + rng.frnd(0.2) - 0.1;
            result.freq_dramp = 0.31700340314222614 + rng.frnd(0.2) - 0.1;
            result.freq_limit = 0 + rng.frnd(0.2) - 0.1;
            result.freq_ramp = -0.163380391341416 + rng.frnd(0.2) - 0.1;
            result.hpf_freq = 0.4709005021145149 + rng.frnd(0.2) - 0.1;
            result.hpf_ramp = 0.6924667290539194 + rng.frnd(0.2) - 0.1;
            result.lpf_freq = 0.8351398631384511 + rng.frnd(0.2) - 0.1;
            result.lpf_ramp = 0.36616557192873134 + rng.frnd(0.2) - 0.1;
            result.lpf_resonance = -0.08685777111664439 + rng.frnd(0.2) - 0.1;
            result.pha_offset = -0.036084571580025544 + rng.frnd(0.2) - 0.1;
            result.pha_ramp = -0.014806445085568108 + rng.frnd(0.2) - 0.1;
            result.repeat_speed = -0.8094368475518489 + rng.frnd(0.2) - 0.1;
            result.vib_speed = 0.4496665457171294 + rng.frnd(0.2) - 0.1;
            result.vib_strength = 0.23413762515532424 + rng.frnd(0.2) - 0.1;
        }
        else
        {
            result.arp_mod = -0.35697118026766184 + rng.frnd(0.2) - 0.1;
            result.arp_speed = 0.3581140690559588 + rng.frnd(0.2) - 0.1;
            result.base_freq = 1.3260897696157528 + rng.frnd(0.2) - 0.1;
            result.duty = -0.30984900436710694 + rng.frnd(0.2) - 0.1;
            result.duty_ramp = -0.0014374759133411626 + rng.frnd(0.2) - 0.1;
            result.env_attack = 0.3160357835682254 + rng.frnd(0.2) - 0.1;
            result.env_decay = 0.1 + rng.frnd(0.2) - 0.1;
            result.env_punch = 0.24323114016870148 + rng.frnd(0.2) - 0.1;
            result.env_sustain = 0.4 + rng.frnd(0.2) - 0.1;
            result.freq_dramp = 0.2866475886237244 + rng.frnd(0.2) - 0.1;
            result.freq_limit = 0 + rng.frnd(0.2) - 0.1;
            result.freq_ramp = -0.10956352368742976 + rng.frnd(0.2) - 0.1;
            result.hpf_freq = 0.20772718017889846 + rng.frnd(0.2) - 0.1;
            result.hpf_ramp = 0.1564090637378835 + rng.frnd(0.2) - 0.1;
            result.lpf_freq = 0.6021372770637031 + rng.frnd(0.2) - 0.1;
            result.lpf_ramp = 0.24016227139979027 + rng.frnd(0.2) - 0.1;
            result.lpf_resonance = -0.08787383821160144 + rng.frnd(0.2) - 0.1;
            result.pha_offset = -0.381597686151701 + rng.frnd(0.2) - 0.1;
            result.pha_ramp = -0.0002481687661373495 + rng.frnd(0.2) - 0.1;
            result.repeat_speed = 0.07812112809425686 + rng.frnd(0.2) - 0.1;
            result.vib_speed = -0.13648848579133943 + rng.frnd(0.2) - 0.1;
            result.vib_strength = 0.0018874158972302657 + rng.frnd(0.2) - 0.1;
        }
        return result;
    }

    result.wave_type =
        static_cast<Wave>(rng.irnd(static_cast<int>(Wave::SIZE)));
    if (result.wave_type == Wave::SAWTOOTH || result.wave_type == Wave::NOISE)
    {
        result.wave_type = Wave::SINE;
    }
    result.base_freq = 0.85 + rng.frnd(0.15);
    result.freq_ramp = 0.3 + rng.frnd(0.15);

    result.env_attack = 0 + rng.frnd(0.09);
    result.env_sustain = 0.2 + rng.frnd(0.3);
    result.env_decay = 0 + rng.frnd(0.1);

    result.duty = rng.frnd(2.0) - 1.0;
    result.duty_ramp = pow(rng.frnd(2.0) - 1.0, 3.0);

    result.repeat_speed = 0.5 + rng.frnd(0.1);

    result.pha_offset = -0.3 + rng.frnd(0.9);
    result.pha_ramp = -rng.frnd(0.3);

    result.arp_speed = 0.4 + rng.frnd(0.6);
    result.arp_mod = 0.8 + rng.frnd(0.1);

    result.lpf_resonance = rng.frnd(2.0) - 1.0;
    result.lpf_freq = 1.0 - pow(rng.frnd(1.0), 3.0);
    result.lpf_ramp = pow(rng.frnd(2.0) - 1.0, 3.0);
    if (result.lpf_freq < 0.1 && result.lpf_ramp < -0.05)
    {
        result.lpf_ramp = -result.lpf_ramp;
    }
    result.hpf_freq = pow(rng.frnd(1.0), 5.0);
    result.hpf_ramp = pow(rng.frnd(2.0) - 1.0, 5.0);
    return result;
};

void saveWAV(std::vector<float> samples, std::string filename)
{
    FILE *foutput = fopen(filename.c_str(), "wb");
    if (!foutput)
    {
        throw std::runtime_error("Could not open filename");
    }

    int num_samples = samples.size();
    int wav_bits = 16;
    int wav_freq = 44100;
    // write wav header
    unsigned int dword = 0;
    unsigned short word = 0;
    fwrite("RIFF", 4, 1, foutput);  // "RIFF"
    dword = 40 - 4 + num_samples * wav_bits / 8;
    fwrite(&dword, 1, 4, foutput);  // remaining file size
    fwrite("WAVE", 4, 1, foutput);  // "WAVE"
    fwrite("fmt ", 4, 1, foutput);  // "fmt "
    dword = 16;
    fwrite(&dword, 1, 4, foutput);  // chunk size
    word = 1;
    fwrite(&word, 1, 2, foutput);  // compression code
    word = 1;
    fwrite(&word, 1, 2, foutput);  // channels
    dword = wav_freq;
    fwrite(&dword, 1, 4, foutput);  // sample rate
    dword = wav_freq * wav_bits / 8;
    fwrite(&dword, 1, 4, foutput);  // bytes/sec
    word = wav_bits / 8;
    fwrite(&word, 1, 2, foutput);  // block align
    word = wav_bits;
    fwrite(&word, 1, 2, foutput);  // bits per sample

    fwrite("data", 4, 1, foutput);  // "data"
    dword = num_samples * wav_bits / 8;
    fwrite(&dword, 1, 4, foutput);  // chunk size
    for (auto sample : samples)
    {
        short isample = static_cast<short>(sample * 32000);
        fwrite(&isample, 1, 2, foutput);
    }
    fclose(foutput);
}

void unit_tests()
{
    {
        RNG rng(0);
        assert(rng.uniform() == 0.5331977905620839);
        assert(rng.uniform() == 0.1531524589417522);
        for (int i = 0; i < 1024; i++)
        {
            rng.uniform();
        }
        assert(rng.uniform() == 0.8312710111387246);
    }
    {
        RNG rng(632749);
        Patch p = pushSound(rng);
        assert(p.env_decay == 0.08117953194502579);
        assert(p.freq_ramp == 0.20779508427941235);
        assert(p.wave_type == Wave::SAWTOOTH);
    }
    {
        RNG rng(806717);
        Patch p = pickupCoin(rng);
        assert(p.env_decay == 0.40795044598372276);
        assert(p.base_freq == 0.598671793704112);
        assert(p.wave_type == Wave::SQUARE);
    }
}

std::vector<float> generate(int seed)
{
    int gseed = seed / 100;
    int gtype = seed % 100;

    RNG rng(gseed);
    Patch p;
    switch (gtype)
    {
        case 0:
            p = pickupCoin(rng);
            break;
        case 1:
            p = laserShoot(rng);
            break;
        case 2:
            p = explosion(rng);
            break;
        case 3:
            p = powerUp(rng);
            break;
        case 4:
            p = hitHurt(rng);
            break;
        case 5:
            p = jump(rng);
            break;
        case 6:
            p = blipSelect(rng);
            break;
        case 7:
            p = pushSound(rng);
            break;
        case 8:
            p = random(rng);
            break;
        case 9:
            p = bird(rng);
            break;
        default:
            std::cerr << "DEBUG: Unknown sound type, SFXR problem with seed=" << seed << ", last two digits must be 00--09" << std::endl;
            return std::vector<float>{};
    }
    Generator g{p};
    auto samps = g.generate();
    return samps;
}

void applyBiquad(std::vector<float> &data, float a0, float a1, float a2, float b0, float b1, float b2)
{
    float x1 = 0.0f;
    float x2 = 0.0f;
    float y1 = 0.0f;
    float y2 = 0.0f;
    for (int i = 0; static_cast<size_t>(i) < data.size(); i++)
    {
        float x = data[i];
        float y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2
            - (a1 / a0) * y1 - (a2 / a0) * y2;
        x2 = x1;
        x1 = x;
        y2 = y1;
        y1 = y;
        data[i] = y;
    }
}

void lowpass(std::vector<float> &data, float freq, float Q)
{
    /*
        Coefficients for biquad for LPF from:
        https://www.w3.org/2011/audio/audio-eq-cookbook.html
    */
    float w0 = 2.0f * 3.14159265f * freq / 44100.0f;
    float alpha = std::sin(w0) / (2.0f * Q);
    float a0 = 1.0f + alpha;
    float a1 = -2.0f * std::cos(w0);
    float a2 = 1.0f - alpha;
    float b0 = (1.0f - std::cos(w0)) / 2.0f;
    float b1 = 1.0f - std::cos(w0);
    float b2 = (1.0f - std::cos(w0)) / 2.0f;
    applyBiquad(data, a0, a1, a2, b0, b1, b2);
}

void crunch(std::vector<float> &data, int freqReduceFactor)
{
    // First average every N points together to reduce sampling rate
    for (int i = 0; static_cast<size_t>(i) < data.size(); i += freqReduceFactor)
    {
        int endPos = i + freqReduceFactor;
        if (static_cast<size_t>(endPos) > data.size())
        {
            endPos = data.size();
        }
        float avg = 0.0f;
        for (int j = i; j < endPos; j++)
        {
            avg += data[j];
        }
        avg /= endPos - i;
        for (int j = i; j < endPos; j++)
        {
            data[j] = avg;
        }
    }
}

void quantize(std::vector<float> &data)
{
    for (int i = 0; static_cast<size_t>(i) < data.size(); i++)
    {
        int v = static_cast<int>(std::max(-1.0f, std::min(data[i], 1.0f)) * 128.0f);
        data[i] = (v * 1.0f) / 128.0f;
    }
}

void lofi(std::vector<float> &data)
{
    // Reduce from 44100 Hz -> 5512.5 Hz
    crunch(data, 8);
    // Reduce to 8 bit
    quantize(data);
    // Lowpass filter by 36 dB / octave at 1600 Hz
    lowpass(data, 1600.0f, 1.0f);
    lowpass(data, 1600.0f, 1.0f);
    lowpass(data, 1600.0f, 1.0f);
}

} // namespace sfxr
