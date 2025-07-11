from contextlib import contextmanager
import json
import os
import threading
from fastapi import FastAPI, HTTPException, Response
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Union
import uvicorn
from fastapi.responses import Response, JSONResponse
import json

# File path for persistent storage
MOCK_SETTINGS_FILE = "configure-mock.json"
file_lock = threading.Lock()

# In-memory storage for mock settings
mock_settings_storage: List[Dict[str, Any]] = []
mock_id= 1

@contextmanager
def file_operation_lock():
    """Context manager for thread-safe file operations."""
    file_lock.acquire()
    try:
        yield
    finally:
        file_lock.release()

def save_mock_settings_to_file():
    """
    Save the current in-memory mock settings to JSON file.
    Thread-safe operation with error handling.
    """
    try:
        with file_operation_lock():
            with open(MOCK_SETTINGS_FILE, 'w', encoding='utf-8') as file:
                json.dump(mock_settings_storage, file, indent=2, ensure_ascii=False)
        print(f"Successfully saved {len(mock_settings_storage)} mock settings to {MOCK_SETTINGS_FILE}")
    except Exception as e:
        print(f"Error saving mock settings to file: {str(e)}")
        raise

def load_mock_settings_from_file():
    """
    Load mock settings from JSON file into memory.
    Creates file if it doesn't exist.
    """
    global mock_settings_storage
    global mock_id
    try:
        if os.path.exists(MOCK_SETTINGS_FILE):
            with file_operation_lock():
                with open(MOCK_SETTINGS_FILE, 'r', encoding='utf-8') as file:
                    loaded_settings = json.load(file)
                    mock_settings_storage = loaded_settings
            print(f"Successfully loaded {len(mock_settings_storage)} mock settings from {MOCK_SETTINGS_FILE}")
        else:
            # Create empty file if it doesn't exist
            mock_settings_storage = []
            save_mock_settings_to_file()
            print(f"Created new {MOCK_SETTINGS_FILE} file")
        if mock_settings_storage:
            max_id = max(mock.get("id", 0) for mock in mock_settings_storage)
            mock_id = max_id + 1
        else:
            mock_id = 1
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file: {str(e)}. Starting with empty storage.")
        mock_settings_storage = []
        save_mock_settings_to_file()
    except Exception as e:
        print(f"Error loading mock settings from file: {str(e)}. Starting with empty storage.")
        mock_settings_storage = []

def remove_mock_setting_from_storage(settings_id: int):
    """
    Remove a mock setting from both memory and file.
    """
    global mock_settings_storage
    
    if settings_id < 0 or settings_id >= len(mock_settings_storage):
        raise ValueError("Invalid settings ID")
    
    # Remove from memory
    removed_setting = mock_settings_storage.pop(settings_id)
    
    # Save updated list to file
    save_mock_settings_to_file()
    
    return removed_setting

app = FastAPI(title="Mock Settings API", version="1.0.0")

class MockSettings(BaseModel):
    ruta: str = Field(..., description="API route path")
    metodo: str = Field(..., description="HTTP method")
    parametros_url: Dict[str, Any] = Field(default_factory=dict, description="URL parameters")
    parametros_body: Dict[str, Any] = Field(default_factory=dict, description="Body parameters")
    headers: Dict[str, Any] = Field(default_factory=dict, description="HTTP headers")
    codigo_estado: int = Field(..., ge=100, le=599, description="HTTP status code")
    contenido_respuesta: Union[Dict[str, Any], str] = Field(..., description="Response content")
    content_type: str = Field(default="application/json", description="Content type")

    class Config:
        json_schema_extra = {
            "example": {
                "ruta": "/api/saludo",
                "metodo": "GET",
                "parametros_url": {},
                "parametros_body": {},
                "headers": {},
                "codigo_estado": 200,
                "contenido_respuesta": {
                    "mensaje": "Hola desde el mock"
                },
                "content_type": "application/json"
            }
        }
@app.on_event("startup")
async def startup_event():
    """Load mock settings from file on startup."""
    load_mock_settings_from_file()

@app.post("/configure-mock", status_code=201)

