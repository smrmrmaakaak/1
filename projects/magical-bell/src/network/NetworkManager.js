import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onDisconnect,
  push,
  serverTimestamp
} from 'firebase/database';
import { RemotePlayer } from './RemotePlayer.js';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDoqCJVRsI86yDLPwBcxvEkS7jBqhpCNDM",
  authDomain: "elemental-defense-rpg.firebaseapp.com",
  databaseURL: "https://elemental-defense-rpg-default-rtdb.firebaseio.com",
  projectId: "elemental-defense-rpg",
  storageBucket: "elemental-defense-rpg.firebasestorage.app",
  messagingSenderId: "214560110233",
  appId: "1:214560110233:web:d6c9944b1813fbc186aa08"
};

export class NetworkManager {
  constructor(scene, abilities) {
    this.scene = scene;
    this.abilities = abilities;

    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
    this.localData = {
      id: this.localPlayerId,
      name: '황태민',
      heroId: 'akainu',
      level: 1,
      hp: 1570,
      maxHp: 1570,
      x: 0,
      y: 0,
      z: 0,
      facing: 0,
      anim: 'idle',
      lastSeen: Date.now()
    };

    this.remotePlayers = new Map();
    this.isConnected = false;
    this.onlineCount = 1;
    this.onChatReceived = null;
    this.onOnlineCountChanged = null;

    this.roomPath = 'rooms/sanctuary';
    this.broadcastTimer = 0;
    this.broadcastInterval = 0.066; // 15 FPS network broadcast

    // Fallback broadcast channel for multi-tab testing
    try {
      this.localChannel = new BroadcastChannel('elemental_multiplayer');
      this.localChannel.onmessage = (e) => this._handleChannelMessage(e.data);
    } catch (e) {
      this.localChannel = null;
    }

    this._initFirebase();
  }

