import pytest
import json
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, mock_open
import sys
import tempfile

# Add the parent directory to the path to import the main module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, mock_settings_storage, MOCK_SETTINGS_FILE

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Setup and teardown for each test"""
    # Clear the mock storage before each test
    global mock_settings_storage
    mock_settings_storage.clear()
    
    # Create a temporary file for testing
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        json.dump([], f)
        temp_file = f.name
    
    # Patch the MOCK_SETTINGS_FILE to use temp file
    with patch('main.MOCK_SETTINGS_FILE', temp_file):
        yield
    
    # Cleanup
    try:
        os.unlink(temp_file)
    except FileNotFoundError:
        pass

class TestConfigureMockEndpoints:
    """Test cases for /configure-mock endpoints"""
    
    def test_create_mock_success(self):
        """Test successful mock creation"""
        mock_data = {
            "ruta": "/api/test",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "test response"},
            "content_type": "application/json"
        }
        
        response = client.post("/configure-mock", json=mock_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Mock settings saved successfully"
        assert "settings_id" in data
        assert data["total_settings"] == 1

    def test_create_mock_duplicate_error(self):
        """Test duplicate mock creation returns error"""
        mock_data = {
            "ruta": "/api/duplicate",
            "metodo": "POST",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "first"},
            "content_type": "application/json"
        }
        
        # Create first mock
        response1 = client.post("/configure-mock", json=mock_data)
        assert response1.status_code == 201
        
        # Try to create duplicate
        response2 = client.post("/configure-mock", json=mock_data)
        assert response2.status_code == 400
        data = response2.json()
        assert "already exist" in data["detail"]

    def test_create_mock_case_insensitive_method(self):
        """Test that HTTP methods are case insensitive for duplicates"""
        mock_data_1 = {
            "ruta": "/api/case-test",
            "metodo": "get",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "first"},
            "content_type": "application/json"
        }
        
        mock_data_2 = {
            "ruta": "/api/case-test",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "second"},
            "content_type": "application/json"
        }
        
        # Create first mock
        response1 = client.post("/configure-mock", json=mock_data_1)
        assert response1.status_code == 201
        
        # Try to create duplicate with different case
        response2 = client.post("/configure-mock", json=mock_data_2)
        assert response2.status_code == 400

    def test_create_mock_invalid_status_code(self):
        """Test mock creation with invalid status code"""
        mock_data = {
            "ruta": "/api/invalid",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 999,  # Invalid status code
            "contenido_respuesta": {"message": "test"},
            "content_type": "application/json"
        }
        
        response = client.post("/configure-mock", json=mock_data)
        assert response.status_code == 422  # Validation error

    def test_create_mock_missing_required_fields(self):
        """Test mock creation with missing required fields"""
        mock_data = {
            "metodo": "GET",
            # Missing ruta
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "test"},
        }
        
        response = client.post("/configure-mock", json=mock_data)
        assert response.status_code == 422

    def test_get_all_mocks_empty(self):
        """Test getting all mocks when none exist"""
        response = client.get("/configure-mock")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_settings"] == 0
        assert data["settings"] == []

    def test_get_all_mocks_with_data(self):
        """Test getting all mocks when some exist"""
        # Create a mock first
        mock_data = {
            "ruta": "/api/test",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "test"},
            "content_type": "application/json"
        }
        
        client.post("/configure-mock", json=mock_data)
        
        response = client.get("/configure-mock")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_settings"] == 1
        assert len(data["settings"]) == 1

    def test_get_mock_by_id_success(self):
        """Test getting a specific mock by ID"""
        # Create a mock first
        mock_data = {
            "ruta": "/api/test",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "test"},
            "content_type": "application/json"
        }
        
        create_response = client.post("/configure-mock", json=mock_data)
        mock_id = create_response.json()["settings_id"]
        
        response = client.get(f"/configure-mock/{mock_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["settings"]["ruta"] == "/api/test"

    def test_get_mock_by_id_not_found(self):
        """Test getting a non-existent mock by ID"""
        response = client.get("/configure-mock/999")
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"]

    def test_delete_mock_by_id_success(self):
        """Test deleting a mock by ID"""
        # Create a mock first
        mock_data = {
            "ruta": "/api/test",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "test"},
            "content_type": "application/json"
        }
        
        create_response = client.post("/configure-mock", json=mock_data)
        mock_id = create_response.json()["settings_id"]
        
        response = client.delete(f"/configure-mock/{mock_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "deleted" in data["message"]

    def test_delete_mock_by_id_not_found(self):
        """Test deleting a non-existent mock"""
        response = client.delete("/configure-mock/999")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "not found" in data["message"]

    def test_clear_all_mocks(self):
        """Test clearing all mocks"""
        # Create some mocks first
        for i in range(3):
            mock_data = {
                "ruta": f"/api/test{i}",
                "metodo": "GET",
                "parametros_url": {},
                "parametros_body": {},
                "headers": {},
                "codigo_estado": 200,
                "contenido_respuesta": {"message": f"test{i}"},
                "content_type": "application/json"
            }
            client.post("/configure-mock", json=mock_data)
        
        response = client.delete("/configure-mock")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["total_settings"] == 0

class TestMockResponseHandling:
    """Test cases for mock response handling"""
    
    def test_simple_mock_response(self):
        """Test simple mock response without conditionals"""
        # Create a simple mock
        mock_data = {
            "ruta": "/api/simple",
            "metodo": "GET",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {"message": "simple response"},
            "content_type": "application/json"
        }
        
        client.post("/configure-mock", json=mock_data)
        
        # Test the mock endpoint
        response = client.get("/api/simple")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "simple response"

    def test_conditional_mock_response(self):
        """Test conditional mock response"""
        # Create a conditional mock
        mock_data = {
            "ruta": "/api/conditional",
            "metodo": "POST",
            "parametros_url": {},
            "parametros_body": {},
            "headers": {},
            "codigo_estado": 200,
            "contenido_respuesta": {
                "condiciones": [
                    {
                        "si": {"user": "admin"},
                        "respuesta": {"message": "Admin access"}
                    }
                ],
                "default": {"message": "Default response"}
            },
            "content_type": "application/json"
        }
        
        client.post("/configure-mock", json=mock_data)
        
        # Test with matching condition
        response1 = client.post("/api/conditional", json={"user": "admin"})
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["message"] == "Admin access"
        
        # Test with non-matching condition (should return default)
        response2 = client.post("/api/conditional", json={"user": "guest"})
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["message"] == "Default response"

    def test_mock_not_found(self):
        """Test request to non-existent mock"""
        response = client.get("/api/nonexistent")
        
        assert response.status_code == 404
        data = response.json()
        assert "Mock no encontrado" in data["detalle"]
