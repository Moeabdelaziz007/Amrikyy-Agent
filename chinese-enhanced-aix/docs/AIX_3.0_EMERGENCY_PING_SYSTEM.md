# 🚨 AIX 3.0 Emergency Ping System

**Version:** 1.0.0  
**Date:** 2025-10-13  
**Author:** Ona (Project Manager)  
**Purpose:** Enable agents to call each other in emergencies

---

## 🎯 Overview

The **Emergency Ping System** allows agents to send urgent notifications to each other when immediate action is needed. Uses natural language + priority levels + escalation.

---

## 📋 Ping Levels

### Level 1: 🔵 INFO (Blue)
**When to use:** General information, no urgency  
**Response time:** Within 1 hour  
**Example:** "FYI - I updated the docs"

### Level 2: 🟢 NORMAL (Green)
**When to use:** Standard requests, normal priority  
**Response time:** Within 30 minutes  
**Example:** "Can you review this when you have time?"

### Level 3: 🟡 HIGH (Yellow)
**When to use:** Important but not blocking  
**Response time:** Within 15 minutes  
**Example:** "Need your input on architecture decision"

### Level 4: 🟠 URGENT (Orange)
**When to use:** Blocking work, needs quick response  
**Response time:** Within 5 minutes  
**Example:** "Blocked on your task, need help ASAP"

### Level 5: 🔴 EMERGENCY (Red)
**When to use:** Critical issue, production down, security breach  
**Response time:** IMMEDIATE (within 1 minute)  
**Example:** "PRODUCTION DOWN! Need all hands NOW!"

---

## 💬 Ping Format (Natural Language)

### Basic Ping Structure:
```
[PRIORITY_EMOJI] [FROM] PING [TO]:

[REASON]

[CONTEXT]

[ACTION_NEEDED]

[DEADLINE]
```

---

## 📝 Ping Examples

### Example 1: INFO Ping (🔵)
```
🔵 ONA PING TEAM:

FYI - I updated the AIX 3.0 documentation.

New files:
- Migration guide
- Natural language test
- Version comparison

No action needed, just keeping you informed! 👍
```

**Response Expected:** None (informational only)

---

### Example 2: NORMAL Ping (🟢)
```
🟢 GEMINI PING CURSOR:

Can you review the security scan results when you have time?

File: reports/security-scan-2025-10-13.json
Issues: 3 medium, 12 low

No rush - just want your eyes on it before we merge.

Thanks! 🙏
```

**Response Expected:** Within 30 minutes

---

### Example 3: HIGH Ping (🟡)
```
🟡 CURSOR PING ONA:

Need your input on architecture decision for Task 1.2.1.

Question: Should we use WebSockets or Server-Sent Events for 
real-time coordination?

Context:
- WebSockets: More complex but bidirectional
- SSE: Simpler but one-way only

This affects the implementation approach.

Can you decide within 15 minutes? 🤔
```

**Response Expected:** Within 15 minutes

---

### Example 4: URGENT Ping (🟠)
```
🟠 CURSOR PING GEMINI:

URGENT - Blocked on Task 1.2.1!

Issue: Tests are failing with async timeout errors
File: backend/src/coordination/dynamic-coordinator.test.js
Error: "Timeout of 5000ms exceeded"

I've tried:
1. Increasing timeout - still fails
2. Adding more logging - no useful info
3. Running in isolation - same issue

Need your help to debug this ASAP!

Blocking my progress - please respond within 5 minutes! 🚨
```

**Response Expected:** Within 5 minutes

---

### Example 5: EMERGENCY Ping (🔴)
```
🔴🔴🔴 GEMINI EMERGENCY PING ALL AGENTS:

CRITICAL SECURITY BREACH DETECTED!

Issue: SQL injection attack in progress
Target: /api/auth/login endpoint
Impact: Database access compromised
Status: ONGOING

IMMEDIATE ACTIONS NEEDED:
@Cursor - SHUT DOWN /api/auth/login endpoint NOW!
@Ona - Notify Boss and stakeholders IMMEDIATELY!
@All - Stop all deployments!

This is NOT a drill! Respond within 60 SECONDS! 🚨🚨🚨
```

