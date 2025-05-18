**Poker App: Product Requirements Document**

---

## 1. Project Overview

**Description:** A mobile poker game (Expo-based) allowing guests and signed-in users to play Texas Hold’em public tables against other players (human or AI bots), track stats, and purchase cosmetic items.

**Objectives & Goals:**

- Launch a stable, engaging poker app across iOS and Android.
- Provide seamless public-table matchmaking with guaranteed minimum table fill.
- Enable user registration for persistent profiles, stats, and purchase history.
- Build store infrastructure for avatar icons/reactions and future monetization.

**Success Metrics:**

- DAU/MAU ≥ 20%.
- Avg. session length ≥ 10 minutes.
- Guest→Registered conversion ≥ 10%.
- Store purchase conversion ≥ 2%.

---

## 2. User Personas

1. **Guest Player (Casual):** Quick pick-up games without signing in.
2. **Registered Player (Collector):** Tracks stats, customizes avatar, restores purchases.

---

## 3. Functional Requirements

### 3.1 Public Table Matchmaking (All Users)

- **Minimum Table Size:** Every public table must have at least 4 players.

  - **Behavior:** When a user requests to join a public table:

    1. Server searches for existing table with < 6 players but ≥ 3 spots free.
    2. If none found, server creates a new table and fills remaining seats with AI bots (max buy-in).
    3. User is placed into the table immediately.

- **Bot Configuration:**

  - Bots receive the maximum table buy-in amount.
  - Bots use randomized usernames and basic decision logic.

- **Game Flow:**

  - Standard Texas Hold’em rules.
  - Blinds rotate; server enforces pot, bets, and round transitions.

- **Backend Authority:**

  - Backend maintains authoritative game state.
  - **Sockets:** Client actions (fold, call, raise) sent via WebSocket; server processes and acknowledges each action before updating all clients.

### 3.2 Registered User Features

- **All Public Table features**, plus:

  - **Persistent Profile:** Username, avatar, coin balance.
  - **Purchase History:** Store transaction log.
  - **Restore Purchases:** Via Auth.js integration.

### 3.3 Store (Bottom Nav Tab)

- Avatar icons and reaction packs (v1.1).
- **Clarification Needed:** SKU catalog, pricing tiers, currencies.

### 3.4 Stats (Bottom Nav Tab)

- Basic public-table stats: wins/losses over 1d, 1w, 1m, all-time.
- Detailed charts in v1.2.

---

## 4. Non-Functional Requirements

- **Performance:** Cold start < 3s on mid-range devices.
- **Scalability:** Support 10k concurrent users.
- **Security:** Prepare for PCI/DSS compliance.
- **Reliability:** 99.9% uptime; auto-reconnect on network drop.
- **Localization:** English only (v1).

---

## 5. Technical Stack

- **Frontend:** React Native (Expo) + Socket.IO-client.
- **Backend:** Node.js (Express) + Socket.IO for real-time.
- **Auth:** NextAuth.js (Auth.js).
- **Database:** PostgreSQL (AWS RDS).
- **Hosting:** AWS (Elastic Beanstalk / Lambda).
- **Bot Service:** Node.js module integrated into game server.

---

## 6. User Flow (Happy Path)

1. **Open App:** Home screen shows Play tab with “Join Public Table.”
2. **Join Public Table:** Client sends WebSocket `join_table` request.
3. **Server Matches or Creates Table:** Ensures ≥4 seats; fills bots if needed.
4. **Gameplay:** Server drives betting rounds; clients send moves via sockets & await acknowledgments.
5. **End Session:** Prompt user to register/sign in to save stats.

---

## 7. Implementation Roadmap & Steps

### Phase 1: Public-Table Core (v1.0)

1. **Repo & CI Setup**
2. **Backend Skeleton:** Express + Socket.IO server.
3. **DB Schema:** Tables: users, game_sessions, hands, players.
4. **Public Matchmaking API:**

   - Endpoint + WS `join_table`.
   - Logic: find or create table; enforce min 4 players; AI fill.

5. **Game Engine:** Hand evaluation, blind rotation, pot logic.
6. **Bot Integration:** Max buy-in bots with basic decision tree.
7. **Frontend UI:**

   - Join Public Table screen.
   - Table view: cards, bets, player list.
   - WebSocket client for moves & acknowledgments.

8. **Stats API:** Aggregate wins/losses.
9. **QA & Testing:** Unit tests for matchmaking & game logic; end‑to‑end play tests.

### Phase 2: Profiles & Store (v1.1)

1. **Auth Integration:** Sign-up/in flows; token storage.
2. **Profile UI:** Display coins, avatar.
3. **Store Backend & UI:** SKU endpoints; in-app purchase flows.
4. **Restore Purchases Logic.**
5. **Testing & Bugfixes.**

### Phase 3: Analytics & Polish (v1.2)

1. **Stats UI Enhancements:** Charts for session history.
2. **Time-Series API:** Detailed coin & win-rate data.
3. **Localization Prep.**
4. **Performance Tuning.**
5. **Beta Release & Feedback.**

**Open Questions:**

- Store SKU catalog, pricing, currency options.

Please review these lobby specs and socket integration details to confirm before we begin Phase 1 implementation. Let me know if anything else needs clarifying!
