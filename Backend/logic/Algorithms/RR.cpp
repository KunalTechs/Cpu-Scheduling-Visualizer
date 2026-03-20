#include "process.h"
#include <vector>
#include <queue>
#include <algorithm> // Required for std::sort


void solveRR(std::vector<Process>& processes, int quantum) {
    int n =  processes.size();

    // Handle identical arrival times using ID as tie-breaker
    std::sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime == b.arrivalTime) {
            return a.id < b.id; // The Tie-Breaker
        }
        return a.arrivalTime < b.arrivalTime;
    });


    int currentTime =0;
    int completed = 0;

    // 1. Keep track of remaining burst time for each process
    std::vector<int> remainingTime(n);
    for(int i =0; i<n; i++){
        remainingTime[i] = processes[i].burstTime;
    }

    std::queue<int> readyQueue;
    std::vector<bool> inQueue(n, false);

    // 2. Start the simulation
    // Push processes that arrive at time 0
    // Because we sorted, P1 will always enter before P2 if both arrive at 0
    for (int i =0; i<n;i++){
        if(processes[i].arrivalTime <= currentTime) {
            readyQueue.push(i);
            inQueue[i] = true;
        }
    }

    while(completed <n) {
        if(!readyQueue.empty()) {
            int idx = readyQueue.front();
            readyQueue.pop();

            // Execute for the quantum or remaining time, whichever is smaller
            int executeTime =  std::min(quantum, remainingTime[idx]);
                currentTime +=executeTime;
                remainingTime[idx] -= executeTime;

            // 3. IMPORTANT: Check for arrivals BEFORE pushing the current process back
            for (int i=0; i<n; i++) {
                if(processes[i].arrivalTime <= currentTime && !inQueue[i] && remainingTime[i] >0){
                    readyQueue.push(i);
                    inQueue[i] = true;
                }
            }  
            
            // 4. If current process isn't finished, put it back at the end of the line
            if(remainingTime[idx] >0){
                readyQueue.push(idx); // Back to the end of the line
            }else {
                // Process is finished
                completed++;
                processes[idx].completionTime = currentTime;
                processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            }
            
        } else{
            // CPU is idle, wait for the next process to arrive
            currentTime++;
            for (int i =0; i< n; i++) {
                if(processes[i].arrivalTime <= currentTime && !inQueue[i]) {
                    readyQueue.push(i);
                    inQueue[i] = true;
                }
            }
        }
    }
}