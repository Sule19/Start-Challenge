import json
import os
from typing import List, Dict, Any
from datetime import datetime

class MockSettingsStorageManager:
    """
    Utility class for managing mock settings persistence operations.
    """
    
    def __init__(self, file_path: str = "configure-mock.json"):
        self.file_path = file_path
    
    def backup_current_file(self) -> str:
        """
        Create a backup of the current mock settings file.
        Returns the backup file path.
        """
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"No file found at {self.file_path}")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{self.file_path}.backup_{timestamp}"
        
        with open(self.file_path, 'r', encoding='utf-8') as source:
            with open(backup_path, 'w', encoding='utf-8') as backup:
                backup.write(source.read())
        
        print(f"Backup created: {backup_path}")
        return backup_path
    
    def validate_file_structure(self) -> bool:
        """
        Validate that the JSON file has the correct structure.
        """
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            if not isinstance(data, list):
                print("Error: Root element should be a list")
                return False
            
            required_fields = [
                'ruta', 'metodo', 'parametros_url', 'parametros_body',
                'headers', 'codigo_estado', 'contenido_respuesta', 'content_type'
            ]
            
            for i, setting in enumerate(data):
                if not isinstance(setting, dict):
                    print(f"Error: Item {i} is not a dictionary")
                    return False
                
                for field in required_fields:
                    if field not in setting:
                        print(f"Error: Item {i} missing required field '{field}'")
                        return False
            
            print(f"File structure validation passed. Found {len(data)} valid mock settings.")
            return True
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            return False
        except Exception as e:
            print(f"Validation error: {str(e)}")
            return False
    
    def get_file_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the mock settings file.
        """
        if not os.path.exists(self.file_path):
            return {"exists": False}
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            file_size = os.path.getsize(self.file_path)
            modified_time = datetime.fromtimestamp(os.path.getmtime(self.file_path))
            
            methods = {}
            routes = set()
            
            for setting in data:
                method = setting.get('metodo', 'UNKNOWN')
                methods[method] = methods.get(method, 0) + 1
                routes.add(setting.get('ruta', 'UNKNOWN'))
            
            return {
                "exists": True,
                "total_settings": len(data),
                "file_size_bytes": file_size,
                "last_modified": modified_time.isoformat(),
                "methods_count": methods,
                "unique_routes": len(routes),
                "routes": list(routes)
            }
            
        except Exception as e:
            return {"exists": True, "error": str(e)}
    
    def repair_file(self) -> bool:
        """
        Attempt to repair a corrupted mock settings file.
        """
        try:
            # First, try to backup the current file
            if os.path.exists(self.file_path):
                self.backup_current_file()
            
            # Create a new empty file
            with open(self.file_path, 'w', encoding='utf-8') as file:
                json.dump([], file, indent=2)
            
            print(f"File repaired: {self.file_path}")
            return True
            
        except Exception as e:
            print(f"Error repairing file: {str(e)}")
            return False

def main():
    """
    Command-line utility for managing mock settings storage.
    """
    import sys
    
    manager = MockSettingsStorageManager()
    
    if len(sys.argv) < 2:
        print("Usage: python storage_manager.py [validate|stats|backup|repair]")
        return
    
    command = sys.argv[1].lower()
    
    if command == "validate":
        if manager.validate_file_structure():
            print("✅ File validation passed")
        else:
            print("❌ File validation failed")
    
    elif command == "stats":
        stats = manager.get_file_stats()
        print("📊 File Statistics:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
    
    elif command == "backup":
        try:
            backup_path = manager.backup_current_file()
            print(f"✅ Backup created: {backup_path}")
        except Exception as e:
            print(f"❌ Backup failed: {str(e)}")
    
    elif command == "repair":
        if manager.repair_file():
            print("✅ File repaired successfully")
        else:
            print("❌ File repair failed")
    
    else:
        print("Unknown command. Available: validate, stats, backup, repair")

if __name__ == "__main__":
    main()
