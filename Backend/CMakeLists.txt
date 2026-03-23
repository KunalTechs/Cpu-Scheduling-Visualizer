cmake_minimum_required(VERSION 3.10)

# Project Name
project(CPUSchedulingLogic)

# Set C++ Standard (2020 or 2023 is standard for 2026)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Find Drogon and its dependencies
find_package(Dragon CONFIG REQUIRED)


# 2. Include your logic folder
# Create an executable named 'scheduler_test'
# Include the logic directory so we can find Process.h
include_directories(logic)

# 3. Create the executable
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


# 4. Link Drogon to your project
target_link_libraries(scheduler_test PRIVATE Drogon::Drogon)

message(STATUS "Project configured for ${CMAKE_PROJECT_NAME} with Drogon support")