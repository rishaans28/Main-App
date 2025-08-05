document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'expenses';
    let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const tableBody = document.querySelector('#expenseTable tbody');
    const addBtn = document.getElementById('addBtn');
    const removeBtn = document.getElementById('removeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }

    function renderTable() {
        tableBody.innerHTML = '';
        expenses.forEach((exp, idx) => {
            const row = document.createElement('tr');
            row.dataset.index = idx;
            row.innerHTML = `
            <td>${exp.name}</td>
            <td>$${exp.amount.toFixed(2)}</td>
            <td>${exp.date}</td>
            <td>${exp.category}</td>
            `;
            row.addEventListener('click', () => row.classList.toggle('selected'));
            tableBody.appendChild(row);
        });
    }

    addBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('name');
        const amountInput = document.getElementById('amount');
        const dateInput = document.getElementById('date');
        const categorySelect = document.getElementById('category');
    
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const date = dateInput.value;
        const category = categorySelect.value;
    
        if (!name || isNaN(amount) || !date) return;
        if (expenses.some(e => e.name === name)) return;
    
        expenses.push({ name, amount, date, category });
        saveToStorage();
        renderTable();
    
        nameInput.value = '';
        amountInput.value = '';
        dateInput.value = '';
        categorySelect.selectedIndex = 0;
        });
    
        removeBtn.addEventListener('click', () => {
        const selectedRows = Array.from(document.querySelectorAll('tr.selected'));
        const indicesToRemove = selectedRows
            .map(row => parseInt(row.dataset.index))
            .sort((a, b) => b - a);
        indicesToRemove.forEach(idx => expenses.splice(idx, 1));
        saveToStorage();
        renderTable();
    });

    clearBtn.addEventListener('click', () => {
        expenses = [];
        saveToStorage();
        renderTable();
    });

    saveBtn.addEventListener('click', () => {
    if (expenses.length === 0) return;

    let csvContent = 'Name,Amount,Date,Category\n';
    let total = 0;

    expenses.forEach(e => {
        csvContent += `${e.name},${e.amount.toFixed(2)},${e.date},${e.category}\n`;
        total += e.amount;
    });

    csvContent += `Sum of expenses,${total.toFixed(2)}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'expenses.csv';
    link.click();
    });

    renderTable();
});