async def create_mock_settings(settings: MockSettings):
    """
    Create and store mock settings for API endpoints.
    
    Accepts a JSON payload with mock configuration and stores it in memory.
    """
    global mock_id
    try:
        # Check if the settings already exist
        for mock in mock_settings_storage:
            if (mock["ruta"] == settings.ruta and
                mock["metodo"].upper() == settings.metodo.upper()):
                raise HTTPException(
                    status_code=400,
                    detail="Mock with this rute and method already exist"
                )
        # Convert Pydantic model to dictionary and store
        settings_dict = settings.model_dump()

        settings_dict["id"] = mock_id
        mock_id += 1

        mock_settings_storage.append(settings_dict)
        save_mock_settings_to_file()
        
        return {
            "success": True,
            "message": "Mock settings saved successfully",
            "settings_id": settings_dict["id"],
            "total_settings": len(mock_settings_storage)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving mock settings: {str(e)}"
        )
@app.get("/configure-mock/{mock_id}")
async def get_mock_settings(mock_id: int):
    """
    Retrieve specific mock settings by ID.
    """
    for mock in mock_settings_storage:
        if mock.get("id") == mock_id:
            return {
                "success": True,
                "settings": mock
            }

    raise HTTPException(
        status_code=404,
        detail="Mock settings not found"
    )
    

@app.get("/configure-mock")
async def get_all_mock_settings():
    """
    Retrieve all stored mock settings.
    """
    return {
        "success": True,
        "total_settings": len(mock_settings_storage),
        "settings": mock_settings_storage
    }

@app.delete("/configure-mock/{mock_id}")
async def delete_mock_by_id(mock_id: int):
    global mock_settings_storage
    for i, mock in enumerate(mock_settings_storage):
        if mock.get("id") == mock_id:
            mock_settings_storage.pop(i)
            save_mock_settings_to_file()
            return {"success": True, "message": f"Mock with ID {mock_id} deleted."}
    return {"success": False, "message": f"Mock with ID {mock_id} not found."}


@app.get("/")
async def root():
    
    return {
        "message": "Mock Settings API",
        "version": "1.0.0",
        "endpoints": {
            "POST /configure-mock": "Create new mock settings",
            "GET /configure-mock": "Get all mock settings",
            "GET /configure-mock/{id}": "Get specific mock settings",
            "DELETE /configure-mock": "Clear all mock settings"
        },
        "total_stored_settings": len(mock_settings_storage)
    }



@app.delete("/configure-mock")
async def clear_all_mock_settings():
    """
    Clear all stored mock settings from both memory and file.
    """
    global mock_settings_storage
    cleared_count = len(mock_settings_storage)
    mock_settings_storage.clear()
    
    # Save empty list to file
    save_mock_settings_to_file()
    
    return {
        "success": True,
        "message": f"Cleared {cleared_count} mock settings from memory and file",
        "total_settings": len(mock_settings_storage)
    }

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def manejar_mock(path: str, request: Request):
    ruta_solicitada = "/" + path
    metodo_solicitado = request.method.upper()

    body = {}
    try:
        if request.headers.get("content-type", "").startswith("application/json"):
            body = await request.json()
    except:
        pass

    headers = dict(request.headers)
    query_params = dict(request.query_params)


    for mock in mock_settings_storage:
        if (
            mock["ruta"] == ruta_solicitada
            and isinstance(mock["metodo"], str) and mock["metodo"].upper() == metodo_solicitado
        ):
            contenido = mock["contenido_respuesta"]

            if isinstance(contenido, dict) and "condiciones" in contenido:
                condiciones = contenido["condiciones"]
                respuesta_por_defecto = contenido.get("default", {})

                for condicion in condiciones:
                    criterios = condicion.get("si", {})
                    coincide = True
                    for clave, valor_esperado in criterios.items():
                        if not (
                            query_params.get(clave) == valor_esperado or
                            body.get(clave) == valor_esperado or
                            headers.get(clave) == valor_esperado
                        ):
                            coincide = False
                            break
                    if coincide:
                        return Response(
                            content=json.dumps(condicion["respuesta"]),
                            status_code=mock["codigo_estado"],
                            media_type=mock["content_type"]
                        )

                
                return Response(
                    content=json.dumps(respuesta_por_defecto),
                    status_code=mock["codigo_estado"],
                    media_type=mock["content_type"]
                )

            contenido_str = contenido if isinstance(contenido, str) else json.dumps(contenido)
            return Response(
                content=contenido_str,
                status_code=mock["codigo_estado"],
                media_type=mock["content_type"]
            )

    return JSONResponse(status_code=404, content={"detalle": "Mock no encontrado"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
