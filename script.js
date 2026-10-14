document.addEventListener('DOMContentLoaded', () => {

    // 1. MOBIL HAMBURGER MENÜ (Minden oldalon fut)
    const menuGomb = document.getElementById('mobilMenugomb');
    const menu = document.getElementById('fomenu');
    if (menuGomb && menu) {
        menuGomb.addEventListener('click', () => {
            menu.classList.toggle('nyitva');
            const ikon = menuGomb.querySelector('i');
            if (menu.classList.contains('nyitva')) {
                ikon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                ikon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // 2. ELŐTTE-UTÁNA CSÚSZKA (Csak a főoldalon)
    const csuszka = document.getElementById('polirCsuszka');
    const elozoNezet = document.getElementById('elozoNezet');
    if (csuszka && elozoNezet) {
        csuszka.addEventListener('input', (e) => {
            elozoNezet.style.width = e.target.value + '%';
        });
    }

    // 3. GYIK (AKORDEON) (Csak a főoldalon)
    const gyikKerdesek = document.querySelectorAll('.gyik-kerdes');
    gyikKerdesek.forEach(kerdes => {
        kerdes.addEventListener('click', function() {
            this.parentElement.classList.toggle('nyitva');
        });
    });

    // 4. PRÉMIUM SZAKEMBER VÁLASZTÓ ÉS ÁRLISTA (Csak a főoldalon)
    const szakemberOpcionk = document.querySelectorAll('.szakember-opcio');
    const arlistaRacs = document.getElementById('arlistaRacs');
    const arlistaKartyak = document.querySelectorAll('.arlista-kartya');

    if (szakemberOpcionk.length > 0) {
        szakemberOpcionk.forEach(opcio => {
            opcio.addEventListener('click', function() {
                const kivalasztott = this.getAttribute('data-valasztott');

                szakemberOpcionk.forEach(k => k.classList.remove('aktiv'));
                this.classList.add('aktiv');

                if (arlistaRacs) arlistaRacs.style.display = 'flex';

                arlistaKartyak.forEach(kartya => {
                    if (kartya.getAttribute('data-szakember') === kivalasztott) {
                        kartya.style.display = 'block';
                        kartya.style.animation = 'none';
                        kartya.offsetHeight;
                        kartya.style.animation = 'beuszas 0.5s ease forwards';
                    } else {
                        kartya.style.display = 'none';
                    }
                });
            });
        });
    }

    // 5. COOKIE SÁV KEZELÉSE (Minden oldalon fut)
    const cookieBanner = document.getElementById('cookieBanner');
    const btnElfogad = document.getElementById('btnCookieElfogad');
    const btnElutasit = document.getElementById('btnCookieElutasit');

    if (cookieBanner) {
        if (!localStorage.getItem('cookieDöntés')) {
            cookieBanner.style.display = 'flex';
        }

        const cookieKezeles = (dontes) => {
            cookieBanner.style.display = 'none';
            localStorage.setItem('cookieDöntés', dontes);
        };

        if (btnElfogad) btnElfogad.addEventListener('click', () => cookieKezeles('elfogadva'));
        if (btnElutasit) btnElutasit.addEventListener('click', () => cookieKezeles('elutasitva'));
    }

    // 6. FIZETÉSI OLDAL LOGIKA (Csak a fizetes.html-en)
    const urlParams = new URLSearchParams(window.location.search);
    const ertek = urlParams.get('ertek');
    const kiirtOsszeg = document.getElementById('kiirtOsszeg');
    if (ertek && kiirtOsszeg) {
        kiirtOsszeg.textContent = ertek;
    }

    const kartyaSzamInput = document.getElementById('kartyaSzam');
    if (kartyaSzamInput) {
        kartyaSzamInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += '-';
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    const lejaratInput = document.getElementById('kartyaLejarat');
    if (lejaratInput) {
        lejaratInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                let honap = parseInt(value.substring(0, 2));
                if (honap > 12) value = '12' + value.substring(2);
                else if (honap === 0) value = '01' + value.substring(2);
            }
            if (value.length >= 4) {
                let ev = parseInt(value.substring(2, 4));
                if (ev < 26) value = value.substring(0, 2) + '26';
            }
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i === 2) formattedValue += '/';
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    const cvcInput = document.getElementById('kartyaCvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    const fizetesForm = document.getElementById('fizetesForm');
    if (fizetesForm) {
        fizetesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Ez az oldal jelenleg csak bemutató. Ne adjon meg bankkártyaadatot; valódi fizetés még nincs beállítva.');
        });
    }

    // 7. IDŐPONTFOGLALÁS NAPTÁR LOGIKA (Csak a foglalas.html-en)
    const szakemberSelect = document.getElementById('szakemberSelect');
    if (szakemberSelect) {
        const szakemberAdatok = {
            "toth_zoltan": { nev: "Tóth Zoltán", szolgaltatasok: [{ id: "pol_1", nev: "1 Lépcsős Polírozás" }, { id: "pol_3", nev: "3 Lépcsős Prémium Polírozás" }], foglaltNapok: [2, 5, 12, 14, 25, 26] },
            "juhasz_gabor": { nev: "Juhász Gábor", szolgaltatasok: [{ id: "belso_alap", nev: "Alap Kozmetika" }, { id: "belso_prem", nev: "Prémium Bőr/Kárpittisztítás" }], foglaltNapok: [1, 8, 9, 15, 20, 22, 30] },
            "lindner_szabolcs": { nev: "Lindner Szabolcs", szolgaltatasok: [{ id: "ker_1", nev: "1 Éves Védőbevonat" }, { id: "ker_3", nev: "3 Éves 9H Kerámia" }], foglaltNapok: [10, 11, 12, 13, 28, 29] }
        };
        const idosavokAlap = ["08:00", "10:00", "13:00", "15:00"];
        const ma = new Date();
        let aktualisEv = ma.getFullYear(), aktualisHo = ma.getMonth();
        const honapNevek = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
        let kivalasztottSzaki = null;

        const szakemberParam = urlParams.get('szakember');
        if (szakemberParam && szakemberAdatok[szakemberParam]) {
            szakemberSelect.value = szakemberParam;
            frissitSzolgaltatasokat();
        }

        szakemberSelect.addEventListener('change', frissitSzolgaltatasokat);

        const szolgSelect = document.getElementById('szolgaltatasSelect');
        szolgSelect.addEventListener('change', () => {
            if (szolgSelect.value) {
                document.getElementById('naptarSzekcio').style.display = 'block';
                generalNaptar();
            }
        });

        document.getElementById('btnElozoHonap').addEventListener('click', () => valtsHonapot(-1));
        document.getElementById('btnKovetkezoHonap').addEventListener('click', () => valtsHonapot(1));

        function frissitSzolgaltatasokat() {
            const szakiId = szakemberSelect.value;
            document.getElementById('naptarSzekcio').style.display = 'none';
            szolgSelect.innerHTML = '<option value="">-- Válasszon Szolgáltatást --</option>';
            if (!szakiId) { szolgSelect.disabled = true; return; }
            kivalasztottSzaki = szakemberAdatok[szakiId];
            szolgSelect.disabled = false;
            kivalasztottSzaki.szolgaltatasok.forEach(sz => {
                const opt = document.createElement('option');
                opt.value = sz.id; opt.textContent = sz.nev;
                szolgSelect.appendChild(opt);
            });
        }

        function valtsHonapot(irany) {
            aktualisHo += irany;
            if (aktualisHo > 11) { aktualisHo = 0; aktualisEv++; }
            if (aktualisHo < 0) { aktualisHo = 11; aktualisEv--; }
            document.getElementById('idosavTarolo').style.display = 'none';
            generalNaptar();
        }

        function generalNaptar() {
            document.getElementById('aktualisHonapLabel').textContent = aktualisEv + " " + honapNevek[aktualisHo];
            const grid = document.getElementById('naptarGrid');
            grid.innerHTML = '<div class="naptar-nap fejlec-nap">H</div><div class="naptar-nap fejlec-nap">K</div><div class="naptar-nap fejlec-nap">Sze</div><div class="naptar-nap fejlec-nap">Cs</div><div class="naptar-nap fejlec-nap">P</div><div class="naptar-nap fejlec-nap">Szo</div><div class="naptar-nap fejlec-nap">V</div>';
            const elsoNapIndex = (new Date(aktualisEv, aktualisHo, 1).getDay() + 6) % 7;
            const napokSzama = new Date(aktualisEv, aktualisHo + 1, 0).getDate();
            for (let i = 0; i < elsoNapIndex; i++) grid.innerHTML += '<div></div>';
            for (let i = 1; i <= napokSzama; i++) {
                const div = document.createElement('div');
                div.className = 'naptar-nap'; div.textContent = i;
                const napDatum = new Date(aktualisEv, aktualisHo, i);
                const napMult = napDatum < new Date(ma.getFullYear(), ma.getMonth(), ma.getDate());
                if (napMult || kivalasztottSzaki.foglaltNapok.includes(i)) {
                    div.classList.add('foglalt');
                } else {
                    div.classList.add('szabad');
                    div.addEventListener('click', function() {
                        document.querySelectorAll('.naptar-nap').forEach(n => n.classList.remove('kivalasztva'));
                        this.classList.add('kivalasztva');
                        document.getElementById('kivalasztottDatumH').value = `${aktualisEv}. ${honapNevek[aktualisHo]} ${i}.`;

                        const idosavGrid = document.getElementById('idosavGrid');
                        idosavGrid.innerHTML = "";
                        document.getElementById('idosavTarolo').style.display = 'block';
                        idosavokAlap.forEach(ido => {
                            const btn = document.createElement('button');
                            btn.type = 'button'; btn.textContent = ido;
                            btn.className = 'idosav-gomb szabad';
                            btn.addEventListener('click', function() {
                                document.querySelectorAll('.idosav-gomb').forEach(b => b.classList.remove('kivalasztva'));
                                this.classList.add('kivalasztva');
                                document.getElementById('kivalasztottIdopontH').value = ido;
                            });
                            idosavGrid.appendChild(btn);
                        });
                    });
                }
                grid.appendChild(div);
            }
        }

        const foglalasForm = document.getElementById('foglalasForm');
        foglalasForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const datum = document.getElementById('kivalasztottDatumH').value;
            const ido = document.getElementById('kivalasztottIdopontH').value;
            if (!datum || !ido) { alert("Válasszon szabad napot és időpontot!"); return; }
            alert(`Bemutató foglalási folyamat: az időpontot nem mentettük el.\nVálasztott időpont: ${datum} ${ido}\nValódi foglaláshoz kérjük, hívjon minket.`);
            event.target.reset();
            document.getElementById('naptarSzekcio').style.display = 'none';
        });
    }
});
// 8. REGISZTRÁCIÓS LOGIKA (Csak a regisztracio.html-en)
    const regisztracioForm = document.getElementById('regisztracioForm');
    if (regisztracioForm) {
        regisztracioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let j1 = document.getElementById('regJelszo1').value;
            let j2 = document.getElementById('regJelszo2').value;
            let hibaElem = document.getElementById('jelszoHiba');

            if (j1 !== j2) {
                hibaElem.style.display = 'block';
                return;
            }
            hibaElem.style.display = 'none';

            alert('A regisztráció jelenleg csak bemutató: fiók nem jött létre.');
        });
    }

    // 9. ÜGYFÉLKAPU / BEJELENTKEZÉS LOGIKA (Csak az ugyfelkapu.html-en)
    const bejelentkezesForm = document.getElementById('bejelentkezesForm');
    const bejelentkezoSzekcio = document.getElementById('bejelentkezoSzekcio');
    const vezerlopultSzekcio = document.getElementById('vezerlopultSzekcio');
    const btnKijelentkezes = document.getElementById('btnKijelentkezes');

    if (bejelentkezesForm) {
        bejelentkezesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('A bejelentkezés jelenleg csak bemutató, fiókrendszer még nincs beállítva.');
        });
    }

    if (btnKijelentkezes) {
        btnKijelentkezes.addEventListener('click', function() {
            vezerlopultSzekcio.style.display = 'none';
            bejelentkezoSzekcio.style.display = 'block';
        });
    }
    // 10. AJÁNDÉKUTALVÁNY Tovább a fizetéshez logika (Csak az ajandekkartya.html-en)
    const utalvanyForm = document.getElementById('utalvanyForm');
    if (utalvanyForm) {
        utalvanyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ertekSelect = document.getElementById('utalvanyErtek');
            const kivalasztottErtek = ertekSelect ? ertekSelect.value : '50 000 Ft';

            // Átirányítás a fizetési oldalra a kiválasztott összeggel query paraméterként
            window.location.href = `fizetes.html?ertek=${encodeURIComponent(kivalasztottErtek)}`;
        });
    }
