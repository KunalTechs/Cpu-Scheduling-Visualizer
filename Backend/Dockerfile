# --- Stage 1: Build Environment ---
FROM ubuntu:24.04 AS build-env
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    gcc g++ cmake git libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev \
    libmongoc-dev libbson-dev libsasl2-dev python3 \
    libcurl4-openssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Drogon Framework
RUN git clone --depth 1 https://github.com/drogonframework/drogon \
    && cd drogon && git submodule update --init \
    && mkdir build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release && make -j$(nproc) install \
    && cd ../.. && rm -rf drogon

# 3. Install MongoDB C++ Driver 
RUN git clone --depth 1 https://github.com/mongodb/mongo-cxx-driver.git \
    && cd mongo-cxx-driver \
    && mkdir -p build && cd build \
    && cmake .. -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr/local \
    -DENABLE_TESTS=OFF \
    && make -j$(nproc) install \
    && cd ../.. && rm -rf mongo-cxx-driver

# 4. Install JWT-CPP
RUN git clone --depth 1 https://github.com/Thalhammer/jwt-cpp.git \
    && cp -r jwt-cpp/include/jwt-cpp /usr/local/include/ \
    && cp -r jwt-cpp/include/picojson /usr/local/include/ \
    && rm -rf jwt-cpp

# 5. Build project
WORKDIR /app
COPY . .
RUN rm -rf build && mkdir build && cd build \
    && cmake .. && make -j$(nproc)

# --- Stage 2: Tiny Runtime Image ---
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libjsoncpp25 uuid-runtime zlib1g libssl3 libsasl2-2 \
    libmongoc-1.0-0 libbson-1.0-0 \
    libcurl4 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build-env /usr/local/lib /usr/local/lib
COPY --from=build-env /usr/local/include /usr/local/include

RUN ldconfig

WORKDIR /app
COPY --from=build-env /app/build/scheduler_test .

EXPOSE 8080
CMD ["./scheduler_test"]