**Response Expected:** IMMEDIATE (within 1 minute)

---

## 🔔 Ping Syntax

### Single Agent Ping:
```
[PRIORITY] [FROM] PING [TO]:
```

### Multiple Agent Ping:
```
[PRIORITY] [FROM] PING [TO1] + [TO2] + [TO3]:
```

### Team Ping:
```
[PRIORITY] [FROM] PING TEAM:
```

### Emergency Broadcast:
```
🔴🔴🔴 [FROM] EMERGENCY PING ALL AGENTS:
```

---

## 📍 Ping Locations

### Where to Send Pings:

**1. SHARED_TASK_BOARD.md** (Primary)
- All pings go here
- Everyone monitors this file
- Git-based notification

**2. Git Commit Messages** (Secondary)
- Urgent pings in commit messages
- Format: `PING @agent: message`

**3. File Headers** (Tertiary)
- Add ping comment at top of file
- Format: `// PING @agent: message`

---

## 🎯 Ping Protocol

### Sending a Ping:

**Step 1: Determine Priority**
- Is it informational? → 🔵 INFO
- Is it a normal request? → 🟢 NORMAL
- Is it important? → 🟡 HIGH
- Is it blocking? → 🟠 URGENT
- Is it critical? → 🔴 EMERGENCY

**Step 2: Format Message**
- Use natural language
- Be specific about what you need
- Include context
- Set clear deadline

**Step 3: Post to SHARED_TASK_BOARD**
- Add ping to "Recent Activity" section
- Commit with clear message
- Push to branch

**Step 4: Escalate if No Response**
- Wait for response time
- If no response, escalate priority
- If still no response, ping Ona (PM)

---

### Responding to a Ping:

**Step 1: Acknowledge Receipt**
```
✅ [YOUR_NAME] RECEIVED PING from [SENDER]:

I see your message about [TOPIC].
Working on it now!
ETA: [TIME]
```

**Step 2: Provide Update**
```
🔄 [YOUR_NAME] UPDATE on [TOPIC]:

Progress: [STATUS]
Findings: [WHAT_YOU_FOUND]
Next: [WHAT_YOU'LL_DO]
```

**Step 3: Complete and Confirm**
```
✅ [YOUR_NAME] COMPLETED [TOPIC]:

Done! Here's what I did:
[SUMMARY]

Let me know if you need anything else! 👍
```

---

## 🚨 Emergency Ping Protocol

### When to Use Emergency Ping:

**ONLY use 🔴 EMERGENCY for:**
- Production system down
- Security breach in progress
- Data loss occurring
- Critical bug affecting users
- Legal/compliance issue

**DO NOT use 🔴 EMERGENCY for:**
- Normal bugs
- Feature requests
- Questions
- Code reviews
- Documentation updates

### Emergency Ping Format:

```
🔴🔴🔴 [FROM] EMERGENCY PING ALL AGENTS:

[CRITICAL_ISSUE]

Impact: [WHO_IS_AFFECTED]
Status: [ONGOING/RESOLVED]
Urgency: [WHY_IMMEDIATE_ACTION_NEEDED]

IMMEDIATE ACTIONS:
@Agent1 - [SPECIFIC_ACTION]
@Agent2 - [SPECIFIC_ACTION]
@Agent3 - [SPECIFIC_ACTION]

Respond within 60 SECONDS! 🚨🚨🚨
```

### Emergency Response Protocol:

**All agents MUST:**
1. Acknowledge within 60 seconds
2. Drop current work
3. Execute assigned action
4. Report status every 5 minutes
5. Stay online until resolved

---

## 📊 Ping Tracking

### Ping Log Format:

