// Ox Alpha Agent Studio - Client JS

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Elements
  const workspaceName = document.getElementById('workspaceName');
  const fileList = document.getElementById('fileList');
  const refreshFilesBtn = document.getElementById('refreshFilesBtn');
  const messagesContainer = document.getElementById('messagesContainer');
  const welcomeHero = document.getElementById('welcomeHero');
  const chatForm = document.getElementById('chatForm');
  const promptInput = document.getElementById('promptInput');
  const sendBtn = document.getElementById('sendBtn');
  const stopBtn = document.getElementById('stopBtn');
  const agentStatusBadge = document.getElementById('agentStatusBadge');
  const agentStatusText = document.getElementById('agentStatusText');
  const modelSelect = document.getElementById('modelSelect');
  const clearChatBtn = document.getElementById('clearChatBtn');

  // API Key Modal Elements
  const apiKeyModal = document.getElementById('apiKeyModal');
  const apiKeyModalBtn = document.getElementById('apiKeyModalBtn');
  const apiKeyStatusLabel = document.getElementById('apiKeyStatusLabel');
  const closeApiKeyModal = document.getElementById('closeApiKeyModal');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

  let currentAbortController = null;
  let conversationHistory = [];

  // 1. API Key Setup
  function getApiKey() {
    return localStorage.getItem('openrouter_api_key') || '';
  }

  let hasServerEnvKey = false;

  async function loadWorkspaceInfo() {
    try {
      const res = await fetch('/api/workspace');
      const data = await res.json();
      const parts = data.workspace_dir.split(/[/\\]/);
      workspaceName.textContent = parts[parts.length - 1] || data.workspace_dir;
      workspaceName.title = data.workspace_dir;
      hasServerEnvKey = !!data.has_env_key;
      updateApiKeyStatus();
    } catch (e) {
      console.error(e);
      workspaceName.textContent = 'Local Workspace';
    }
  }

  function updateApiKeyStatus() {
    const key = getApiKey();
    if (key) {
      apiKeyStatusLabel.textContent = 'API Key 연결됨';
      apiKeyStatusLabel.classList.add('text-emerald-400');
    } else if (hasServerEnvKey) {
      apiKeyStatusLabel.textContent = 'API Key 연결됨 (.env)';
      apiKeyStatusLabel.classList.add('text-emerald-400');
    } else {
      apiKeyStatusLabel.textContent = 'API Key 설정';
      apiKeyStatusLabel.classList.remove('text-emerald-400');
    }
  }

  async function loadFiles() {
    try {
      fileList.innerHTML = '<div class="text-xs text-gray-500 px-2 py-2">Loading...</div>';
      const res = await fetch('/api/files');
      const data = await res.json();
      
      if (!data.items || data.items.length === 0) {
        fileList.innerHTML = '<div class="text-xs text-gray-500 px-2 py-2">(Empty workspace)</div>';
        return;
      }

      fileList.innerHTML = '';
      data.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-dark-surface cursor-pointer text-xs text-gray-300 hover:text-white transition group';
        
        const iconName = item.is_dir ? 'folder' : getFileIcon(item.name);
        const iconColor = item.is_dir ? 'text-amber-400' : 'text-sky-400';
        
        div.innerHTML = `
          <i data-lucide="${iconName}" class="w-3.5 h-3.5 ${iconColor} flex-shrink-0"></i>
          <span class="truncate flex-1">${item.name}</span>
          ${item.size !== null ? `<span class="text-[10px] text-gray-600 group-hover:text-gray-400">${formatBytes(item.size)}</span>` : ''}
        `;

        div.addEventListener('click', () => {
          if (!item.is_dir) {
            promptInput.value = `@read_file: ${item.path} 파일을 분석하고 설명해줘`;
            adjustTextareaHeight();
            promptInput.focus();
          }
        });

        fileList.appendChild(div);
      });
      lucide.createIcons();
    } catch (e) {
      console.error(e);
      fileList.innerHTML = '<div class="text-xs text-rose-400 px-2 py-2">Failed to load files</div>';
    }
  }

  function getFileIcon(filename) {
    if (filename.endsWith('.py')) return 'file-code';
    if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'file-code-2';
    if (filename.endsWith('.html') || filename.endsWith('.css')) return 'file-code';
    if (filename.endsWith('.json') || filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'file-json';
    if (filename.endsWith('.md') || filename.endsWith('.txt')) return 'file-text';
    return 'file';
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  refreshFilesBtn.addEventListener('click', loadFiles);

  loadWorkspaceInfo();
  loadFiles();

  // 3. Quick Prompts
  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      promptInput.value = btn.textContent.trim().replace(/^[^\w가-힣]+/, '');
      adjustTextareaHeight();
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  // 4. Auto-resize Textarea
  function adjustTextareaHeight() {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
  }

  promptInput.addEventListener('input', adjustTextareaHeight);
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // 5. Clear Chat
  clearChatBtn.addEventListener('click', () => {
    if (confirm('대화 내용을 모두 초기화할까요?')) {
      conversationHistory = [];
      messagesContainer.innerHTML = '';
      messagesContainer.appendChild(welcomeHero);
      welcomeHero.classList.remove('hidden');
    }
  });

  // 6. Markdown Renderer Setup
  marked.setOptions({
    breaks: true,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (__) {}
      }
      return hljs.highlightAuto(code).value;
    }
  });

  // 7. Chat Submission & ReAct Agent Loop
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    const apiKey = getApiKey();
    if (!apiKey && !hasServerEnvKey) {
      apiKeyModal.classList.remove('hidden');
      return;
    }

    // Hide welcome hero
    welcomeHero.classList.add('hidden');

    // Add user message to UI
    appendUserMessage(prompt);
    conversationHistory.push({ role: 'user', content: prompt });

    // Reset input
    promptInput.value = '';
    adjustTextareaHeight();

    // UI state: Busy
    setAgentState(true, '에이전트 연결 중...');

    // Create assistant message container
    const assistantMsg = createAssistantMessageContainer();

    currentAbortController = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          api_key: apiKey,
          model: modelSelect.value,
          temperature: 0.2,
          max_turns: 12
        }),
        signal: currentAbortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace(/^data: /, '').trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);
              handleAgentEvent(event, assistantMsg, (newChunk) => {
                currentContent += newChunk;
              });
            } catch (err) {
              console.error('Failed to parse SSE data:', jsonStr, err);
            }
          }
        }
      }

      // Finalize assistant message
      if (currentContent) {
        conversationHistory.push({ role: 'assistant', content: currentContent });
      }

      // Refresh file list after agent finishes in case files were modified
      loadFiles();

    } catch (err) {
      if (err.name === 'AbortError') {
        assistantMsg.contentDiv.innerHTML += '<div class="text-xs text-amber-400 mt-2">*(작업이 사용자에 의해 중단되었습니다)*</div>';
      } else {
        assistantMsg.contentDiv.innerHTML += `<div class="text-xs text-rose-400 mt-2 bg-rose-500/10 p-3 rounded border border-rose-500/20">⚠️ 오류 발생: ${err.message}</div>`;
      }
    } finally {
      setAgentState(false);
      currentAbortController = null;
    }
  });

  // Stop Button
  stopBtn.addEventListener('click', () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
  });

  function setAgentState(isBusy, statusText = '') {
    if (isBusy) {
      sendBtn.disabled = true;
      sendBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      stopBtn.classList.add('flex');
      agentStatusBadge.classList.remove('hidden');
      agentStatusText.textContent = statusText;
    } else {
      sendBtn.disabled = false;
      sendBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
      stopBtn.classList.remove('flex');
      agentStatusBadge.classList.add('hidden');
    }
  }

  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'flex justify-end';
    div.innerHTML = `
      <div class="max-w-2xl bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-md leading-relaxed whitespace-pre-wrap">
        ${escapeHtml(text)}
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function createAssistantMessageContainer() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-start space-x-3 max-w-4xl';

    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
        <i data-lucide="bot" class="w-4 h-4 text-white"></i>
      </div>
      <div class="flex-1 space-y-2 overflow-hidden">
        <!-- Thinking Accordion -->
        <div class="thought-container hidden"></div>
        <!-- Tool Calls Accordion -->
        <div class="tools-container space-y-2"></div>
        <!-- Main Markdown Output -->
        <div class="content-container prose-content bg-dark-card border border-dark-border rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <div class="flex items-center space-x-2 text-xs text-gray-400">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Ox Alpha가 응답을 생성하는 중...</span>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(wrapper);
    lucide.createIcons();
    scrollToBottom();

    return {
      wrapper,
      thoughtDiv: wrapper.querySelector('.thought-container'),
      toolsDiv: wrapper.querySelector('.tools-container'),
      contentDiv: wrapper.querySelector('.content-container'),
      activeToolCards: {},
      rawMarkdown: ''
    };
  }

  function handleAgentEvent(event, msgCtx, onContentAppend) {
    if (event.type === 'step_start') {
      agentStatusText.textContent = `[Turn ${event.turn}] 에이전트 자율 작업 수행 중...`;
    } 
    else if (event.type === 'thought') {
      msgCtx.thoughtDiv.classList.remove('hidden');
      msgCtx.thoughtDiv.innerHTML = `
        <div class="thought-card flex items-start space-x-2">
          <i data-lucide="brain-circuit" class="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5"></i>
          <div class="text-xs text-indigo-200 leading-relaxed font-mono whitespace-pre-wrap">${escapeHtml(event.content)}</div>
        </div>
      `;
      lucide.createIcons();
      scrollToBottom();
    }
    else if (event.type === 'tool_call') {
      agentStatusText.textContent = `⚡ 도구 실행 중: ${event.name}...`;
      
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <div class="tool-card-header text-amber-300 flex items-center justify-between">
          <div class="flex items-center space-x-2 truncate">
            <i data-lucide="cog" class="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0"></i>
            <span class="font-bold">${event.name}</span>
            <span class="text-gray-400 text-[11px] truncate font-normal">${JSON.stringify(event.args)}</span>
          </div>
          <span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">실행 중</span>
        </div>
        <div class="tool-card-content hidden font-mono text-[11px] text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-60">
          <div class="text-gray-500">Executing...</div>
        </div>
      `;
      
      // Toggle accordion on click
      card.querySelector('.tool-card-header').addEventListener('click', () => {
        card.querySelector('.tool-card-content').classList.toggle('hidden');
      });

      msgCtx.toolsDiv.appendChild(card);
      msgCtx.activeToolCards[event.id] = card;
      lucide.createIcons();
      scrollToBottom();
    }
    else if (event.type === 'tool_result') {
      const card = msgCtx.activeToolCards[event.id];
      if (card) {
        const header = card.querySelector('.tool-card-header');
        header.querySelector('i').replaceWith(createLucideIcon('check-circle', 'w-3.5 h-3.5 text-emerald-400 flex-shrink-0'));
        header.querySelector('span:last-child').className = 'text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30';
        header.querySelector('span:last-child').textContent = '완료';

        const content = card.querySelector('.tool-card-content');
        content.classList.remove('hidden');
        content.textContent = event.result;
      }
      scrollToBottom();
    }
    else if (event.type === 'content_chunk') {
      msgCtx.rawMarkdown += event.content;
      onContentAppend(event.content);
      renderMarkdown(msgCtx.contentDiv, msgCtx.rawMarkdown);
      scrollToBottom();
    }
    else if (event.type === 'error') {
      const errBox = document.createElement('div');
      errBox.className = 'text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 my-2';
      errBox.textContent = `⚠️ ${event.message}`;
      msgCtx.contentDiv.appendChild(errBox);
      scrollToBottom();
    }
  }

  function renderMarkdown(container, markdown) {
    container.innerHTML = marked.parse(markdown);
    
    // Add Copy buttons to code blocks
    container.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
      
      const pre = block.parentElement;
      if (!pre.parentElement.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        const header = document.createElement('div');
        header.className = 'code-block-header';
        
        const lang = block.className.match(/language-(\w+)/)?.[1] || 'code';
        header.innerHTML = `
          <span class="font-mono">${lang}</span>
          <button class="copy-btn">복사</button>
        `;
        
        header.querySelector('.copy-btn').addEventListener('click', (e) => {
          navigator.clipboard.writeText(block.innerText);
          e.target.textContent = '복사됨!';
          setTimeout(() => { e.target.textContent = '복사'; }, 2000);
        });

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
      }
    });
  }

  function createLucideIcon(name, classes) {
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.className = classes;
    setTimeout(() => lucide.createIcons(), 0);
    return i;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
