document.addEventListener('DOMContentLoaded', () => {
    let csrfToken = '';
    const api = async (action, data = null) => {
        const separator = action.indexOf('&');
        const actionName = separator === -1 ? action : action.slice(0, separator);
        const query = separator === -1 ? '' : action.slice(separator + 1);
        const options = { credentials: 'same-origin', headers: {} };
        if (data !== null) {
            if (!csrfToken) csrfToken = (await api('csrf')).csrf;
            options.method = 'POST';
            options.headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken };
            options.body = JSON.stringify(data);
        }
        const response = await fetch(`api.php?action=${encodeURIComponent(actionName)}${query ? `&${query}` : ''}`, options);
        const responseText = await response.text();
        let result;
        try { result = JSON.parse(responseText); }
        catch {
            throw new Error('A PHP szerver nem JSON választ adott. Nyisd meg az oldalt a start_local.bat indítása után a http://127.0.0.1:8000 címen.');
        }
        if (!response.ok) throw new Error(result.error || 'A művelet nem sikerült.');
        return result;
    };
    const showError = (element, message) => {
        if (!element) { alert(message); return; }
        element.textContent = message;
        element.style.display = 'block';
    };
    const staff = {
        toth_zoltan: { name: 'Tóth Zoltán', services: [{ id: 'pol_1', name: '1 Lépcsős Polírozás' }, { id: 'pol_3', name: '3 Lépcsős Prémium Polírozás' }] },
        juhasz_gabor: { name: 'Juhász Gábor', services: [{ id: 'belso_alap', name: 'Alap Kozmetika' }, { id: 'belso_prem', name: 'Prémium Bőr/Kárpittisztítás' }] },
        lindner_szabolcs: { name: 'Lindner Szabolcs', services: [{ id: 'ker_1', name: '1 Éves Védőbevonat' }, { id: 'ker_3', name: '3 Éves 9H Kerámia' }] }
    };
    const slots = ['08:00', '10:00', '13:00', '15:00'];

    const menuButton = document.getElementById('mobilMenugomb');
    const menu = document.getElementById('fomenu');
    if (menuButton && menu) menuButton.addEventListener('click', () => {
        const open = menu.classList.toggle('nyitva');
        menuButton.setAttribute('aria-expanded', String(open));
        const icon = menuButton.querySelector('i');
        if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    const slider = document.getElementById('polirCsuszka');
    const beforeImage = document.getElementById('elozoNezet');
    if (slider && beforeImage) slider.addEventListener('input', event => beforeImage.style.width = `${event.target.value}%`);
    document.querySelectorAll('.gyik-kerdes').forEach(question => question.addEventListener('click', () => question.parentElement.classList.toggle('nyitva')));
    const staffCards = document.querySelectorAll('.szakember-opcio');
    const priceGrid = document.getElementById('arlistaRacs');
    if (staffCards.length) staffCards.forEach(card => card.addEventListener('click', () => {
        const selected = card.dataset.valasztott;
        staffCards.forEach(item => item.classList.toggle('aktiv', item === card));
        if (priceGrid) priceGrid.style.display = 'flex';
        document.querySelectorAll('.arlista-kartya').forEach(item => item.style.display = item.dataset.szakember === selected ? 'block' : 'none');
    }));

    // Fiók és admin jogosultság
    const loginForm = document.getElementById('bejelentkezesForm');
    const loginSection = document.getElementById('bejelentkezoSzekcio');
    const dashboard = document.getElementById('vezerlopultSzekcio');
    const loginError = document.getElementById('loginError');
    const renderDashboard = async () => {
        if (!dashboard) return;
        try {
            const { user } = await api('me');
            if (!user) return;
            loginSection.style.display = 'none';
            dashboard.style.display = 'block';
            document.getElementById('felhasznaloKoszontese').textContent = `Üdvözöljük, ${user.name}!`;
            const adminLink = document.getElementById('adminLink');
            if (adminLink) adminLink.style.display = Number(user.admin) ? 'inline-flex' : 'none';
            const [{ bookings }, { car }] = await Promise.all([api('bookings'), api('car')]);
            document.getElementById('ugyfelAuto').textContent = car?.type || 'Még nincs megadva';
            document.getElementById('ugyfelRendszam').textContent = car?.plate || '—';
            document.getElementById('autoTipusInput').value = car?.type || '';
            document.getElementById('autoRendszamInput').value = car?.plate || '';
            document.getElementById('foglalasokSzama').textContent = String(bookings.length);
            const list = document.getElementById('ugyfelFoglalasLista');
            list.replaceChildren();
            if (!bookings.length) list.innerHTML = '<p style="color:#a0a0a0">Még nincs aktív foglalása.</p>';
            bookings.forEach(item => {
                const row = document.createElement('div');
                row.className = 'ugyfel-foglalas-kartya';
                const detail = document.createElement('div');
                const heading = document.createElement('h4'); heading.textContent = item.serviceName;
                const text = document.createElement('p'); text.textContent = `${staff[item.staffId]?.name || item.staffId} · ${item.date} · ${item.time}`;
                detail.append(heading, text);
                const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'gomb gomb-keret'; cancel.textContent = 'Lemondás';
                cancel.addEventListener('click', async () => { try { await api('booking_cancel', { id: item.id }); await renderDashboard(); } catch (error) { showError(loginError, error.message); } });
                row.append(detail, cancel); list.appendChild(row);
            });
        } catch (error) { showError(loginError, error.message); }
    };
    if (loginForm) loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        loginError.style.display = 'none';
        try {
            await api('login', { email: document.getElementById('belepEmail').value.trim(), password: document.getElementById('belepJelszo').value });
            await renderDashboard();
        } catch (error) { showError(loginError, error.message); }
    });
    const logout = document.getElementById('btnKijelentkezes');
    if (logout) logout.addEventListener('click', async () => {
        try { await api('logout', {}); csrfToken = ''; dashboard.style.display = 'none'; loginSection.style.display = 'block'; loginForm.reset(); }
        catch (error) { showError(loginError, error.message); }
    });
    if (dashboard) renderDashboard();

    const registerForm = document.getElementById('regisztracioForm');
    if (registerForm) registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        const name = document.getElementById('regNev').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regJelszo1').value;
        const error = document.getElementById('jelszoHiba');
        error.style.display = 'none';
        if (password !== document.getElementById('regJelszo2').value) { showError(error, 'A két jelszó nem egyezik meg.'); return; }
        try {
            await api('register', { name, email, password });
            registerForm.style.display = 'none';
            document.getElementById('sikeresReg').style.display = 'block';
        } catch (reason) { showError(error, reason.message); }
    });

    const carForm = document.getElementById('autoForm');
    if (carForm) carForm.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await api('car_save', { type: document.getElementById('autoTipusInput').value.trim(), plate: document.getElementById('autoRendszamInput').value.trim() });
            await renderDashboard();
        } catch (error) { showError(loginError, error.message); }
    });

    // Szerveroldali foglalási naptár
    const staffSelect = document.getElementById('szakemberSelect');
    if (staffSelect) {
        const serviceSelect = document.getElementById('szolgaltatasSelect');
        const calendar = document.getElementById('naptarSzekcio');
        const dateInput = document.getElementById('kivalasztottDatumH');
        const timeInput = document.getElementById('kivalasztottIdopontH');
        const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
        const today = new Date(); let year = today.getFullYear(); let month = today.getMonth();
        let chosenStaff = null; let monthAvailability = {};
        const dateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const clearSelection = () => { dateInput.value = ''; timeInput.value = ''; document.getElementById('idosavGrid').replaceChildren(); document.getElementById('idosavTarolo').style.display = 'none'; };
        const loadAvailability = async () => {
            const result = await api(`availability_month&staff_id=${encodeURIComponent(staffSelect.value)}&month=${year}-${String(month + 1).padStart(2, '0')}`);
            monthAvailability = result.booked;
        };
        const drawCalendar = async () => {
            document.getElementById('aktualisHonapLabel').textContent = `${year} ${months[month]}`;
            const grid = document.getElementById('naptarGrid'); grid.innerHTML = '<div class="naptar-nap fejlec-nap">H</div><div class="naptar-nap fejlec-nap">K</div><div class="naptar-nap fejlec-nap">Sze</div><div class="naptar-nap fejlec-nap">Cs</div><div class="naptar-nap fejlec-nap">P</div><div class="naptar-nap fejlec-nap">Szo</div><div class="naptar-nap fejlec-nap">V</div>';
            try { await loadAvailability(); } catch (error) { showError(document.getElementById('foglalasSiker'), error.message); return; }
            const offset = (new Date(year, month, 1).getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate();
            for (let n = 0; n < offset; n++) grid.appendChild(document.createElement('div'));
            for (let day = 1; day <= days; day++) {
                const date = dateKey(year, month, day); const button = document.createElement('button');
                button.type = 'button'; button.className = 'naptar-nap szabad'; button.textContent = String(day); button.setAttribute('aria-label', `${year}. ${months[month]} ${day}.`);
                const past = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const bookedTimes = monthAvailability[date] || [];
                if (past || bookedTimes.length >= slots.length) { button.classList.replace('szabad', 'foglalt'); button.disabled = true; }
                else button.addEventListener('click', () => {
                    grid.querySelectorAll('.naptar-nap').forEach(item => { item.classList.remove('kivalasztva'); item.setAttribute('aria-pressed', 'false'); });
                    button.classList.add('kivalasztva'); button.setAttribute('aria-pressed', 'true'); dateInput.value = date; timeInput.value = '';
                    const timeGrid = document.getElementById('idosavGrid'); timeGrid.replaceChildren(); document.getElementById('idosavTarolo').style.display = 'block';
                    slots.forEach(time => {
                        const isBooked = bookedTimes.includes(time); const slot = document.createElement('button');
                        slot.type = 'button'; slot.className = `idosav-gomb ${isBooked ? 'foglalt' : 'szabad'}`; slot.textContent = isBooked ? `${time} · foglalt` : time; slot.disabled = isBooked;
                        slot.addEventListener('click', () => { timeGrid.querySelectorAll('button').forEach(item => item.classList.remove('kivalasztva')); slot.classList.add('kivalasztva'); timeInput.value = time; });
                        timeGrid.appendChild(slot);
                    });
                });
                grid.appendChild(button);
            }
        };
        const updateServices = () => {
            clearSelection(); serviceSelect.innerHTML = '<option value="">-- Válasszon Szolgáltatást --</option>';
            chosenStaff = staff[staffSelect.value] || null; serviceSelect.disabled = !chosenStaff; calendar.style.display = 'none';
            if (chosenStaff) chosenStaff.services.forEach(item => { const option = document.createElement('option'); option.value = item.id; option.textContent = item.name; serviceSelect.appendChild(option); });
        };
        staffSelect.addEventListener('change', updateServices);
        serviceSelect.addEventListener('change', async () => { clearSelection(); calendar.style.display = serviceSelect.value ? 'block' : 'none'; if (serviceSelect.value) await drawCalendar(); });
        document.getElementById('btnElozoHonap').addEventListener('click', async () => { month--; if (month < 0) { month = 11; year--; } clearSelection(); await drawCalendar(); });
        document.getElementById('btnKovetkezoHonap').addEventListener('click', async () => { month++; if (month > 11) { month = 0; year++; } clearSelection(); await drawCalendar(); });
        const staffParam = new URLSearchParams(location.search).get('szakember');
        if (staff[staffParam]) { staffSelect.value = staffParam; updateServices(); }
        document.getElementById('foglalasForm').addEventListener('submit', async event => {
            event.preventDefault();
            if (!dateInput.value || !timeInput.value || !serviceSelect.value) return;
            const service = chosenStaff.services.find(item => item.id === serviceSelect.value);
            try {
                await api('booking_create', { staffId: staffSelect.value, serviceId: service.id, date: dateInput.value, time: timeInput.value, name: document.getElementById('ugyfelNev').value.trim(), email: document.getElementById('ugyfelEmail').value.trim() });
                const notice = document.getElementById('foglalasSiker'); notice.textContent = `Sikeres foglalás: ${dateInput.value} ${timeInput.value}, ${service.name} – ${chosenStaff.name}.`; notice.style.display = 'block';
                event.target.reset(); updateServices();
            } catch (error) { showError(document.getElementById('foglalasSiker'), error.message); await drawCalendar(); }
        });
        api('me').then(({ user }) => {
            if (user) {
                document.getElementById('ugyfelNev').value = user.name;
                document.getElementById('ugyfelEmail').value = user.email;
            }
        }).catch(() => {});
    }

    // Vélemények adatbázisból
    const profileId = location.pathname.split('/').pop().replace('.html', '');
    const reviewsList = document.getElementById('velemenyekLista');
    const loadReviews = async () => {
        if (!reviewsList || !staff[profileId]) return;
        try {
            const { reviews } = await api(`reviews&staff_id=${encodeURIComponent(profileId)}`);
            reviews.forEach(item => {
                if ([...reviewsList.children].some(child => child.dataset.reviewId === String(item.id))) return;
                const card = document.createElement('div'); card.className = 'velemeny-kartya';
                card.dataset.reviewId = String(item.id);
                const header = document.createElement('div'); header.className = 'velemeny-fejlec';
                const name = document.createElement('strong'); name.textContent = item.name;
                const stars = document.createElement('span'); stars.className = 'velemeny-csillagok'; stars.textContent = '★★★★★';
                const text = document.createElement('p'); text.textContent = item.text;
                header.append(name, stars); card.append(header, text); reviewsList.appendChild(card);
            });
        } catch (error) { console.error(error); }
    };
    loadReviews();
    document.querySelectorAll('form.velemenyForm').forEach(form => form.addEventListener('submit', async event => {
        event.preventDefault(); const values = new FormData(form);
        try { await api('review_create', { staffId: values.get('szakember_id'), name: values.get('nev'), text: values.get('szoveg') }); await loadReviews(); form.reset(); }
        catch (error) { alert(error.message); }
    }));

    // Ajándékutalvány rendelés: az összeg rögzül, bankkártyás fizetés nincs.
    const voucherForm = document.getElementById('utalvanyForm');
    if (voucherForm) voucherForm.addEventListener('submit', async event => {
        event.preventDefault();
        const amount = Number(document.getElementById('utalvanyErtek').value.replace(/\D/g, ''));
        try {
            const result = await api('order_create', { amount, recipient: document.getElementById('kedvezmenyezett').value.trim(), email: document.getElementById('email').value.trim() });
            location.href = `fizetes.html?order=${encodeURIComponent(result.code)}`;
        } catch (error) { alert(error.message); }
    });
    const orderForm = document.getElementById('fizetesForm');
    if (orderForm) {
        const code = new URLSearchParams(location.search).get('order');
        api(`order&code=${encodeURIComponent(code || '')}`).then(({ order }) => {
            document.getElementById('kiirtUtalvany').textContent = `Ajándékutalvány · ${order.recipient}`;
            document.getElementById('kiirtOsszeg').textContent = `${Number(order.amount).toLocaleString('hu-HU')} Ft`;
            document.getElementById('rendeloEmail').textContent = order.email;
        }).catch(() => { location.href = 'ajandekkartya.html'; });
        orderForm.addEventListener('submit', async event => {
            event.preventDefault();
            try { await api('order_complete', { code }); location.href = `sikeres_vasarlas.html?order=${encodeURIComponent(code)}`; }
            catch (error) { alert(error.message); }
        });
    }
    const orderCode = document.getElementById('rendelesAzonosito');
    if (orderCode) {
        const code = new URLSearchParams(location.search).get('order') || '';
        api(`order&code=${encodeURIComponent(code)}`).then(({ order }) => {
            orderCode.textContent = order.code;
            document.getElementById('vasarlasKoszonet').textContent = `${order.recipient} részére a ${Number(order.amount).toLocaleString('hu-HU')} Ft értékű utalvány megrendelését rögzítettük.`;
        }).catch(() => { document.getElementById('vasarlasKoszonet').textContent = 'A rendelési adat nem található.'; });
    }
});