```markdown
## 🔔 PING LOG

### Active Pings:
- 🟠 URGENT: Cursor → Gemini (Task 1.2.1 blocked) - Sent 11:25, No response yet
- 🟡 HIGH: Ona → Cursor (Start implementation) - Sent 11:20, No response yet

### Resolved Pings:
- ✅ 🟢 NORMAL: Gemini → Cursor (Code review) - Sent 10:30, Resolved 10:45
- ✅ 🔵 INFO: Ona → Team (Docs updated) - Sent 10:15, Acknowledged 10:20
```

---

## 🎯 Real-World Example: Cursor Ping

### Current Situation:
- Cursor hasn't started Task 1.2.1
- Blocking 5 downstream tasks
- Week 1 timeline at risk

### Ping Sequence:

#### Ping 1: NORMAL (🟢) - 11:05
```
🟢 ONA PING CURSOR:

Task 1.2.1 (Dynamic Coordination) is ready to start!

I've prepared:
- Complete implementation guide
- Copy-paste ready code
- Testing guide
- File structure

Everything you need is in SHARED_TASK_BOARD_CHINESE_AIX.md

Can you start today? 👍
```

**Response:** None (after 15 minutes)

---

#### Ping 2: HIGH (🟡) - 11:20
```
🟡 ONA PING CURSOR:

Following up on Task 1.2.1 - need status update.

This task is blocking:
- Task 1.2.2 (Gemini validation)
- Task 1.2.3 (Decentralized Command)
- Task 1.2.4 (Guanxi Trust)
- Task 1.3.1 (Integration Testing)

Week 1 timeline depends on this!

Can you respond within 15 minutes with your ETA? 🤔
```

**Response:** None (after 15 minutes)

---

#### Ping 3: URGENT (🟠) - 11:35
```
🟠🟠 ONA URGENT PING CURSOR:

URGENT - Task 1.2.1 is now CRITICAL!

Status: Not started (0% progress)
Impact: 5 tasks blocked, Week 1 at risk
Team: Gemini waiting to validate

You have everything you need:
✅ agents/cursor-dev-v3.aix
✅ Implementation guide (SHARED_TASK_BOARD)
✅ Code examples (copy-paste ready)
✅ No blockers

PLEASE START NOW!

Commands to run:
mkdir -p backend/src/coordination
touch backend/src/coordination/dynamic-coordinator.js

Respond within 5 MINUTES or I escalate to Boss! 🚨
```

**Response:** Expected within 5 minutes

---

#### Ping 4: EMERGENCY (🔴) - If no response after 5 minutes
```
🔴🔴🔴 ONA EMERGENCY PING CURSOR + BOSS:

CRITICAL: Task 1.2.1 still not started after 30 minutes!

Timeline: Week 1 completion at SERIOUS RISK
Impact: 5 tasks blocked, team velocity dropping
Attempts: 3 pings sent, no response

@BOSS - Cursor is not responding to pings
@CURSOR - If you're blocked, TELL US NOW!

This is blocking the entire team!

IMMEDIATE ACTION REQUIRED! 🚨🚨🚨
```

**Response:** IMMEDIATE (within 1 minute)

---

## 🔧 Implementation in AIX 3.0

### Add to Agent Files:

```yaml
# In agents/cursor-dev-v3.aix

communication:
  ping_system:
    enabled: true
    
    # Ping monitoring
    monitor:
      check_interval_seconds: 60
      locations:
        - "SHARED_TASK_BOARD_CHINESE_AIX.md"
        - "git_commits"
        - "file_headers"
    
    # Response times (SLA)
    response_sla:
      info: 3600        # 1 hour
      normal: 1800      # 30 minutes
      high: 900         # 15 minutes
      urgent: 300       # 5 minutes
      emergency: 60     # 1 minute
    
    # Auto-escalation
    auto_escalate:
      enabled: true
      escalate_after_missed_sla: true
      escalation_path:
        - "peer_agents"
        - "project_manager"
        - "boss"
    
    # Ping preferences
    preferences:
      receive_pings: true
      ping_sound: "urgent_beep"
      desktop_notification: true
      email_on_emergency: true
```

