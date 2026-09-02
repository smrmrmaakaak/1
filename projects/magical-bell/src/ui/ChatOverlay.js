import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';

export class ChatOverlay {
  constructor(networkManager) {
    this.network = networkManager;
    this.isOpen = false;
    this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);

    this._createDOM();
    this._setupEvents();

    if (this.network) {
      this.network.onChatReceived = (msg) => this.addMessage(msg);
      this.network.onOnlineCountChanged = (count) => this.updateOnlineCount(count);
    }
  }

  _createDOM() {
    // 1. Chat Box Container (Bottom-left above joystick or at bottom)
    this.container = document.createElement('div');
    this.container.id = 'multiplayer-chat-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: ${this.isMobile ? '120px' : '24px'};
      left: 18px;
      width: 320px;
      max-width: calc(100vw - 36px);
      display: ${this.isMobile ? 'none' : 'flex'};
      flex-direction: column;
      gap: 6px;
      z-index: 1000;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: opacity 0.2s, transform 0.2s;
    `;

    // Messages Log
    this.log = document.createElement('div');
    this.log.id = 'chat-messages-log';
    this.log.style.cssText = `
      height: 140px;
      overflow-y: auto;
      background: rgba(12, 16, 24, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.2) transparent;
      -webkit-overflow-scrolling: touch;
    `;
    this.container.appendChild(this.log);

    // Input Bar
    this.inputBar = document.createElement('div');
    this.inputBar.style.cssText = `
      display: flex;
      gap: 5px;
      align-items: center;
    `;

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = '메시지 입력 ([Enter] 키)...';
    this.input.maxLength = 100;
    this.input.style.cssText = `
      flex: 1;
      background: rgba(20, 26, 40, 0.92);
      border: 1px solid rgba(255, 215, 0, 0.4);
      border-radius: 8px;
      padding: 8px 10px;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
      touch-action: manipulation;
    `;
    this.input.addEventListener('focus', () => {
      this.input.style.borderColor = '#ffd700';
    });
    this.input.addEventListener('blur', () => {
      this.input.style.borderColor = 'rgba(255, 215, 0, 0.4)';
    });

    this.sendBtn = document.createElement('button');
    this.sendBtn.innerText = '전송';
    this.sendBtn.style.cssText = `
      background: linear-gradient(135deg, #e67e22, #d35400);
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      color: #ffffff;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(211, 84, 0, 0.4);
      touch-action: manipulation;
    `;
    this.sendBtn.addEventListener('click', () => this._send());

    this.inputBar.appendChild(this.input);
    this.inputBar.appendChild(this.sendBtn);
    this.container.appendChild(this.inputBar);

    document.body.appendChild(this.container);

    // Initial system greeting
    this.addSystemMessage('🌐 원피스 게임 베타1 성소 전장에 오신 것을 환영합니다!');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen) {
      this.input.focus();
    }
  }

  _setupEvents() {
    // Connect to top menu bar chat button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-menu-chat' || e.target.closest('#btn-menu-chat')) {
        this.toggleChat();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (document.activeElement === this.input) {
          this._send();
          this.input.blur();
        } else {
          if (this.container.style.display === 'none') {
            this.toggleChat();
          } else {
            this.input.focus();
          }
        }
        e.stopPropagation();
      } else if (e.key === 'Escape') {
        if (document.activeElement === this.input) {
          this.input.blur();
          e.stopPropagation();
        }
      }
    });
  }

  _send() {
    const text = this.input.value.trim();
    if (!text) return;
    this.input.value = '';
    if (this.network) {
      this.network.sendChat(text);
    }
  }

  addMessage(msg) {
    const item = document.createElement('div');
    item.style.cssText = `
      font-size: 12px;
      line-height: 1.35;
      word-break: break-word;
      animation: fadeIn 0.2s ease-out;
    `;

    const heroMeta = HEROES_DATA[msg.heroId] || {};
    const color = heroMeta.color || '#ffaa00';
    const heroName = heroMeta.name || '모험가';

    const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = `
      <span style="color: rgba(255,255,255,0.4); font-size: 10px; margin-right: 3px;">[${time}]</span>
      <span style="color: ${color}; font-weight: bold; background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 4px; margin-right: 3px;">${msg.senderName || heroName}</span>
      <span style="color: #f0f3f6;">${this._escapeHtml(msg.text)}</span>
    `;

    this.log.appendChild(item);
    this.log.scrollTop = this.log.scrollHeight;
  }

  addSystemMessage(text) {
    const item = document.createElement('div');
    item.style.cssText = `
      font-size: 11.5px;
      color: #38bdf8;
      font-style: italic;
      padding: 1px 0;
    `;
    item.innerText = text;
    this.log.appendChild(item);
    this.log.scrollTop = this.log.scrollHeight;
  }

  updateOnlineCount(count) {
    const numEl = document.getElementById('online-count-num');
    if (numEl) numEl.innerText = count;
  }

  _escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
