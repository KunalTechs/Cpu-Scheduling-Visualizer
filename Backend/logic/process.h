#ifndef PROCESS_H  // Header Guard: Prevents double-loading
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
    int completionTime;
    int waitingTime;
    int turnaroundTime;

    Process(int p_id, int at, int bt, int prio = 0){
        id = p_id;
        arrivalTime = at;
        burstTime = bt;
        remainingTime = bt;
        priority = prio;

    }
};

#endif