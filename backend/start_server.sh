#!/bin/bash
cd /home/wiltord/Desktop/playground/port-cyber/backend
source venv/bin/activate
export PYTHONPATH=/home/wiltord/Desktop/playground/port-cyber/backend
uvicorn main:app --host 0.0.0.0 --port 8000
