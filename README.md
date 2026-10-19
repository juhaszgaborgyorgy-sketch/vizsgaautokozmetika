# Luxus Studios – vizsgaremek

PHP, MySQL, HTML, CSS és JavaScript alapú vizsgaremek autókozmetikai szolgáltatásokhoz.

## Helyi megtekintés

Indítsd el a MySQL szolgáltatást az XAMPP Control Panelből. A projekt mappájában kattints duplán a `start_local.bat` fájlra, majd PC-n nyisd meg a `http://127.0.0.1:8000/autokozmetika.html` címet. A telefonos kipróbáláshoz csatlakozz ugyanahhoz a Wi-Fi-hálózathoz, keresd meg a számítógép IPv4-címét az `ipconfig` paranccsal, majd telefonon nyisd meg a `http://<számítógép-IPv4-címe>:8000/autokozmetika.html` címet. Ha a Windows tűzfal engedélyt kér, csak a privát hálózatot engedélyezd. Ez közvetlenül a projekt mappájából indítja a PHP-t, így nem kell külön bemásolni a fájlokat a `htdocs` könyvtárba. Ha az XAMPP nem a `C:\xampp` mappába van telepítve, módosítsd a PHP elérési útját a `start_local.bat` fájlban.

A telefonos eléréshez a PHP fejlesztői szerver a helyi hálózaton is figyel. Ez csak megbízható, saját Wi-Fi-hálózaton való kipróbálásra szolgál; ne tedd ki közvetlenül az internetre. Az `admin_setup.php` első használatakor a számítógépen, a `127.0.0.1` címen hozd létre az első adminfiókot. A mobil böngészőben ugyanazzal az IPv4-címmel nyisd meg az oldalt és az API-t, hogy a bejelentkezési munkamenet működjön.

## Szerveroldali funkciók

A `api.php` kezeli a regisztrációt, belépést, munkameneteket, időpontfoglalást és lemondást, járműadatokat, véleményeket, utalványrendeléseket és az admin műveleteket. A jelszavakat a PHP `password_hash()` tárolja. Az időpontok egyediségét MySQL-kulcs védi.

## Adatbázis és első admin

1. Nyisd meg a phpMyAdmint a `http://localhost/phpmyadmin` címen. (Ehhez az Apache szolgáltatásnak is futnia kell az XAMPP Control Panelben.)
2. Válaszd az **Importálás** fület, válaszd ki a projekt `adatbazis.sql` fájlját, majd indítsd el az importot. A fájl létrehozza a `luxus_studios` adatbázist és a szükséges táblákat.
3. Nyisd meg a `http://127.0.0.1:8000/admin_setup.php` címet. Add meg az admin nevét, e-mail címét és jelszavát. Ez a beállítóoldal csak helyi gépről használható, és csak az első admin létrehozását engedi.
4. Lépj be az oldalon a Fiók menüpontban az admin e-mail címével és jelszavával. Az admin felület ezután a fiókoldalról érhető el.

### Szakemberenkénti admin jogosultság

Az első admin teljes hozzáférést kap. Bejelentkezés után az `admin.html` oldalon további adminfiókok hozhatók létre a Tóth Zoltán, Lindner Szabolcs vagy teljes hozzáférési körrel. A szakemberhez kötött admin csak a saját szakemberének foglalásait és véleményeit látja és kezelheti. Az utalványrendelések és további adminfiókok kezelése csak a teljes hozzáférésű admin számára érhető el.

Ha már létező adatbázist frissítesz, importáld egyszer az `admin_jogosultsag_migracio.sql` fájlt a phpMyAdminban. A migráció a korábban létrehozott adminokat teljes hozzáférésűnek hagyja. A friss adatbázis sémája az `adatbazis.sql` fájlban már tartalmazza a jogosultsági mezőt.

Az XAMPP alapbeállításaival a DB kapcsolat `localhost`, `root` felhasználó és üres jelszó. Ha a MySQL root felhasználónak jelszót állítottál be, add meg a `DB_PASS` környezeti változóban, vagy állítsd át a `kapcsolat.php` helyi fejlesztői konfigurációját.

## Közzététel előtti teendők

- PHP-t és MySQL-t támogató tárhely kiválasztása, ha szerveroldali funkciókra van szükség.
- A bemutató nem használ valódi bankkártyás fizetést.
- A Google Fonts és Font Awesome ikonok külső forrásból töltődnek be.
- A szolgáltatás éles internetes közzététele előtt állíts be külön, korlátozott adatbázis-felhasználót az XAMPP root helyett.

