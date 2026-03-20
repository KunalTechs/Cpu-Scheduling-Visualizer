cmake_minimum_required(VERSION 3.10)

# Project Name
project(CPUSchedulingLogic)

# Set C++ Standard (2020 or 2023 is standard for 2026)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find necessary packages (we'll add Drogon here later)
# For now, we just need standard headers


# Create an executable named 'scheduler_test'
# Include the logic directory so we can find Process.h
include_directories(logic)

# Add all files from the Algorithms subfolder
add_executable(scheduler_test 
    main.cc 
    logic/Algorithms/FCFS.cpp
    logic/Algorithms/SJF.cpp
    logic/Algorithms/RR.cpp
    logic/Algorithms/SRTF.cpp
    logic/Algorithms/HRRN.cpp
    logic/Algorithms/PSNP.cpp
    logic/Algorithms/PSP.cpp
)


# Output message to confirm configuration
message(STATUS "Project configured for ${CMAKE_PROJECT_NAME}")