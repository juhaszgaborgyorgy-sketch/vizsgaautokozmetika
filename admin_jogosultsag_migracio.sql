USE luxus_studios;

-- Futtasd le egyszer a phpMyAdminban a meglévő adatbázis frissítéséhez.
-- A meglévő adminok teljes hozzáférést kapnak; később az adminfelületen
-- lehet számukra szűkített szakemberi hatókörű fiókot létrehozni.
ALTER TABLE felhasznalok
  ADD COLUMN admin_scope ENUM('all', 'toth_zoltan', 'lindner_szabolcs')
  NOT NULL DEFAULT 'all' AFTER admin;
