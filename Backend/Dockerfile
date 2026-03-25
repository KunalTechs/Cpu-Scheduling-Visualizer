# --- Stage 1: Build Environment ---
FROM ubuntu:22.04 AS build-env
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies (Added python3 here)
RUN apt-get update && apt-get install -y \
    gcc g++ cmake git libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev \
    libmongoc-dev libbson-dev libsasl2-dev python3 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Drogon Framework (Keep this as is)
RUN git clone --depth 1 https://github.com/drogonframework/drogon \
    && cd drogon && git submodule update --init \
    && mkdir build && cd build && cmake .. && make -j$(nproc) install \
    && cd ../.. && rm -rf drogon

# 3. Install MongoDB C++ Driver (Fixed build directory check)
RUN git clone --depth 1 https://github.com/mongodb/mongo-cxx-driver.git \
    && cd mongo-cxx-driver && mkdir -p build && cd build \
    && cmake .. -DCMAKE_BUILD_TYPE=Release \
    -DMONGOCXX_OVERRIDE_DEFAULT_INSTALL_PREFIX=OFF \
    && make -j$(nproc) && make install \
    && cd ../../.. && rm -rf mongo-cxx-driver

# 4. Install JWT-CPP (Header only, very fast)
RUN git clone --depth 1 https://github.com/Thalhammer/jwt-cpp.git \
    && cp -r jwt-cpp/include/jwt-cpp /usr/local/include/ \
    && rm -rf jwt-cpp

# 5. Build project
WORKDIR /app
COPY . .
RUN rm -rf build && mkdir build && cd build \
    && cmake .. && make -j$(nproc)

# --- Stage 2: Tiny Runtime Image ---
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    libjsoncpp25 uuid-runtime zlib1g libssl3 libmongoc-1.0-0 libbson-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/bin
COPY --from=build-env /app/build/scheduler_test .

EXPOSE 8080
CMD ["./scheduler_test"]