import { Message, Role } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const streamResponse = async (
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> => {
  
  // Filter out empty messages or messages that are currently streaming (the placeholder)
  // and map to the format backend expects
  const apiMessages = messages
    .filter(m => !m.isStreaming && m.content.trim() !== '')
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // Add token here if you implement real auth middleware
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunkValue = decoder.decode(value, { stream: true }); // stream: true handles multi-byte chars correctly across chunks
        onChunk(chunkValue);
      }
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    onChunk("\n[Connection Error: Ensure backend is running at http://localhost:8000]");
    throw error;
  }
};
