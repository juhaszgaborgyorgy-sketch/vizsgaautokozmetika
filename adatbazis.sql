CREATE DATABASE IF NOT EXISTS luxus_studios
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_hungarian_ci;

USE luxus_studios;

CREATE TABLE IF NOT EXISTS felhasznalok (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nev VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    jelszo_hash VARCHAR(255) NOT NULL,
    admin TINYINT(1) NOT NULL DEFAULT 0,
    admin_scope ENUM('all', 'toth_zoltan', 'lindner_szabolcs') NOT NULL DEFAULT 'all',
    letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS foglalasok (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id BIGINT UNSIGNED NULL,
    szakember_id VARCHAR(40) NOT NULL,
    szolgaltatas_id VARCHAR(40) NOT NULL,
    szolgaltatas_nev VARCHAR(120) NOT NULL,
    ugyfel_nev VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    datum DATE NOT NULL,
    idopont TIME NOT NULL,
    letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_foglalas_felhasznalo FOREIGN KEY (felhasznalo_id)
      REFERENCES felhasznalok(id) ON DELETE SET NULL,
    UNIQUE KEY uq_foglalas_idopont (szakember_id, datum, idopont),
    KEY ix_foglalas_email (email),
    KEY ix_foglalas_datum (datum)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS velemenyek (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    szakember_id VARCHAR(40) NOT NULL,
    nev VARCHAR(120) NOT NULL,
    szoveg TEXT NOT NULL,
    letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY ix_velemeny_szakember (szakember_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jarmuvek (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id BIGINT UNSIGNED NOT NULL UNIQUE,
    tipus VARCHAR(100) NOT NULL,
    rendszam VARCHAR(20) NOT NULL,
    CONSTRAINT fk_jarmu_felhasznalo FOREIGN KEY (felhasznalo_id)
      REFERENCES felhasznalok(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utalvany_rendelesek (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rendelesi_kod VARCHAR(24) NOT NULL UNIQUE,
    ertek INT UNSIGNED NOT NULL,
    megajandekozott VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    allapot ENUM('új', 'teljesítve', 'törölve') NOT NULL DEFAULT 'új',
    letrehozva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'toth_zoltan', 'Csonka Szilárd', 'Hihetetlen munkát végzett Zoltán, a fekete BMW-m tükörfényes lett!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='toth_zoltan' AND nev='Csonka Szilárd');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'toth_zoltan', 'Dombovári Lili', 'Nagyon meg vagyok elégedve vele!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='toth_zoltan' AND nev='Dombovári Lili');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'toth_zoltan', 'Tihany Barnabás', 'Precíz és alapos munkát végzett, csak ajánlani tudom.'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='toth_zoltan' AND nev='Tihany Barnabás');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'juhasz_gabor', 'Bóta Csilla', 'A világos bőrüléseink újra olyanok, mintha most jöttek volna ki a szalonból.'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='juhasz_gabor' AND nev='Bóta Csilla');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'juhasz_gabor', 'Tóth Anna', 'Nagyon meg vagyok elégedve vele!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='juhasz_gabor' AND nev='Tóth Anna');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'juhasz_gabor', 'Király Edmond', 'Kiváló munka!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='juhasz_gabor' AND nev='Király Edmond');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'lindner_szabolcs', 'Kronome Gréta', 'A kerámiabevonat óta a vizet szinte taszítja az autó, alig kell mosni.'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='lindner_szabolcs' AND nev='Kronome Gréta');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'lindner_szabolcs', 'Vass Dominik', 'Kiváló munka!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='lindner_szabolcs' AND nev='Vass Dominik');
INSERT INTO velemenyek (szakember_id, nev, szoveg)
SELECT 'lindner_szabolcs', 'Bárkány Judit', 'Meg vagyok elégedve Szabival!'
WHERE NOT EXISTS (SELECT 1 FROM velemenyek WHERE szakember_id='lindner_szabolcs' AND nev='Bárkány Judit');
