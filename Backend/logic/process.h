#ifndef PROCESS_H  
#define PROCESS_H

#include <iostream>
#include <vector>

class Process {
    public:
    int id;
    int arrivalTime;
    int burstTime;
    int remainingTime; // Crucial for Round Robin and SRTF
    int priority; // for priority algo

    // Result fields
    int completionTime = 0;
    int waitingTime = 0;
    int turnaroundTime = 0;

    // 1. Default Constructor
    Process() : id(0), arrivalTime(0), burstTime(0), remainingTime(0), priority(0) {}

    // 2. Parameterized Constructor
    Process(int p_id, int at, int bt, int prio = 0){
        id = p_id;
        arrivalTime = at;
        burstTime = bt;
        remainingTime = bt;
        priority = prio;

    }
};

#endif