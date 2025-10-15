#!/usr/bin/env python3
"""
🔬 NanoResearcher - Micro Research Agent
Connects to NanoCoordinator for distributed research tasks
"""

import asyncio
import json
import websockets
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('NanoResearcher')

async def nano_researcher():
    """Simple research agent that connects to coordinator"""
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        logger.info("🔬 NanoResearcher connected to coordinator")
        
        # Send research actions
        actions = [
            "search: quantum computing",
            "search: AI agents",
            "search: topology networks",
            "analyze: research papers",
            "synthesize: findings"
        ]
        
        # Listen for other agents
        async def listen():
            async for message in websocket:
                data = json.loads(message)
                logger.info(f"📨 Received from {data['from']}: {data['relay']}")
        
        # Send messages
        async def send():
            for i, action in enumerate(actions):
                message = json.dumps({
                    "agent": "NanoResearcher",
                    "action": action
                })
                await websocket.send(message)
                logger.info(f"📤 Sent: {action}")
                await asyncio.sleep(2)
        
        # Run both tasks
        await asyncio.gather(listen(), send())

if __name__ == '__main__':
    asyncio.run(nano_researcher())

