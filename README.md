# Luxus Studios – vizsgaremek

PHP, MySQL, HTML, CSS és JavaScript alapú vizsgaremek autókozmetikai szolgáltatásokhoz.

## Helyi megtekintés

Indítsd el a MySQL szolgáltatást az XAMPP Control Panelből. A projekt mappájában kattints duplán a `start_local.bat` fájlra, majd nyisd meg a `http://127.0.0.1:8000/autokozmetika.html` címet. Ez közvetlenül a projekt mappájából indítja a PHP-t, így nem kell külön bemásolni a fájlokat a `htdocs` könyvtárba. Ha az XAMPP nem a `C:\xampp` mappába van telepítve, módosítsd a PHP elérési útját a `start_local.bat` fájlban.

## Szerveroldali funkciók

A `api.php` kezeli a regisztrációt, belépést, munkameneteket, időpontfoglalást és lemondást, járműadatokat, véleményeket, utalványrendeléseket és az admin műveleteket. A jelszavakat a PHP `password_hash()` tárolja. Az időpontok egyediségét MySQL-kulcs védi.

## Adatbázis és első admin

1. Nyisd meg a phpMyAdmint a `http://localhost/phpmyadmin` címen. (Ehhez az Apache szolgáltatásnak is futnia kell az XAMPP Control Panelben.)
2. Válaszd az **Importálás** fület, válaszd ki a projekt `adatbazis.sql` fájlját, majd indítsd el az importot. A fájl létrehozza a `luxus_studios` adatbázist és a szükséges táblákat.
3. Nyisd meg a `http://127.0.0.1:8000/admin_setup.php` címet. Add meg az admin nevét, e-mail címét és jelszavát. Ez a beállítóoldal csak helyi gépről használható, és csak az első admin létrehozását engedi.
4. Lépj be az oldalon a Fiók menüpontban az admin e-mail címével és jelszavával. Az admin felület ezután a fiókoldalról érhető el.

Az XAMPP alapbeállításaival a DB kapcsolat `localhost`, `root` felhasználó és üres jelszó. Ha a MySQL root felhasználónak jelszót állítottál be, add meg a `DB_PASS` környezeti változóban, vagy állítsd át a `kapcsolat.php` helyi fejlesztői konfigurációját.

## Közzététel előtti teendők

- PHP-t és MySQL-t támogató tárhely kiválasztása, ha szerveroldali funkciókra van szükség.
- A bemutató nem használ valódi bankkártyás fizetést.
- A Google Fonts és Font Awesome ikonok külső forrásból töltődnek be.
- A szolgáltatás éles internetes közzététele előtt állíts be külön, korlátozott adatbázis-felhasználót az XAMPP root helyett.

