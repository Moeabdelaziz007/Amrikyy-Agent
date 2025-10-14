#!/usr/bin/env python3
"""
📊 NanoAnalyst - Micro Analysis Agent
Connects to NanoCoordinator for distributed analysis tasks
"""

import asyncio
import json
import websockets
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('NanoAnalyst')

async def nano_analyst():
    """Simple analysis agent that connects to coordinator"""
    uri = "ws://localhost:8765"
    
    async with websockets.connect(uri) as websocket:
        logger.info("📊 NanoAnalyst connected to coordinator")
        
        # Send analysis actions
        actions = [
            "analyze: user behavior patterns",
            "analyze: travel trends",
            "calculate: budget optimization",
            "detect: anomalies",
            "generate: insights report"
        ]
        
        # Listen for other agents
        async def listen():
            async for message in websocket:
                data = json.loads(message)
                logger.info(f"📨 Received from {data['from']}: {data['relay']}")
                
                # React to research findings
                if "research" in data['relay'].lower():
                    response = json.dumps({
                        "agent": "NanoAnalyst",
                        "action": f"analyzing: {data['relay']}"
                    })
                    await websocket.send(response)
        
        # Send messages
        async def send():
            await asyncio.sleep(1)  # Start after researcher
            for action in actions:
                message = json.dumps({
                    "agent": "NanoAnalyst",
                    "action": action
                })
                await websocket.send(message)
                logger.info(f"📤 Sent: {action}")
                await asyncio.sleep(3)
        
        # Run both tasks
        await asyncio.gather(listen(), send())

if __name__ == '__main__':
    asyncio.run(nano_analyst())

