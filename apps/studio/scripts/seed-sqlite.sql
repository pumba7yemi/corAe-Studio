INSERT OR IGNORE INTO User (id,email,displayName,role,createdAt)
VALUES (lower(hex(randomblob(16))), 'owner@corae.app','Subject 1','owner', datetime('now'));