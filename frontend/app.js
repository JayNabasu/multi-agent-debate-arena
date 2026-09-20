// Client-Side Controller for Multi-Agent Debate Arena
document.addEventListener("DOMContentLoaded", () => {
  const btnStart = document.getElementById("btn-start-debate");
  const topicInput = document.getElementById("topic-input");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btn-text");
  const feedContainer = document.getElementById("feed-container");
  const consensusBanner = document.getElementById("consensus-banner");
  const verdictText = document.getElementById("verdict-text");
  const synthesisText = document.getElementById("synthesis-text");
  const consensusIndex = document.getElementById("consensus-index");
  const roundIndicator = document.getElementById("round-indicator");

  loadRoster();

  // Presets
  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      topicInput.value = btn.dataset.topic;
    });
  });

  btnStart.addEventListener("click", executeDebate);
  topicInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeDebate();
  });

  async function loadRoster() {
    try {
      const res = await fetch("/api/v1/agents");
      if (res.ok) {
        const agents = await res.json();
        const roster = document.getElementById("agent-roster");
        roster.innerHTML = "";
        agents.forEach(a => {
          const pill = document.createElement("div");
          pill.className = "agent-pill";
          pill.innerHTML = `
            <span>${a.avatar}</span>
            <strong style="color: ${a.color}">${a.name}</strong>
          `;
          roster.appendChild(pill);
        });
      }
    } catch (e) {
      console.warn("Failed to load roster", e);
    }
  }

  async function executeDebate() {
    const topic = topicInput.value.trim();
    if (!topic) {
      alert("Please enter a debate proposition or architectural dilemma.");
      return;
    }

    spinner.style.display = "inline-block";
    btnStart.disabled = true;
    consensusBanner.style.display = "none";
    feedContainer.innerHTML = "";
    roundIndicator.style.display = "block";
    roundIndicator.textContent = "Swarm Deliberation in Progress...";

    try {
      const response = await fetch("/api/v1/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          rounds: 3
        })
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      // Render turns with staggered visual effect
      let currentRound = 0;
      for (const turn of data.turns) {
        if (turn.round_number !== currentRound) {
          currentRound = turn.round_number;
          const roundDivider = document.createElement("div");
          roundDivider.style.textAlign = "center";
          roundDivider.style.margin = "1rem 0";
          roundDivider.style.fontSize = "0.75rem";
          roundDivider.style.color = "var(--text-muted)";
          roundDivider.style.letterSpacing = "0.08em";
          roundDivider.textContent = `── ROUND ${currentRound}: ${turn.turn_type.replace(/_/g, " ")} ──`;
          feedContainer.appendChild(roundDivider);
        }

        const card = document.createElement("div");
        card.className = "turn-card";
        card.style.borderLeftColor = turn.agent_color;
        card.innerHTML = `
          <div class="turn-header">
            <div class="agent-meta">
              <span style="font-size: 1.2rem;">${turn.agent_avatar}</span>
              <div>
                <span class="agent-name" style="color: ${turn.agent_color};">${escapeHtml(turn.agent_name)}</span>
                <span class="agent-title">(${escapeHtml(turn.agent_title)})</span>
              </div>
            </div>
            <div class="turn-badges">
              <span class="turn-tag">Confidence: ${(turn.confidence_score * 100).toFixed(0)}%</span>
              <span class="turn-tag">Support: ${(turn.support_score * 100).toFixed(0)}%</span>
            </div>
          </div>
          <p class="argument-text">${escapeHtml(turn.argument)}</p>
        `;
        feedContainer.appendChild(card);
        feedContainer.scrollTop = feedContainer.scrollHeight;
        await sleep(150);
      }

      // Render Final Consensus
      consensusBanner.style.display = "flex";
      verdictText.textContent = data.consensus_verdict;
      synthesisText.textContent = data.actionable_synthesis;
      consensusIndex.textContent = `${data.consensus_score}%`;
      roundIndicator.textContent = "Deliberation Completed • Consensus Reached";

    } catch (err) {
      alert(`Debate failed: ${err.message}`);
    } finally {
      spinner.style.display = "none";
      btnStart.disabled = false;
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
