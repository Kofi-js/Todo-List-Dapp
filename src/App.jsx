import { useState } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";

const contractAddress = "0x01B9ca8d3a3f44C673CBE01482498e440131D5cf";

const Index = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  async function handleConnectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
        notify("Wallet Connected");
      } catch (error) {
        notify("Wallet Connection Failed");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  async function requestAccounts() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }
  }

  async function addTask() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts(); // Ensure wallet is connected
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.addTask(newTask.trim(), newTask.trim(), false);
        await tx.wait();
        notify("Task added successfully");
        setNewTask("");
        getMyTask();
      } catch (err) {
        console.error("Failed to add Task", err);
        notify("Failed to add Task");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  async function getMyTask() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tasks = await contract.getMyTask();
        setTasks(
          tasks
            .filter((task) => !task.isDeleted)
            .map((task) => ({
              id: task.id.toString(),
              title: task.taskTitle,
              text: task.taskText,
            }))
        );
        notify("Tasks fetched successfully");
      } catch (err) {
        console.error("Failed to get Tasks", err);
        notify("Failed to get Tasks");
      }
    } else {
      notify("MetaMask is not installed.");
    }
  }

  async function deleteTask(taskId) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccounts();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.deleteTask(taskId);
        await tx.wait();
        notify("Task deleted successfully");
        getMyTask();
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
      <h1>My Tasks</h1>
      <button onClick={handleConnectWallet}>
        {isConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
      <div>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div>
        {tasks.map((task) => (
          <div key={task.id}>
            <span>{task.title}: {task.text}</span>
            <button onClick={() => deleteTask(task.id)}>🗑️</button>
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks yet. Add one above!</p>}
      </div>
    </div>
  );
};

export default Index;