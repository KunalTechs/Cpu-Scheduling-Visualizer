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
    int currentTime = 0;
    int completed = 0;
    int nextProcessIdx = 0;

    while(completed < n) {
        // --- IDLE LOGIC ---
        // If queue is empty and there are processes left to arrive
        if(readyQueue.empty() && nextProcessIdx < n && processes[nextProcessIdx].arrivalTime > currentTime) {
            int nextArrival = processes[nextProcessIdx].arrivalTime;
            timeline.push_back({"IDLE", currentTime, nextArrival});
            currentTime = nextArrival;
        }

        // Add all processes that have arrived by now to the queue
        while(nextProcessIdx < n && processes[nextProcessIdx].arrivalTime <= currentTime) {
            readyQueue.push(nextProcessIdx);
            nextProcessIdx++;
        }

        if(!readyQueue.empty()) {
            int idx = readyQueue.front();
            readyQueue.pop();

            int executeTime = std::min(quantum, remainingTime[idx]);
            
            // Record execution
            timeline.push_back({processes[idx].id, currentTime, currentTime + executeTime});

            currentTime += executeTime;
            remainingTime[idx] -= executeTime;

            // CRITICAL RR LOGIC: 
            // 1. Check for new arrivals during execution first
            while(nextProcessIdx < n && processes[nextProcessIdx].arrivalTime <= currentTime) {
                readyQueue.push(nextProcessIdx);
                nextProcessIdx++;
            }

            // 2. Then put the interrupted process back at the end of the queue
            if(remainingTime[idx] > 0) {
                readyQueue.push(idx); 
            } else {
                completed++;
                processes[idx].completionTime = currentTime;
                processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            }
        } else if (nextProcessIdx < n) {
             // Fallback for unexpected gaps
             currentTime++;
        }
    }
    return timeline;
}