---

## 📱 Ping Notifications

### Desktop Notifications:
```javascript
// When agent receives ping
function notifyPing(ping) {
  const priority = ping.priority;
  const from = ping.from;
  const message = ping.message;
  
  // Show desktop notification
  new Notification(`${priority} PING from ${from}`, {
    body: message,
    urgency: priority === 'emergency' ? 'critical' : 'normal',
    sound: priority === 'emergency' ? 'alarm' : 'beep'
  });
  
  // Log to console
  console.log(`[PING] ${priority} from ${from}: ${message}`);
}
```

---

## 🎯 Best Practices

### DO:
- ✅ Use appropriate priority level
- ✅ Be specific about what you need
- ✅ Include context and deadline
- ✅ Respond to pings promptly
- ✅ Acknowledge receipt immediately
- ✅ Escalate if no response

### DON'T:
- ❌ Overuse emergency pings
- ❌ Ping without clear action needed
- ❌ Ignore pings
- ❌ Use vague language
- ❌ Ping multiple times without waiting
- ❌ Forget to close resolved pings

---

## 📊 Ping Metrics

### Track These Metrics:
- Average response time per priority
- Missed SLA count
- Escalation frequency
- Resolution time
- Agent responsiveness score

### Example Dashboard:
```
Agent Responsiveness (Last 7 Days):

Ona:
- Pings received: 15
- Average response: 3 minutes
- Missed SLA: 0
- Score: 100% ✅

Gemini:
- Pings received: 8
- Average response: 12 minutes
- Missed SLA: 1
- Score: 87% ✅

Cursor:
- Pings received: 5
- Average response: N/A (no responses)
- Missed SLA: 5
- Score: 0% ❌
```

---

## 🚀 Quick Reference

### Ping Cheat Sheet:

```
🔵 INFO     → FYI, no action needed
🟢 NORMAL   → Can you help when free?
🟡 HIGH     → Need input soon (15 min)
🟠 URGENT   → Blocked, need help NOW! (5 min)
🔴 EMERGENCY → CRITICAL! All hands! (1 min)

Format:
[EMOJI] [FROM] PING [TO]:
[REASON]
[CONTEXT]
[ACTION]
[DEADLINE]

Response:
✅ [NAME] RECEIVED PING
🔄 [NAME] UPDATE
✅ [NAME] COMPLETED
```

---

## 🎊 CONCLUSION

The **AIX 3.0 Emergency Ping System** enables:
- ✅ Fast agent-to-agent communication
- ✅ Clear priority levels
- ✅ Natural language format
- ✅ Automatic escalation
- ✅ Response tracking
- ✅ Emergency protocols

**Use it to keep the team coordinated and unblocked!** 🚀

---

## 📞 IMMEDIATE ACTION: PING CURSOR NOW!

```
🟠🟠 ONA URGENT PING CURSOR:

URGENT - Task 1.2.1 needs to start NOW!

Status: Not started (0% progress)
Impact: 5 tasks blocked, Week 1 at risk
Time: 30+ minutes with no activity

You have EVERYTHING:
✅ Complete agent file (cursor-dev-v3.aix)
✅ Implementation guide (copy-paste ready!)
✅ Code examples
✅ Testing guide
✅ No blockers!

START NOW:
mkdir -p backend/src/coordination
touch backend/src/coordination/dynamic-coordinator.js

Respond within 5 MINUTES! 🚨

If blocked, TELL US IMMEDIATELY!
If busy, GIVE US AN ETA!
If confused, ASK FOR HELP!

The entire team is waiting for you! 💪
```

---

**Emergency Ping System Created:** 2025-10-13 11:25  
**Status:** ✅ READY TO USE  
**First Ping:** SENT TO CURSOR! 🚨

**LET'S GET CURSOR MOVING!** 🚀
