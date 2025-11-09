-- FTS5 index for base memory (pack items)
CREATE VIRTUAL TABLE IF NOT EXISTS memory_pack_fts
USING fts5(packItemId UNINDEXED, content, subject, tags, tokenize='porter');

-- Backfill from current items
INSERT INTO memory_pack_fts (packItemId, content, subject, tags)
SELECT id, content, IFNULL(subject,''), IFNULL(tags,'')
FROM MemoryPackItem;

-- Keep in sync
CREATE TRIGGER IF NOT EXISTS memory_packitem_ai AFTER INSERT ON MemoryPackItem BEGIN
  INSERT INTO memory_pack_fts(packItemId, content, subject, tags)
  VALUES (new.id, new.content, IFNULL(new.subject,''), IFNULL(new.tags,''));
END;
CREATE TRIGGER IF NOT EXISTS memory_packitem_au AFTER UPDATE ON MemoryPackItem BEGIN
  UPDATE memory_pack_fts
  SET content=new.content, subject=IFNULL(new.subject,''), tags=IFNULL(new.tags,'')
  WHERE packItemId=new.id;
END;
CREATE TRIGGER IF NOT EXISTS memory_packitem_ad AFTER DELETE ON MemoryPackItem BEGIN
  DELETE FROM memory_pack_fts WHERE packItemId=old.id;
END;