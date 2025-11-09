-- ============ PACK (base) ============

CREATE VIRTUAL TABLE IF NOT EXISTS memory_pack_fts
USING fts5(packItemId UNINDEXED, content, subject, tags, tokenize='porter');

INSERT INTO memory_pack_fts (packItemId, content, subject, tags)
SELECT id, content, IFNULL(subject,''), IFNULL(tags,'') FROM MemoryPackItem;

CREATE TRIGGER IF NOT EXISTS memory_packitem_ai AFTER INSERT ON MemoryPackItem BEGIN
  INSERT INTO memory_pack_fts(packItemId, content, subject, tags)
  VALUES (new.id, new.content, IFNULL(new.subject,''), IFNULL(new.tags,''));
END;
CREATE TRIGGER IF NOT EXISTS memory_packitem_au AFTER UPDATE ON MemoryPackItem BEGIN
  UPDATE memory_pack_fts SET content=new.content, subject=IFNULL(new.subject,''), tags=IFNULL(new.tags,'')
  WHERE packItemId=new.id;
END;
CREATE TRIGGER IF NOT EXISTS memory_packitem_ad AFTER DELETE ON MemoryPackItem BEGIN
  DELETE FROM memory_pack_fts WHERE packItemId=old.id;
END;

-- ============ LEARNED ============

CREATE VIRTUAL TABLE IF NOT EXISTS learned_memory_fts
USING fts5(memoryId UNINDEXED, content, subject, tags, tokenize='porter');

INSERT INTO learned_memory_fts (memoryId, content, subject, tags)
SELECT id, content, IFNULL(subject,''), IFNULL(tags,'') FROM LearnedMemory;

CREATE TRIGGER IF NOT EXISTS learned_memory_ai AFTER INSERT ON LearnedMemory BEGIN
  INSERT INTO learned_memory_fts(memoryId, content, subject, tags)
  VALUES (new.id, new.content, IFNULL(new.subject,''), IFNULL(new.tags,''));
END;
CREATE TRIGGER IF NOT EXISTS learned_memory_au AFTER UPDATE ON LearnedMemory BEGIN
  UPDATE learned_memory_fts SET content=new.content, subject=IFNULL(new.subject,''), tags=IFNULL(new.tags,'')
  WHERE memoryId=new.id;
END;
CREATE TRIGGER IF NOT EXISTS learned_memory_ad AFTER DELETE ON LearnedMemory BEGIN
  DELETE FROM learned_memory_fts WHERE memoryId=old.id;
END;