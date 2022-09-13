include_directories(.)
set(EXPORT_MAP "${CMAKE_SOURCE_DIR}/export.map")

add_library(puzzlescript_libretro SHARED
    libretro/libretro.cpp
)

set_target_properties(puzzlescript_libretro PROPERTIES PREFIX "")
set(CMAKE_EXE_LINKER_FLAGS "-T ${EXPORT_MAP}")

set_source_files_properties(libretro/libretro.cpp
    PROPERTIES OBJECT_DEPENDS ${EXPORT_MAP})
