document.addEventListener("DOMContentLoaded", () => {
  const deploymentStatusEl = document.getElementById("deployment-status");
  const testSummaryEl = document.getElementById("test-summary");
  const agentActivityEl = document.getElementById("agent-activity");
  const lastUpdatedEl = document.getElementById("last-updated");
  const refreshBtn = document.getElementById("refresh-btn");

  async function fetchData() {
    try {
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

  refreshBtn.addEventListener("click", fetchData);
  fetchData(); // Initial fetch
});
