# VibeLink — Architecture Diagram

## Full System Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Client (Browser / PWA)"]
        UI["React 18 + TypeScript\nVite 5 | Tailwind CSS | shadcn/ui"]
        ROUTER["React Router v6\n/signup /dashboard /discover\n/messages /blog /profile"]
        SOCKET["Socket.io Client\nsrc/utils/socket.ts"]
        SUPABASE_CLIENT["Supabase JS Client\n@supabase/supabase-js"]
    end

    subgraph VERCEL["▲ Vercel (Frontend Hosting)"]
        CDN["Global CDN\nvibelink-connections-forged.vercel.app"]
        SPA["SPA Rewrites\nAll routes → index.html"]
    end

    subgraph SUPABASE["⚡ Supabase (Backend-as-a-Service)"]
        AUTH["Auth\nEmail + Google OAuth\nJWT Tokens"]

        subgraph DB["PostgreSQL Database"]
            PROFILES["profiles"]
            INTERESTS["interests"]
            MATCHES["matches"]
            MATCH_REQ["match_requests"]
            CONVERSATIONS["conversations\n+ photo_unlock_status"]
            MESSAGES_TABLE["messages"]
            PERSONALITY["personality_answers"]
            STARTERS["conversation_starters"]
            TYPING["typing_status"]
        end

        REALTIME["Realtime\nWebSocket Subscriptions"]
        STORAGE["Storage\nprofile-photos\nuser-media"]

        subgraph EDGE["Edge Functions (Deno)"]
            COMPAT["calculate-compatibility\nWeighted personality scoring"]
            AI_STARTERS["generate-conversation-starters\nKimi K2.5 via NVIDIA API"]
        end
    end

    subgraph RENDER["🚀 Render (Chat Server)"]
        CHAT_SERVER["Node.js + Socket.io\nvibelink-connections-forged.onrender.com"]
        CONTACT_MASK["Contact Masking\nPhone/Email/Handle filter"]
        PRESENCE["Online Presence\nTyping Indicators\nRead Receipts"]
    end

    subgraph MONGODB["🍃 MongoDB Atlas"]
        MSG_STORE["Messages Collection\nconversationId + content\n+ masked + timestamps"]
        CONV_STORE["Conversations Collection\nlastMessage + unreadCount"]
    end

    subgraph NVIDIA["🤖 NVIDIA API"]
        KIMI["Kimi K2.5\nmoonshotai/kimi-k2.5\nConversation Starters"]
    end

    subgraph GITHUB["🐙 GitHub"]
        REPO["venomez-viper/\nVibelink-Connections-forged"]
        CI["Auto Deploy\non git push"]
    end

    %% Client connections
    UI --> ROUTER
    UI --> SOCKET
    UI --> SUPABASE_CLIENT

    %% Vercel
    CDN --> UI
    SPA --> CDN
    GITHUB --> CI --> CDN

    %% Supabase connections
    SUPABASE_CLIENT --> AUTH
    SUPABASE_CLIENT --> DB
    SUPABASE_CLIENT --> REALTIME
    SUPABASE_CLIENT --> STORAGE
    SUPABASE_CLIENT --> EDGE

    %% Socket.io
    SOCKET -->|"WebSocket"| CHAT_SERVER
    CHAT_SERVER --> CONTACT_MASK
    CHAT_SERVER --> PRESENCE
    CHAT_SERVER -->|"Store messages"| MONGODB
    MSG_STORE --> CONV_STORE

    %% Edge Functions
    AI_STARTERS -->|"POST /v1/chat/completions"| KIMI
    COMPAT --> DB

    %% Realtime
    REALTIME -.->|"Postgres changes"| CONVERSATIONS
    REALTIME -.->|"Postgres changes"| TYPING
```

---

## Data Flow: New User Signup

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React)
    participant SB as Supabase Auth
    participant DB as Supabase DB

    User->>FE: Fills 10-page questionnaire
    FE->>SB: signUp(email, password)
    SB-->>FE: User JWT token
    FE->>DB: INSERT profiles
    FE->>DB: INSERT interests (hobbies)
    FE->>DB: INSERT match_preferences
    FE->>DB: INSERT personality_answers
    FE-->>User: Redirect → /dashboard
```

---

## Data Flow: Matching

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant EF as Edge Function
    participant DB as Supabase DB

    User->>FE: Opens Dashboard
    FE->>EF: invoke("calculate-compatibility")
    EF->>DB: Fetch personality_answers (all users)
    EF->>DB: Fetch interests, match_preferences
    EF-->>EF: Weighted scoring across 7 dimensions
    EF->>DB: UPSERT matches (top 20)
    EF-->>FE: Return matches + scores
    FE-->>User: Show match cards (no photos)
```

---

## Data Flow: Real-Time Chat

```mermaid
sequenceDiagram
    actor UserA
    actor UserB
    participant CS as Chat Server (Render)
    participant MG as MongoDB Atlas
    participant SB as Supabase

    UserA->>CS: connect() + authenticate(JWT)
    UserB->>CS: connect() + authenticate(JWT)
    UserA->>CS: join_conversation(conversationId)
    CS->>MG: Load last 50 messages
    MG-->>CS: Message history
    CS-->>UserA: message_history event

    UserA->>CS: send_message("Hey!")
    CS-->>CS: maskContactDetails()
    CS->>MG: Save message
    CS-->>UserB: new_message event (real-time)
    CS-->>UserA: new_message event (echo)

    UserB->>CS: mark_read(conversationId)
    CS->>MG: Update read status
    CS-->>UserA: messages_read event (✓✓)
```

---

## Data Flow: AI Conversation Starters

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (ChatWindow)
    participant EF as Edge Function (Supabase)
    participant DB as Supabase DB
    participant AI as Kimi K2.5 (NVIDIA)

    User->>FE: Opens chat (0 messages)
    FE->>EF: invoke("generate-conversation-starters")
    EF->>DB: Check conversation_starters cache
    alt Cache hit
        DB-->>EF: Cached starters
    else Cache miss
        EF->>DB: Fetch personality_answers (both users)
        EF->>DB: Fetch profiles + interests
        EF-->>EF: Build personality text profile
        EF->>AI: POST /v1/chat/completions (Kimi K2.5)
        AI-->>EF: 5 personalized icebreakers
        EF->>DB: Cache in conversation_starters
    end
    EF-->>FE: Return starters[]
    FE-->>User: Show tappable icebreaker cards
```

---

## Photo Unlock Flow

```mermaid
stateDiagram-v2
    [*] --> locked : Conversation created
    locked --> user1_requested : User1 clicks "Unlock Photos"
    locked --> user2_requested : User2 clicks "Unlock Photos"
    user1_requested --> unlocked : User2 clicks "Accept"
    user2_requested --> unlocked : User1 clicks "Accept"
    unlocked --> [*] : Photos visible to both
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui |
| Routing | React Router v6 |
| Hosting | Vercel (global CDN) |
| Auth | Supabase Auth (JWT, Google OAuth) |
| Database | Supabase PostgreSQL |
| Realtime (legacy) | Supabase Realtime |
| Chat Server | Node.js + Socket.io (Render) |
| Chat Storage | MongoDB Atlas |
| AI Matching | Weighted algorithm (client) + Edge Function |
| AI Conversation | Kimi K2.5 via NVIDIA API |
| File Storage | Supabase Storage |
| Version Control | GitHub |
| CI/CD | Vercel auto-deploy on push |
