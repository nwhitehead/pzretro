/*
Copyright (C) 2016 Beardypig
This file is part of Vectrexia.
Vectrexia is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.
Vectrexia is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Vectrexia.  If not, see <http://www.gnu.org/licenses/>.
*/
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <memory>

#include "libretro.h"

// Callbacks
static retro_log_printf_t log_cb;
static retro_video_refresh_t video_cb;
static retro_input_poll_t input_poll_cb;
static retro_input_state_t input_state_cb;
static retro_environment_t environ_cb;
static retro_audio_sample_t audio_cb;
static retro_audio_sample_batch_t audio_batch_cb;

unsigned retro_api_version(void)
{
    return RETRO_API_VERSION;
}

// Cheats
void retro_cheat_reset(void) 
{
    // Empty
}

void retro_cheat_set(unsigned index, bool enabled, const char *code)
{
    // Empty
}

// Load a cartridge
bool retro_load_game(const struct retro_game_info *info)
{
    return true;
}

bool retro_load_game_special(unsigned game_type, const struct retro_game_info *info, size_t num_info)
{
    return false;
}

// Unload the cartridge
void retro_unload_game(void)
{
    // Empty
}

unsigned retro_get_region(void)
{
    return RETRO_REGION_NTSC;
}

// libretro unused api functions
void retro_set_controller_port_device(unsigned port, unsigned device)
{
    // Empty
}


void *retro_get_memory_data(unsigned id)
{
    return NULL;
}

size_t retro_get_memory_size(unsigned id)
{
    return 0;
}

// Serialisation methods
size_t retro_serialize_size(void)
{
    return 0;
}

bool retro_serialize(void *data, size_t size)
{
    return false;
}

bool retro_unserialize(const void *data, size_t size)
{
    return false;
}

// End of retrolib
void retro_deinit(void)
{
    // Empty
}

// libretro global setters
void retro_set_environment(retro_environment_t cb)
{
    environ_cb = cb;
    bool no_rom = true;
    cb(RETRO_ENVIRONMENT_SET_SUPPORT_NO_GAME, &no_rom);
}

void retro_set_audio_sample_batch(retro_audio_sample_batch_t cb)
{
    // Empty
}

void retro_set_video_refresh(retro_video_refresh_t cb)
{
    video_cb = cb;
}

void retro_set_audio_sample(retro_audio_sample_t cb)
{
    audio_cb = cb;
}

void retro_set_input_poll(retro_input_poll_t cb)
{
    input_poll_cb = cb;
}

void retro_set_input_state(retro_input_state_t cb)
{
    input_state_cb = cb;
}

void retro_init(void)
{
    /* set up some logging */
    struct retro_log_callback log;
    unsigned level = 4;

    if (environ_cb(RETRO_ENVIRONMENT_GET_LOG_INTERFACE, &log))
        log_cb = log.log;
    else
        log_cb = NULL;

    // the performance level is guide to frontend to give an idea of how intensive this core is to run
    environ_cb(RETRO_ENVIRONMENT_SET_PERFORMANCE_LEVEL, &level);

    // Do stuff...
}


/*
 * Tell libretro about this core, it's name, version and which rom files it supports.
 */
void retro_get_system_info(struct retro_system_info *info)
{
    memset(info, 0, sizeof(*info));
    info->library_name = "PuzzleScript";
    info->library_version = "0.1";
    info->need_fullpath = false;
    info->valid_extensions = "pz";
}

/*
 * Tell libretro about the AV system; the fps, sound sample rate and the
 * resolution of the display.
 */
void retro_get_system_av_info(struct retro_system_av_info *info)
{
    int pixel_format = RETRO_PIXEL_FORMAT_XRGB8888;

    memset(info, 0, sizeof(*info));
    info->timing.fps            = 60.0f;
    info->timing.sample_rate    = 441000;
    info->geometry.base_width   = 640;
    info->geometry.base_height  = 480;
    info->geometry.max_width    = 640;
    info->geometry.max_height   = 480;
    // Don't request any specific aspect ratio

    // the performance level is guide to frontend to give an idea of how intensive this core is to run
    environ_cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &pixel_format);
}


// Reset the Vectrex
void retro_reset(void)
{
    // Do stuff
}

uint32_t framebuffer[640*480];

uint8_t offset{0};

// Run a single frames with out Vectrex emulation.
void retro_run(void)
{
    // Run one frame

    // 735 audio samples per frame (44.1kHz @ 60 fps)
    for (int i = 0; i < 735; i++) {
        audio_cb(1, 1);
    }

    for (int row = 0; row < 480; row++) {
        for (int col = 0; col < 640; col++) {
            uint8_t r = col % 256;
            uint8_t g = row % 256;
            uint8_t b = (row + col + offset) % 256;
            framebuffer[row * 640 + col] = (r << 16) | (g << 8) | b;
        }
    }
    offset++;
    video_cb(framebuffer, 640, 480, sizeof(uint32_t) * 640);
}
