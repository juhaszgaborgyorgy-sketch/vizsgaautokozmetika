document.addEventListener('DOMContentLoaded', async () => {
    const message = document.getElementById('adminMessage');
    let csrf = '';
    const get = async action => {
        const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, { credentials: 'same-origin' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'A kérés nem sikerült.');
        return data;
    };
    const post = async (action, values) => {
        const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
            method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(values)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'A művelet nem sikerült.');
        return data;
    };
    const cell = (row, text) => { const td = document.createElement('td'); td.textContent = text ?? ''; row.appendChild(td); return td; };
    const staffNames = { toth_zoltan: 'Tóth Zoltán', juhasz_gabor: 'Juhász Gábor', lindner_szabolcs: 'Lindner Szabolcs' };

    const load = async () => {
        try {
            const data = await get('admin_data');
            message.textContent = 'Az adatok betöltődtek.';
            const bookings = document.getElementById('adminBookings');
            bookings.replaceChildren();
            data.bookings.forEach(item => {
                const row = document.createElement('tr');
                cell(row, `${item.date} · ${item.time}`); cell(row, `${item.name} · ${item.email}`); cell(row, item.serviceName); cell(row, staffNames[item.staffId] || item.staffId);
                const actions = cell(row, '');
                const button = document.createElement('button'); button.className = 'admin-delete'; button.textContent = 'Foglalás lemondása';
                button.addEventListener('click', async () => { if (!confirm('Biztosan lemondod ezt a foglalást?')) return; await post('admin_booking_cancel', { id: item.id }); await load(); });
                actions.appendChild(button); bookings.appendChild(row);
            });
            const reviews = document.getElementById('adminReviews');
            reviews.replaceChildren();
            data.reviews.forEach(item => {
                const row = document.createElement('tr');
                cell(row, item.date); cell(row, staffNames[item.staffId] || item.staffId); cell(row, item.name); cell(row, item.text);
                const actions = cell(row, ''); const button = document.createElement('button'); button.className = 'admin-delete'; button.textContent = 'Törlés';
                button.addEventListener('click', async () => { if (!confirm('Biztosan törlöd ezt a véleményt?')) return; await post('admin_review_delete', { id: item.id }); await load(); });
                actions.appendChild(button); reviews.appendChild(row);
            });
            const orders = document.getElementById('adminOrders'); orders.replaceChildren();
            data.orders.forEach(item => {
                const row = document.createElement('tr');
                cell(row, item.code); cell(row, item.date); cell(row, `${item.recipient} · ${item.email}`); cell(row, `${Number(item.amount).toLocaleString('hu-HU')} Ft`);
                const state = cell(row, ''); const select = document.createElement('select'); select.className = 'admin-status';
                [['új', 'Új'], ['teljesítve', 'Teljesítve'], ['törölve', 'Törölve']].forEach(([value, label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; select.appendChild(option); });
                select.value = item.status; select.addEventListener('change', async () => { await post('admin_order_status', { id: item.id, status: select.value }); }); state.appendChild(select); orders.appendChild(row);
            });
        } catch (error) {
            message.textContent = error.message;
        }
    };

    try {
        const token = await get('csrf'); csrf = token.csrf;
        await load();
    } catch (error) { message.textContent = error.message; }
});
