# --- Stage 1: Build Stage ---
FROM ubuntu:22.04 AS build-env

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    gcc g++ cmake git libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Drogon Framework
RUN git clone https://github.com/drogonframework/drogon \
    && cd drogon \
    && git submodule update --init \
    && mkdir build && cd build \
    && cmake .. \
    && make install \
    && cd ../.. && rm -rf drogon


# 3. Build your Project
WORKDIR /app
COPY . .
RUN rm -rf build && mkdir build && cd build \
    && cmake .. \
    && make

# --- Stage 2: Runtime Stage ---
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    libjsoncpp25 uuid-runtime zlib1g libssl3 \
    && rm -rf /var/lib/apt/lists/*

# MOVE WORKDIR TO /app/bin TO AVOID VOLUME CLASH
WORKDIR /app/bin

# Copy the binary to /app/bin
COPY --from=build-env /app/build/scheduler_test .

EXPOSE 8080

# Run from the bin folder
CMD ["./scheduler_test"]