#include "process.h"   
#include <vector>     
#include <queue>       
#include <algorithm>

std::vector<GanttBlock> solveRR(std::vector<Process>& processes, int quantum) {
    std::vector<GanttBlock> timeline;
    int n = processes.size();
    if (n == 0) return timeline;

    // 1. Sort by Arrival Time (ID as tie-breaker)
    std::sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime == b.arrivalTime) return a.id < b.id;
        return a.arrivalTime < b.arrivalTime;
    });

    std::vector<int> remainingTime(n);
    for(int i = 0; i < n; i++) remainingTime[i] = processes[i].burstTime;

    std::queue<int> readyQueue;
    std::vector<bool> inQueue(n, false);
    
    int currentTime = 0;
    int completed = 0;
    int nextProcessIdx = 0;

    // Initial check for time 0 (or first arrival)
    if (nextProcessIdx < n && processes[nextProcessIdx].arrivalTime > currentTime) {
        currentTime = processes[nextProcessIdx].arrivalTime;
    }

    while(nextProcessIdx < n && processes[nextProcessIdx].arrivalTime <= currentTime) {
        readyQueue.push(nextProcessIdx);
        inQueue[nextProcessIdx] = true;
        nextProcessIdx++;
    }

    while(completed < n) {
        if(!readyQueue.empty()) {
            int idx = readyQueue.front();
            readyQueue.pop();

            int executeTime = std::min(quantum, remainingTime[idx]);
            
            // --- RECORD FOR GANTT CHART ---
            timeline.push_back({processes[idx].id, currentTime, currentTime + executeTime});

            currentTime += executeTime;
            remainingTime[idx] -= executeTime;

            // Push all processes that arrived during this execution time
            while(nextProcessIdx < n && processes[nextProcessIdx].arrivalTime <= currentTime) {
                readyQueue.push(nextProcessIdx);
                inQueue[nextProcessIdx] = true;
                nextProcessIdx++;
            }

            if(remainingTime[idx] > 0) {
                // If the process isn't finished, it goes to the BACK of the queue
                readyQueue.push(idx); 
            } else {
                completed++;
                processes[idx].completionTime = currentTime;
                processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            }
        } else {
            // CPU Idle Logic
            if (nextProcessIdx < n) {
                currentTime = processes[nextProcessIdx].arrivalTime;
                while(nextProcessIdx < n && processes[nextProcessIdx].arrivalTime <= currentTime) {
                    readyQueue.push(nextProcessIdx);
                    inQueue[nextProcessIdx] = true;
                    nextProcessIdx++;
                }
            }
        }
    }
    return timeline;
}