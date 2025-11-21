# GeminiGPT Backend

This is a FastAPI backend for the GeminiGPT clone.

## Setup

1.  **Install Python Dependencies**:
    Make sure you have Python installed, then run:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Set your Google Gemini API Key**:
    You need an API key from Google AI Studio.
    
    **Mac/Linux**:
    ```bash
    export API_KEY=your_api_key_here
    ```

    **Windows (CMD)**:
    ```cmd
    set API_KEY=your_api_key_here
    ```

    **Windows (PowerShell)**:
    ```powershell
    $env:API_KEY="your_api_key_here"
    ```

3.  **Run the Server**:
    ```bash
    python main.py
    ```
    The server will start at `http://localhost:8000`.

## Endpoints

*   `POST /api/login`: Returns a mock user and token.
*   `POST /api/chat`: Streams a response from the Gemini API.
