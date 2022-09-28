FROM ubuntu:18.04 AS build-stage

WORKDIR /app
RUN apt-get update
RUN apt-get install -y wget
RUN wget https://chrome-infra-packages.appspot.com/dl/gn/gn/linux-amd64/+/latest -O gn.zip
RUN apt-get install -y unzip
RUN unzip gn.zip
RUN apt-get install -y ninja-build
RUN apt-get install -y python3
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 10
RUN apt-get install -y curl sudo
RUN curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN apt-get install -y python-yaml
RUN apt-get install -y python3-pillow
RUN apt-get install -y xxd

RUN wget https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/gcc-linaro-7.5.0-2019.12-x86_64_arm-linux-gnueabihf.tar.xz
RUN wget https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/sysroot-glibc-linaro-2.25-2019.12-arm-linux-gnueabihf.tar.xz

RUN xz --uncompress gcc-linaro-7.5.0-2019.12-x86_64_arm-linux-gnueabihf.tar.xz
RUN xz --uncompress sysroot-glibc-linaro-2.25-2019.12-arm-linux-gnueabihf.tar.xz

RUN tar xvf gcc-linaro-7.5.0-2019.12-x86_64_arm-linux-gnueabihf.tar
RUN tar xvf sysroot-glibc-linaro-2.25-2019.12-arm-linux-gnueabihf.tar

COPY . .

# ARM build
RUN ./gn gen out_arm
RUN echo 'use_precompiled_font = true' >> out_arm/args.gn
RUN echo 'target_cpu = "arm"' >> out_arm/args.gn
RUN echo 'linaro = "/app"' >> out_arm/args.gn
RUN ./gn gen out_arm
RUN ninja -C out_arm -t clean
RUN ninja -C out_arm

# x86_64 build
RUN apt-get install -y g++
RUN ./gn gen out_x64
RUN echo 'use_precompiled_font = true' >> out_x64/args.gn
RUN ./gn gen out_x64
RUN ninja -C out_x64 -t clean
RUN ninja -C out_x64

FROM scratch AS export-stage
COPY --from=build-stage /app/out_arm/puzzlescript_libretro.so /arm/puzzlescript_libretro.so
COPY --from=build-stage /app/puzzlescript_libretro.info /arm/puzzlescript_libretro.info
COPY --from=build-stage /app/out_x64/puzzlescript_libretro.so /x64/puzzlescript_libretro.so
COPY --from=build-stage /app/puzzlescript_libretro.info /x64/puzzlescript_libretro.info
