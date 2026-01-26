from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings

# Configure engine with connection pool settings optimized for Neon Postgres
# - pool_pre_ping: Test connections before using them (handles dropped connections)
# - pool_recycle: Recycle connections after 300 seconds to prevent stale connections
# - pool_size: Number of connections to keep open
# - max_overflow: Additional connections allowed beyond pool_size
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_pre_ping=True,  # Check if connection is alive before using
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_size=5,         # Keep 5 connections in the pool
    max_overflow=10,     # Allow up to 10 additional connections
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

