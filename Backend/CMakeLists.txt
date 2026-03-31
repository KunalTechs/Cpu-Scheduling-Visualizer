cmake_minimum_required(VERSION 3.10)
project(CPUSchedulingLogic)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Find Packages
find_package(Drogon CONFIG REQUIRED)
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)

# 2. Include Directories (Added logic/Models for process.h)
include_directories(
    . 
    logic 
    logic/Models 
    logic/Algorithms 
    filters 
    controllers 
    /usr/local/include
)

# 3. Add Executable
add_executable(scheduler_test 
    main.cc 
    logic/Algorithms/FCFS.cpp
    logic/Algorithms/SJF.cpp
    logic/Algorithms/RR.cpp
    logic/Algorithms/SRTF.cpp
    logic/Algorithms/HRRN.cpp
    logic/Algorithms/PSNP.cpp
    logic/Algorithms/PSP.cpp
    controllers/Simulator.cc  
)

# 4. Link Libraries
target_link_libraries(scheduler_test PRIVATE 
    Drogon::Drogon 
    mongo::mongocxx_shared 
    mongo::bsoncxx_shared
)