import { useState } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";
import { AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from 'react-toastify';

function App() { 

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const contractAddress = "0x01B9ca8d3a3f44C673CBE01482498e440131D5cf";

  
  const notify = (message) => {
    toast(message);
  };

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
    if (!newTask.trim() || !taskDescription.trim()) {
      notify("Please enter both task title and description");
      return;
    }
    if (window.ethereum) {
      await requestAccounts();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.addTask(newTask.trim(), taskDescription.trim(), false);
        await tx.wait();
        notify("Task added successfully");
        setNewTask("");
        setTaskDescription("");
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
    if (window.ethereum) {
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
              description: task.taskText,
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
    if (window.ethereum) {
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

  return (
    <div className="bg-gray-900 text-white flex flex-col text-center items-center mx-auto min-h-screen p-6">
      <h1 className="text-2xl font-press-start font-bold mb-4">My Tasks</h1>
      <button className="bg-blue-500 px-4 py-2 rounded mb-4" onClick={handleConnectWallet}>
        {isConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
      <div className="mb-4">
        <input className="block text-black mb-2 p-2 rounded"
          type="text"
          placeholder="Task Title"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input className="block mb-2 text-black p-2 rounded"
          type="text"
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="bg-blue-500 px-4 py-2 rounded" onClick={addTask}>Add Task</button>
      </div>
      <div>
        {tasks.map((task) => (
          <div key={task.id} className="flex justify-between p-2 bg-gray-800 rounded mb-2">
            <span>{task.title}: {task.description}</span>
            {/* <button onClick={() => deleteTask(task.id)} className="text-red-500">🗑️</button> */}
            <AiOutlineDelete onClick={() => deleteTask(task.id)} className="text-red-500" />
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks yet. Add one above!</p>}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
