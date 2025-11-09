-- Create FTS5 virtual table to mirror CaiaMemory.content
CREATE VIRTUAL TABLE IF NOT EXISTS caia_memory_fts
USING fts5(memoryId UNINDEXED, content, subject, tags, tokenize = 'porter');

-- Initial backfill from CaiaMemory
INSERT INTO caia_memory_fts (memoryId, content, subject, tags)
SELECT id, content, IFNULL(subject,''), IFNULL(tags,'')
FROM CaiaMemory;

-- Triggers to keep it in sync
CREATE TRIGGER IF NOT EXISTS caia_memory_ai AFTER INSERT ON CaiaMemory BEGIN
  INSERT INTO caia_memory_fts(memoryId, content, subject, tags)
  VALUES (new.id, new.content, IFNULL(new.subject,''), IFNULL(new.tags,''));
END;
CREATE TRIGGER IF NOT EXISTS caia_memory_ad AFTER DELETE ON CaiaMemory BEGIN
  DELETE FROM caia_memory_fts WHERE memoryId = old.id;
END;
CREATE TRIGGER IF NOT EXISTS caia_memory_au AFTER UPDATE ON CaiaMemory BEGIN
  UPDATE caia_memory_fts
  SET content=new.content, subject=IFNULL(new.subject,''), tags=IFNULL(new.tags,'')
  WHERE memoryId = new.id;
END;