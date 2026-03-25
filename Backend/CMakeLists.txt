cmake_minimum_required(VERSION 3.10)
project(CPUSchedulingLogic)

set(CMAKE_CXX_STANDARD 20)

# Find Packages
find_package(Drogon CONFIG REQUIRED)
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)

include_directories(logic filters controllers /usr/local/include)

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

# Link everything
target_link_libraries(scheduler_test PRIVATE 
    Drogon::Drogon 
    mongo::mongocxx_shared 
    mongo::bsoncxx_shared
)