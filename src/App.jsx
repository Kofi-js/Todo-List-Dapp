import { useState } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";

const contractAddress = "0x01B9ca8d3a3f44C673CBE01482498e440131D5cf";

const Index = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Wallet connect button
  async function handleConnectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        notify("Wallet Connected");
      } catch (error) {
        notify("Wallet Connection Failed");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  // Helper function to request accounts
  async function requestAccounts() {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  }

  // To Add Task
  async function addTask() {
    if (!newTask.trim()) {
      notify("Please enter a task");
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts(); // Ensure wallet is connected
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.addTask(newTask.trim());
        await tx.wait(); // Wait for confirmation
        notify("Task added successfully");
        setNewTask("");
        getMyTask(); // Refresh the task list
      } catch (err) {
        console.error("Failed to add Task", err);
        notify("Failed to add Task");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  // To Get tasks
  async function getMyTask() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts(); // Ensure wallet is connected

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tasks = await contract.getTasks();
        setTasks(tasks.map(task => ({
          id: task.id.toString(),
          text: task.text,
          completed: task.completed
        })));
        notify("Tasks fetched successfully");
      } catch (err) {
        console.error("Failed to get Tasks", err);
        notify("Failed to get Tasks");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  // To deleteTask
  async function deleteTask(taskId) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts(); // Ensure wallet is connected

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.deleteTask(taskId);
        await tx.wait(); // Wait for confirmation
        notify("Task deleted successfully");
        getMyTask(); // Refresh the task list
      } catch (err) {
        console.error("Failed to delete Task", err);
        notify("Failed to delete Task");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const notify = (message) => {
    alert(message);
  };

  return (
    <div>
      <div>
        <h1>My Tasks</h1>
        
        <button
          onClick={handleConnectWallet}
        >
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>

        <div>
          <div>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={addTask}
            >
              Add Task
            </button>
          </div>

          <div>
            {tasks.map((task) => (
              <div
                key={task.id}>
                <div>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}/>
                  <span>
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <p>No tasks yet. Add one above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;