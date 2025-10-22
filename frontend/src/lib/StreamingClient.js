/**
 * Frontend client for consuming streaming agent responses
 * Example using EventSource (Server-Sent Events)
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

/**
 * StreamingClient - Handle SSE connections from frontend
 */
export class StreamingClient {
  constructor(baseURL = '/api/agents') {
    this.baseURL = baseURL;
    this.eventSource = null;
    this.handlers = {
      connected: [],
      token: [],
      chunk: [],
      progress: [],
      status: [],
      error: [],
      complete: [],
      close: [],
    };
  }

  /**
   * Start streaming
   */
  connect(endpoint, params = {}) {
    // Build URL with query params
    const url = new URL(this.baseURL + endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Close existing connection
    this.disconnect();

    // Create EventSource
    this.eventSource = new EventSource(url.toString());

    // Setup event listeners
    Object.keys(this.handlers).forEach(event => {
      this.eventSource.addEventListener(event, e => {
        const data = JSON.parse(e.data);
        this.emit(event, data);
      });
    });

    // Handle errors
    this.eventSource.onerror = error => {
      console.error('[StreamingClient] Connection error:', error);
      this.emit('error', { error: 'Connection failed' });
      this.disconnect();
    };

    return this;
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
    return this;
  }

  /**
   * Emit event to handlers
   */
  emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(data));
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }
}

/**
 * React Hook for streaming
 */
export function useStreaming(endpoint, params = {}) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState('idle');
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  const clientRef = React.useRef(null);

  const start = React.useCallback(() => {
    setContent('');
    setProgress(0);
    setStatus('connecting');
    setError(null);
    setResult(null);

    const client = new StreamingClient();
    clientRef.current = client;

    client
      .on('connected', () => {
        setIsConnected(true);
        setStatus('connected');
      })
      .on('token', data => {
        setContent(prev => prev + data.token);
      })
      .on('chunk', data => {
        setContent(prev => prev + data.chunk);
      })
      .on('progress', data => {
        setProgress(data.progress);
      })
      .on('status', data => {
        setStatus(data.status);
      })
      .on('error', data => {
        setError(data.error);
        setStatus('error');
      })
      .on('complete', data => {
        setResult(data);
        setStatus('complete');
        setProgress(100);
      })
      .on('close', () => {
        setIsConnected(false);
      })
      .connect(endpoint, params);
  }, [endpoint, params]);

  const stop = React.useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setIsConnected(false);
      setStatus('stopped');
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    content,
    progress,
    status,
    error,
    result,
    start,
    stop,
  };
}

/**
 * Example: Streaming Blog Post Component
 */
export function StreamingBlogPost({ topic, tone, length }) {
  const { isConnected, content, progress, status, error, start, stop } =
    useStreaming('/content/stream/blog', {
      topic,
      tone,
      length,
    });

  return (
    <div className="streaming-blog-post">
      <div className="controls">
        <button onClick={start} disabled={isConnected}>
          Generate Blog Post
        </button>
        <button onClick={stop} disabled={!isConnected}>
          Stop
        </button>
      </div>

      {status && <div className="status">Status: {status}</div>}

      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {error && <div className="error">Error: {error}</div>}

      {content && (
        <div className="content">
          <div className="markdown-preview">{content}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Streaming Itinerary Component
 */
export function StreamingItinerary({ destination, days, budget }) {
  const { isConnected, progress, status, error, result, start, stop } =
    useStreaming('/travel/stream/itinerary', {
      destination,
      days,
      budget,
    });

  return (
    <div className="streaming-itinerary">
      <div className="controls">
        <button onClick={start} disabled={isConnected}>
          Generate Itinerary
        </button>
        <button onClick={stop} disabled={!isConnected}>
          Stop
        </button>
      </div>

      {status && status !== 'idle' && (
        <div className="status-message">
          {status === 'researching' && '🔍 Researching destination...'}
          {status === 'generating' && '✨ Creating itinerary...'}
          {status === 'complete' && '✅ Complete!'}
        </div>
      )}

      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && result.itinerary && (
        <div className="itinerary-result">
          <h3>Your Itinerary</h3>
          {result.itinerary.days?.map((day, index) => (
            <div key={index} className="day">
              <h4>Day {day.day}</h4>
              <p>{day.description}</p>
              {day.activities && (
                <ul>
                  {day.activities.map((activity, i) => (
                    <li key={i}>{activity}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Manual streaming control
 */
export function ManualStreamingExample() {
  const [messages, setMessages] = React.useState([]);
  const [client, setClient] = React.useState(null);

  const startStream = () => {
    const streamClient = new StreamingClient();

    streamClient
      .on('connected', data => {
        addMessage('Connected', data);
      })
      .on('token', data => {
        addMessage('Token', data);
      })
      .on('chunk', data => {
        addMessage('Chunk', data);
      })
      .on('progress', data => {
        addMessage('Progress', data);
      })
      .on('status', data => {
        addMessage('Status', data);
      })
      .on('error', data => {
        addMessage('Error', data);
      })
      .on('complete', data => {
        addMessage('Complete', data);
      })
      .connect('/content/stream/social', {
        topic: 'AI Travel Planning',
        platforms: 'twitter,linkedin,instagram',
      });

    setClient(streamClient);
  };

  const stopStream = () => {
    if (client) {
      client.disconnect();
      setClient(null);
    }
  };

  const addMessage = (type, data) => {
    setMessages(prev => [
      ...prev,
      {
        type,
        data,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="manual-streaming">
      <div className="controls">
        <button onClick={startStream} disabled={client}>
          Start Stream
        </button>
        <button onClick={stopStream} disabled={!client}>
          Stop Stream
        </button>
        <button onClick={() => setMessages([])}>Clear Messages</button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message message-${msg.type.toLowerCase()}`}
          >
            <span className="type">[{msg.type}]</span>
            <span className="data">{JSON.stringify(msg.data, null, 2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Vanilla JavaScript usage
 */
export function vanillaJSExample() {
  const client = new StreamingClient();

  client
    .on('connected', data => {
      console.log('Connected:', data);
    })
    .on('chunk', data => {
      document.getElementById('output').textContent += data.chunk;
    })
    .on('progress', data => {
      document.getElementById('progress').style.width = `${data.progress}%`;
    })
    .on('complete', data => {
      console.log('Complete:', data);
      alert('Generation complete!');
    })
    .on('error', data => {
      console.error('Error:', data);
      alert('Error: ' + data.error);
    })
    .connect('/content/stream/blog', {
      topic: 'AI in Travel',
      tone: 'professional',
      length: 'medium',
    });

  // Later: disconnect
  // client.disconnect();
}
