from supabase import create_client, Client
from config import get_settings
from functools import lru_cache


@lru_cache()
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


class DatabaseService:
    def __init__(self):
        self.client = get_supabase_client()
    
    def execute_query(self, query):
        return query.execute()
    
    def insert(self, table: str, data: dict):
        return self.client.table(table).insert(data).execute()
    
    def select(self, table: str, columns: str = "*"):
        return self.client.table(table).select(columns)
    
    def update(self, table: str, data: dict):
        return self.client.table(table).update(data)
    
    def delete(self, table: str):
        return self.client.table(table).delete()
