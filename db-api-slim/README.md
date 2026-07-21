# DB-API (slim)

## Instalação (Linux)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Executar
uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
