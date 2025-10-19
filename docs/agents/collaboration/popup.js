document.addEventListener("DOMContentLoaded", () => {
  const deploymentStatusEl = document.getElementById("deployment-status");
  const testSummaryEl = document.getElementById("test-summary");
  const agentActivityEl = document.getElementById("agent-activity");
  const lastUpdatedEl = document.getElementById("last-updated");
  const refreshBtn = document.getElementById("refresh-btn");
  const micBtn = document.getElementById("mic-btn");

  const API_BASE_URL = "http://localhost:5000/api/dashboard";

  async function fetchData() {
    try {
      deploymentStatusEl.textContent = "Refreshing...";
      deploymentStatusEl.textContent = "Fetching...";
      const response = await fetch(
        "http://localhost:5000/api/dashboard/status"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      deploymentStatusEl.textContent = data.deploymentStatus;
      testSummaryEl.textContent = data.testSummary;
      agentActivityEl.textContent = data.agentActivity;
      lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
      deploymentStatusEl.textContent = `Error: ${error.message}`;
    }
  }

  async function runTests() {
    try {
      testSummaryEl.textContent = "Starting tests...";
      const response = await fetch(`${API_BASE_URL}/run-tests`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        testSummaryEl.textContent = `Tests running (Job ID: ${data.jobId}). Refreshing...`;
        setTimeout(fetchData, 3000); // Refresh after a delay
      } else {
        testSummaryEl.textContent = `Error starting tests: ${data.error}`;
      }
    } catch (error) {
      testSummaryEl.textContent = `Error: ${error.message}`;
    }
  }

  // --- Voice Command Integration ---
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      micBtn.classList.add("listening");
      micBtn.textContent = "👂";
    };

    recognition.onend = () => {
      micBtn.classList.remove("listening");
      micBtn.textContent = "🎤";
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      console.log("Voice command received:", command);

      if (command.includes("refresh") || command.includes("update")) {
        fetchData();
      } else if (
        command.includes("run tests") ||
        command.includes("test api")
      ) {
        runTests();
      }
    };

    micBtn.addEventListener("click", () => {
      if (micBtn.classList.contains("listening")) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else {
    micBtn.style.display = "none"; // Hide mic button if not supported
  }

  refreshBtn.addEventListener("click", fetchData);
  fetchData(); // Initial fetch
});
