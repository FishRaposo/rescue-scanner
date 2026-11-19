"""SQLite seam shared by the web repos: connection, migrations, seed,
transactions, optional FTS5 and tenant-scoped repositories."""

from .connect import connect
from .migrate import MigrationError, migrate, migration_status
from .repo import Repository
from .seed import seed
from .tx import transaction

__all__ = [
    "connect",
    "migrate",
    "migration_status",
    "MigrationError",
    "Repository",
    "seed",
    "transaction",
]
