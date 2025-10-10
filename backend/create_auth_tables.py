#!/usr/bin/env python3
"""
Create missing authentication tables to resolve migration conflict.
"""

import sqlite3
import os

def create_missing_auth_tables():
    """Create the missing authentication tables."""
    db_path = 'db.sqlite3'
    
    if not os.path.exists(db_path):
        print("Database file not found!")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Creating missing authentication tables...")
        
        # Create LoginAttempt table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_loginattempt" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "email" varchar(254) NOT NULL,
                "ip_address" char(39) NOT NULL,
                "success" bool NOT NULL,
                "failure_reason" varchar(255) NULL,
                "user_agent" text NOT NULL,
                "timestamp" datetime NOT NULL,
                "suspicious" bool NOT NULL,
                "blocked" bool NOT NULL
            )
        ''')
        
        # Create UserRole table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_userrole" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "name" varchar(50) NOT NULL UNIQUE,
                "description" text NOT NULL,
                "permissions" text NOT NULL,
                "is_system_role" bool NOT NULL,
                "created_at" datetime NOT NULL,
                "updated_at" datetime NOT NULL
            )
        ''')
        
        # Create APIKey table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_apikey" (
                "id" char(32) NOT NULL PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "key" varchar(255) NOT NULL UNIQUE,
                "permissions" text NOT NULL,
                "is_active" bool NOT NULL,
                "last_used" datetime NULL,
                "expires_at" datetime NULL,
                "created_at" datetime NOT NULL,
                "rate_limit" integer unsigned NOT NULL,
                "usage_count" integer unsigned NOT NULL,
                "user_id" char(32) NOT NULL REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED
            )
        ''')
        
        # Create PasswordReset table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_passwordreset" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "token" varchar(255) NOT NULL UNIQUE,
                "ip_address" char(39) NOT NULL,
                "used" bool NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "user_id" char(32) NOT NULL REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED
            )
        ''')
        
        # Create TwoFactorAuth table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_twofactorauth" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "secret_key" varchar(255) NOT NULL,
                "backup_codes" text NOT NULL,
                "is_enabled" bool NOT NULL,
                "last_used" datetime NULL,
                "created_at" datetime NOT NULL,
                "user_id" char(32) NOT NULL UNIQUE REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED
            )
        ''')
        
        # Create UserSession table  
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_usersession" (
                "id" char(32) NOT NULL PRIMARY KEY,
                "session_key" varchar(255) NOT NULL UNIQUE,
                "ip_address" char(39) NOT NULL,
                "user_agent" text NOT NULL,
                "location" varchar(255) NULL,
                "is_active" bool NOT NULL,
                "last_activity" datetime NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "device_info" text NOT NULL,
                "user_id" char(32) NOT NULL REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED
            )
        ''')
        
        # Create UserRoleAssignment table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "authentication_userroleassignment" (
                "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                "assigned_at" datetime NOT NULL,
                "expires_at" datetime NULL,
                "is_active" bool NOT NULL,
                "assigned_by_id" char(32) NULL REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED,
                "role_id" integer NOT NULL REFERENCES "authentication_userrole" ("id") DEFERRABLE INITIALLY DEFERRED,
                "user_id" char(32) NOT NULL REFERENCES "authentication_customuser" ("id") DEFERRABLE INITIALLY DEFERRED
            )
        ''')
        
        conn.commit()
        print("✅ All authentication tables created successfully!")
        
        # Check what tables now exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'authentication_%'")
        auth_tables = cursor.fetchall()
        print(f"Authentication tables: {[table[0] for table in auth_tables]}")
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    create_missing_auth_tables()