  _initFirebase() {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
      this.db = getDatabase(app);
      this.isConnected = true;
      console.log(`[Multiplayer] Connected to Firebase Realtime Database as ${this.localPlayerId}`);

      this._setupPresence();
      this._setupListeners();
    } catch (err) {
      console.warn('[Multiplayer] Firebase RTDB connection fallback to BroadcastChannel:', err);
      this.isConnected = false;
    }
  }

  _setupPresence() {
    if (!this.db) return;

    this.playerRef = ref(this.db, `${this.roomPath}/players/${this.localPlayerId}`);

    // Automatically remove player when disconnected
    onDisconnect(this.playerRef).remove();

    // Register initial player state
    set(this.playerRef, {
      ...this.localData,
      lastSeen: serverTimestamp()
    });
  }

  _setupListeners() {
    if (!this.db) return;

    const playersRef = ref(this.db, `${this.roomPath}/players`);

    onValue(playersRef, (snapshot) => {
      const val = snapshot.val() || {};
      const count = Object.keys(val).length || 1;
      this.onlineCount = count;
      if (this.onOnlineCountChanged) this.onOnlineCountChanged(this.onlineCount);
    });

    onChildAdded(playersRef, (snapshot) => {
      const id = snapshot.key;
      const data = snapshot.val();
      if (id === this.localPlayerId || !data) return;

      if (!this.remotePlayers.has(id)) {
        const remote = new RemotePlayer(id, data, this.scene, this.abilities);
        this.remotePlayers.set(id, remote);
        console.log(`[Multiplayer] Remote player joined: ${data.name} (${id})`);
      }
    });

    onChildChanged(playersRef, (snapshot) => {
      const id = snapshot.key;
      const data = snapshot.val();
      if (id === this.localPlayerId || !data) return;

      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.updateState(data);
      } else {
        const newRemote = new RemotePlayer(id, data, this.scene, this.abilities);
        this.remotePlayers.set(id, newRemote);
      }
    });

    onChildRemoved(playersRef, (snapshot) => {
      const id = snapshot.key;
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.destroy();
        this.remotePlayers.delete(id);
        console.log(`[Multiplayer] Remote player left: (${id})`);
      }
    });

    // Spell Cast Synchronization
    const spellsRef = ref(this.db, `${this.roomPath}/spells`);
    onChildAdded(spellsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || data.casterId === this.localPlayerId) return;

      // Execute remote spell
      const remote = this.remotePlayers.get(data.casterId);
      if (remote) {
        remote.castSpell(data);
      } else if (this.abilities) {
        this.abilities.cast(data.origin, data.direction, data.distance, data.element);
      }
    });

    // Chat Message Synchronization
    const chatsRef = ref(this.db, `${this.roomPath}/chats`);
    onChildAdded(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (data.senderId !== this.localPlayerId) {
        const remote = this.remotePlayers.get(data.senderId);
        if (remote) remote.showChat(data.text);
      }

      if (this.onChatReceived) {
        this.onChatReceived(data);
      }
    });
  }

  _handleChannelMessage(msg) {
    if (!msg || msg.senderId === this.localPlayerId) return;

    if (msg.type === 'player_update') {
      const id = msg.senderId;
      let remote = this.remotePlayers.get(id);
      if (!remote) {
        remote = new RemotePlayer(id, msg.data, this.scene, this.abilities);
        this.remotePlayers.set(id, remote);
      }
      remote.updateState(msg.data);
    } else if (msg.type === 'spell_cast') {
      const remote = this.remotePlayers.get(msg.senderId);
      if (remote) {
        remote.castSpell(msg.data);
      } else if (this.abilities) {
        this.abilities.cast(msg.data.origin, msg.data.direction, msg.data.distance, msg.data.element);
      }
    } else if (msg.type === 'chat') {
      const remote = this.remotePlayers.get(msg.senderId);
      if (remote) remote.showChat(msg.data.text);
      if (this.onChatReceived) this.onChatReceived(msg.data);
    }
  }

  setLocalHero(heroId, name, level = 1, hp = 1570, maxHp = 1570) {
    this.localData.heroId = heroId;
    this.localData.name = name;
    this.localData.level = level;
    this.localData.hp = hp;
    this.localData.maxHp = maxHp;

    if (this.playerRef) {
      update(this.playerRef, {
        heroId,
        name,
        level,
        hp,
        maxHp
      });
    }
  }

  sendSpellCast(origin, direction, distance, element) {
    const spellData = {
      casterId: this.localPlayerId,
      element,
      origin: { x: origin.x, y: origin.y, z: origin.z },
      direction: { x: direction.x, y: direction.y, z: direction.z },
      distance: distance || 6.0,
      timestamp: Date.now()
    };

    if (this.db) {
      const spellsRef = ref(this.db, `${this.roomPath}/spells`);
      push(spellsRef, spellData);
    }

    if (this.localChannel) {
      this.localChannel.postMessage({
        type: 'spell_cast',
        senderId: this.localPlayerId,
        data: spellData
      });
    }
  }

  sendChat(text) {
    if (!text || !text.trim()) return;

    const chatData = {
      senderId: this.localPlayerId,
      senderName: this.localData.name,
      heroId: this.localData.heroId,
      text: text.trim(),
      timestamp: Date.now()
    };

    if (this.db) {
      const chatsRef = ref(this.db, `${this.roomPath}/chats`);
      push(chatsRef, chatData);
    }

    if (this.localChannel) {
      this.localChannel.postMessage({
        type: 'chat',
        senderId: this.localPlayerId,
        data: chatData
      });
    }

    if (this.onChatReceived) {
      this.onChatReceived(chatData);
    }
  }

  update(dt, localCharPos, localFacing, currentAnim, localHp) {
    // 1. Update all remote player avatars
    for (const remote of this.remotePlayers.values()) {
      remote.update(dt);
    }

    // 2. Broadcast local player position/state at 15 FPS
    this.broadcastTimer += dt;
    if (this.broadcastTimer >= this.broadcastInterval && localCharPos) {
      this.broadcastTimer = 0;

      this.localData.x = Number(localCharPos.x.toFixed(2));
      this.localData.y = Number(localCharPos.y.toFixed(2));
      this.localData.z = Number(localCharPos.z.toFixed(2));
      this.localData.facing = Number(localFacing.toFixed(2));
      this.localData.anim = currentAnim || 'idle';
      if (localHp !== undefined) this.localData.hp = localHp;

      if (this.playerRef) {
        update(this.playerRef, {
          x: this.localData.x,
          y: this.localData.y,
          z: this.localData.z,
          facing: this.localData.facing,
          anim: this.localData.anim,
          hp: this.localData.hp,
          lastSeen: serverTimestamp()
        });
      }

      if (this.localChannel) {
        this.localChannel.postMessage({
          type: 'player_update',
          senderId: this.localPlayerId,
          data: this.localData
        });
      }
    }
  }

  dispose() {
    if (this.playerRef) {
      set(this.playerRef, null);
    }
    for (const remote of this.remotePlayers.values()) {
      remote.destroy();
    }
    this.remotePlayers.clear();
    if (this.localChannel) {
      this.localChannel.close();
    }
  }
}
