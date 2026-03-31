#ifndef PROCESS_H  
#define PROCESS_H

#include <iostream>
#include <vector>
#include <string>

// This is what React needs for the Gantt Chart
struct GanttBlock {
    std::string id;
    int start;
    int end;
};

class Process {
public:
    std::string id; 
    int arrivalTime;
    int burstTime;
    int remainingTime; 
    int priority; 

    int completionTime = 0;
    int waitingTime = 0;
    int turnaroundTime = 0;

    Process() : id("0"), arrivalTime(0), burstTime(0), remainingTime(0), priority(0) {}

    Process(std::string p_id, int at, int bt, int prio = 0){
        id = p_id;
        arrivalTime = at;
        burstTime = bt;
        remainingTime = bt;
        priority = prio;
    }
};

#endif