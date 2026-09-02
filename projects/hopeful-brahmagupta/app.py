import os
import sys
import json
import subprocess
import asyncio
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, AsyncGenerator

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="Ox Alpha Agent Studio", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Workspace base directory (default to current directory where server is run)
WORKSPACE_DIR = Path(os.getcwd()).resolve()

# Tool definitions in OpenAI format
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the contents of a file in the workspace. You can optionally specify start_line and end_line (1-indexed).",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Relative path to the file from workspace root."
                    },
                    "start_line": {
                        "type": "integer",
                        "description": "Optional starting line number (1-indexed, inclusive)."
                    },
                    "end_line": {
                        "type": "integer",
                        "description": "Optional ending line number (1-indexed, inclusive)."
                    }
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Create a new file or overwrite an existing file with the provided content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Relative path to the file from workspace root."
                    },
                    "content": {
                        "type": "string",
                        "description": "The exact full text content to write into the file."
                    }
                },
                "required": ["path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "replace_file_content",
            "description": "Replace a specific unique contiguous block of text in an existing file with new content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Relative path to the file from workspace root."
                    },
                    "target": {
                        "type": "string",
                        "description": "The exact character-for-character string in the file to be replaced."
                    },
                    "replacement": {
                        "type": "string",
                        "description": "The replacement string to put in place of target."
                    }
                },
                "required": ["path", "target", "replacement"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_dir",
            "description": "List files and subdirectories in a given workspace directory path.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Relative directory path to list. Use '.' or empty string for workspace root."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_code",
            "description": "Search for a text pattern or keyword across files in the workspace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search term or regex pattern to search for."
                    },
                    "extension": {
                        "type": "string",
                        "description": "Optional file extension filter (e.g. '.py', '.js', '.html')."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Execute a terminal shell command (PowerShell / CMD on Windows) in the workspace directory and get stdout/stderr.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The exact command line string to run."
                    }
                },
                "required": ["command"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are Ox Alpha Agent, an elite, autonomous software engineering and problem-solving AI agent.
You operate directly inside the user's workspace with real local tool execution capabilities.

Your core capabilities:
1. `read_file`: Inspect files, understand architecture, and check code.
2. `write_file`: Create new scripts, HTML/JS/CSS files, modules, and documentation.
3. `replace_file_content`: Perform precise, targeted edits on existing code.
4. `list_dir`: Explore directory structure and discover files.
5. `search_code`: Search across files for symbols, function definitions, or patterns.
6. `run_command`: Execute shell commands (e.g., run scripts, test code, install packages, check system status).

Workflow Guidelines:
- Act autonomously: When asked to build, modify, or debug something, inspect the workspace, write or modify the files, run commands to verify they work, and then report the results.
- Always verify your work: If you write a script or build an app, run or test it using `run_command` if applicable.
- Keep tool arguments clean, precise, and properly escaped.
- When done, summarize what you accomplished clearly in markdown with code blocks where appropriate.
- Respond in Korean or the user's requested language.
"""

def resolve_path(rel_path: str) -> Path:
    clean = rel_path.strip().lstrip("/\\")
    if not clean or clean == ".":
        return WORKSPACE_DIR
    target = (WORKSPACE_DIR / clean).resolve()
    if not str(target).startswith(str(WORKSPACE_DIR)):
        raise ValueError(f"Access denied: path '{rel_path}' is outside workspace.")
    return target

# Tool Execution Logic
async def execute_tool(name: str, args: Dict[str, Any]) -> str:
    try:
        if name == "read_file":
            path = resolve_path(args.get("path", ""))
            if not path.is_file():
                return f"Error: File '{args.get('path')}' does not exist or is not a file."
            
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
                
            start = args.get("start_line")
            end = args.get("end_line")
            
            total_lines = len(lines)
            s_idx = max(0, start - 1) if start else 0
            e_idx = min(total_lines, end) if end else total_lines
            
            selected = lines[s_idx:e_idx]
            result = []
            for idx, line in enumerate(selected, start=s_idx + 1):
                result.append(f"{idx:4d} | {line}")
            return "".join(result) if result else "(Empty file)"

        elif name == "write_file":
            path = resolve_path(args.get("path", ""))
            content = args.get("content", "")
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            return f"Successfully wrote {len(content)} characters to {args.get('path')}."

        elif name == "replace_file_content":
            path = resolve_path(args.get("path", ""))
            if not path.is_file():
                return f"Error: File '{args.get('path')}' not found."
            
            target = args.get("target", "")
            replacement = args.get("replacement", "")
            
            with open(path, "r", encoding="utf-8") as f:
                data = f.read()
                
            if target not in data:
                return f"Error: Target content not found in {args.get('path')}. Make sure whitespace and line breaks match exactly."
            
            count = data.count(target)
            if count > 1:
                return f"Error: Target content appears {count} times in the file. Provide a more specific surrounding context."
                
            new_data = data.replace(target, replacement, 1)
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_data)
            return f"Successfully replaced target content in {args.get('path')}."

        elif name == "list_dir":
            path = resolve_path(args.get("path", "."))
            if not path.is_dir():
                return f"Error: Directory '{args.get('path')}' not found."
            
            items = []
            for entry in sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
                prefix = "[DIR] " if entry.is_dir() else "[FILE]"
                size = f" ({entry.stat().st_size:,} bytes)" if entry.is_file() else ""
                rel = entry.relative_to(WORKSPACE_DIR)
                items.append(f"{prefix} {rel}{size}")
            return "\n".join(items) if items else "(Empty directory)"

        elif name == "search_code":
            query = args.get("query", "")
            ext = args.get("extension", "")
            if not query:
                return "Error: query cannot be empty."
            
            matches = []
            regex = re.compile(query, re.IGNORECASE)
            
            for root, _, files in os.walk(WORKSPACE_DIR):
                if ".git" in root or "__pycache__" in root or "node_modules" in root:
                    continue
                for file in files:
                    if ext and not file.endswith(ext):
                        continue
                    file_path = Path(root) / file
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            for idx, line in enumerate(f, start=1):
                                if regex.search(line):
                                    rel = file_path.relative_to(WORKSPACE_DIR)
                                    matches.append(f"{rel}:{idx}: {line.strip()[:200]}")
                                    if len(matches) >= 50:
                                        matches.append("... (Matches capped at 50)")
                                        return "\n".join(matches)
                    except Exception:
                        pass
            return "\n".join(matches) if matches else f"No matches found for '{query}'."

        elif name == "run_command":
            cmd = args.get("command", "")
            if not cmd:
                return "Error: command cannot be empty."
            
            # Run using default shell on current OS
            proc = await asyncio.create_subprocess_shell(
                cmd,
                cwd=str(WORKSPACE_DIR),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                shell=True
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=45.0)
                out_str = stdout.decode("utf-8", errors="replace").strip()
                err_str = stderr.decode("utf-8", errors="replace").strip()
                
                res = []
                if out_str:
                    res.append(f"STDOUT:\n{out_str}")
                if err_str:
                    res.append(f"STDERR:\n{err_str}")
                res.append(f"Exit Code: {proc.returncode}")
                return "\n".join(res)
            except asyncio.TimeoutError:
                proc.kill()
                return "Error: Command timed out after 45 seconds."

        else:
            return f"Error: Unknown tool '{name}'."

    except Exception as e:
        return f"Tool Execution Exception: {str(e)}"

def get_env_api_key() -> str:
    if os.environ.get("OPENROUTER_API_KEY"):
        return os.environ.get("OPENROUTER_API_KEY").strip()
    env_file = WORKSPACE_DIR / ".env"
    if env_file.is_file():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("OPENROUTER_API_KEY="):
                        return line.split("=", 1)[1].strip()
        except Exception:
            pass
    return ""

class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = ""

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    api_key: Optional[str] = ""
    model: Optional[str] = "stealth/ox-alpha"
    temperature: Optional[float] = 0.2
    max_turns: Optional[int] = 12

@app.get("/api/workspace")
async def get_workspace():
    has_key = bool(get_env_api_key())
    return {
        "workspace_dir": str(WORKSPACE_DIR),
        "os": sys.platform,
        "default_model": "stealth/ox-alpha",
        "has_env_key": has_key
    }

@app.get("/api/files")
async def get_files(path: str = "."):
    try:
        target = resolve_path(path)
        if not target.is_dir():
            raise HTTPException(status_code=400, detail="Not a directory")
        
        items = []
        for p in sorted(target.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
            if p.name.startswith(".") and p.name != ".env":
                continue
            items.append({
                "name": p.name,
                "is_dir": p.is_dir(),
                "path": str(p.relative_to(WORKSPACE_DIR)).replace("\\", "/"),
                "size": p.stat().st_size if p.is_file() else None
            })
        return {"current": str(target.relative_to(WORKSPACE_DIR)).replace("\\", "/"), "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    active_key = req.api_key.strip() if req.api_key else get_env_api_key()
    if not active_key:
        raise HTTPException(status_code=400, detail="OpenRouter API Key is required.")

    async def event_generator() -> AsyncGenerator[str, None]:
        client = httpx.AsyncClient(timeout=120.0)
        
        # Build conversation history
        conversation = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in req.messages:
            conversation.append(m)

        turn = 0
        max_turns = req.max_turns or 12

        try:
            while turn < max_turns:
                turn += 1
                
                payload = {
                    "model": req.model or "stealth/ox-alpha",
                    "messages": conversation,
                    "tools": TOOLS,
                    "temperature": req.temperature,
                    "stream": False # Use non-stream for reliable tool calling parsing
                }
                
                headers = {
                    "Authorization": f"Bearer {active_key}",
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "Ox Alpha Agent Studio",
                    "Content-Type": "application/json"
                }

                # Yield turn start event
                yield f"data: {json.dumps({'type': 'step_start', 'turn': turn})}\n\n"

                res = await client.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
                
                if res.status_code != 200:
                    err_msg = res.text
                    try:
                        err_json = res.json()
                        err_msg = err_json.get("error", {}).get("message", res.text)
                    except Exception:
                        pass
                    yield f"data: {json.dumps({'type': 'error', 'message': f'OpenRouter API Error ({res.status_code}): {err_msg}'})}\n\n"
                    break

                data = res.json()
                choice = data["choices"][0]
                message = choice["message"]
                
                # Check for reasoning / thoughts if returned by provider
                reasoning = message.get("reasoning") or message.get("thought")
                if reasoning:
                    yield f"data: {json.dumps({'type': 'thought', 'content': reasoning})}\n\n"

                content = message.get("content") or ""
                if content:
                    yield f"data: {json.dumps({'type': 'content_chunk', 'content': content})}\n\n"

                # Check for tool calls
                tool_calls = message.get("tool_calls", [])
                
                if not tool_calls:
                    # Agent completed turn without more tool calls
                    yield f"data: {json.dumps({'type': 'done', 'final': True})}\n\n"
                    break

                # Add assistant message with tool calls to conversation
                conversation.append(message)

                # Process all tool calls
                for tc in tool_calls:
                    fn_id = tc.get("id", "call_default")
                    fn_name = tc.get("function", {}).get("name", "")
                    raw_args = tc.get("function", {}).get("arguments", "{}")
                    
                    try:
                        parsed_args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
                    except Exception:
                        parsed_args = {}

                    # Notify frontend tool started
                    yield f"data: {json.dumps({'type': 'tool_call', 'id': fn_id, 'name': fn_name, 'args': parsed_args})}\n\n"

                    # Execute the tool locally
                    tool_output = await execute_tool(fn_name, parsed_args)

                    # Notify frontend tool result
                    yield f"data: {json.dumps({'type': 'tool_result', 'id': fn_id, 'name': fn_name, 'result': tool_output})}\n\n"

                    # Add tool response to conversation
                    conversation.append({
                        "role": "tool",
                        "tool_call_id": fn_id,
                        "name": fn_name,
                        "content": str(tool_output)
                    })

            if turn >= max_turns:
                yield f"data: {json.dumps({'type': 'content_chunk', 'content': '\n\n*(Max autonomous turns reached)*'})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'final': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Server Error: {str(e)}'})}\n\n"
        finally:
            await client.aclose()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Mount static directory for frontend
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
