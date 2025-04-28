// --- Глобальные переменные ---
let cart = [];
let loggedInUser = null; // null | { type: 'customer', email: '...' } | { type: 'courier', id: '...' }

// --- DOM элементы (лучше определить один раз) ---
const pageContainer = document.getElementById('page-container');
const userNav = document.getElementById('user-nav');
const cartCountElement = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const checkoutTotalElement = document.getElementById('checkout-total');
const userNameDisplay = document.getElementById('user-name-display');
const orderHistoryContainer = document.getElementById('order-history');
const courierIdDisplay = document.getElementById('courier-id-display');
const assignedOrdersContainer = document.getElementById('assigned-orders');

// --- Функции Навигации и Отображения ---

function showPage(pageId) {
    pageContainer.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.add('active');
    } else {
        console.error("Страница не найдена:", pageId);
        document.getElementById('catalog-page').classList.add('active'); // Фоллбэк на каталог
    }
    updateNav(); // Обновляем навигацию при смене страницы
    if (pageId === 'cart-page' || pageId === 'checkout-page') {
        updateCartTotal();
    }
    if (pageId === 'account-page' && loggedInUser?.type === 'customer') {
        renderOrderHistory();
    }
     if (pageId === 'courier-dashboard-page' && loggedInUser?.type === 'courier') {
        renderAssignedOrders();
    }
    window.scrollTo(0, 0);
}

// Обновление кнопок в шапке (Вход/Кабинет)
function updateNav() {
    userNav.innerHTML = ''; // Очищаем текущие кнопки
    if (loggedInUser) {
        let accountButtonText = 'Кабинет';
        let targetPage = 'account-page';
        if (loggedInUser.type === 'courier') {
             accountButtonText = 'Панель курьера';
             targetPage = 'courier-dashboard-page';
        }

        const accountButton = document.createElement('button');
        accountButton.textContent = accountButtonText;
        accountButton.onclick = () => showPage(targetPage);
        userNav.appendChild(accountButton);

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Выйти';
        logoutButton.onclick = handleLogout;
        userNav.appendChild(logoutButton);
    } else {
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Вход';
        loginButton.onclick = () => showPage('login-page');
        userNav.appendChild(loginButton);

        const registerButton = document.createElement('button');
        registerButton.textContent = 'Регистрация';
        registerButton.onclick = () => showPage('register-page');
        userNav.appendChild(registerButton);
    }
}

// --- Функции Аутентификации (Имитация) ---

function handleLogin() {
    const email = document.getElementById('login-email').value;
    // !!! ВАЖНО: Это ИМИТАЦИЯ! Нет реальной проверки пароля.
    // В реальном приложении здесь будет запрос к серверу.
    if (email) { // Просто проверяем, что email введен
        console.warn("ИМИТАЦИЯ ВХОДА: Проверка пароля не выполняется!");
        loggedInUser = { type: 'customer', email: email };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Сохраняем имитацию сессии
        userNameDisplay.textContent = email; // Показываем email в кабинете
        showPage('account-page');
    } else {
        alert("Введите email");
    }
}

function handleRegister() {
     const name = document.getElementById('register-name').value;
     const email = document.getElementById('register-email').value;
     const phone = document.getElementById('register-phone').value;
     const password = document.getElementById('register-password').value;
     // !!! ВАЖНО: Это ИМИТАЦИЯ! Данные никуда не сохраняются.
     if (name && email && phone && password) {
          console.warn("ИМИТАЦИЯ РЕГИСТРАЦИИ: Данные не сохраняются!");
          // Сразу "логиним" пользователя после имитации регистрации
          loggedInUser = { type: 'customer', email: email };
          localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
          userNameDisplay.textContent = email;
          alert("Регистрация (имитация) прошла успешно! Вы вошли в систему.");
          showPage('account-page');
     } else {
          alert("Пожалуйста, заполните все поля для регистрации.");
     }
}


function handleCourierLogin() {
    const courierId = document.getElementById('courier-id').value;
    // !!! ВАЖНО: Это ИМИТАЦИЯ! Нет реальной проверки пароля.
    if (courierId) {
         console.warn("ИМИТАЦИЯ ВХОДА КУРЬЕРА: Проверка пароля не выполняется!");
         loggedInUser = { type: 'courier', id: courierId };
         localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Сохраняем имитацию сессии
         courierIdDisplay.textContent = courierId; // Показываем ID в дашборде
         showPage('courier-dashboard-page');
    } else {
         alert("Введите логин курьера");
    }
}

function handleLogout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser'); // Удаляем имитацию сессии
    showPage('catalog-page'); // Переходим на главную после выхода
}

// Проверка состояния входа при загрузке страницы
function checkLoginState() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        loggedInUser = JSON.parse(storedUser);
        if (loggedInUser.type === 'customer') {
             userNameDisplay.textContent = loggedInUser.email;
        } else if (loggedInUser.type === 'courier') {
              courierIdDisplay.textContent = loggedInUser.id;
        }
    } else {
        loggedInUser = null;
    }
    updateNav(); // Обновляем кнопки в шапке в любом случае
}

// --- Функции Корзины (без изменений, кроме используемых элементов) ---

function addToCart(id, name, price) {
    const existingItemIndex = cart.findIndex(item => item.id === id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ id: id, name: name, price: price, quantity: 1 });
    }
    updateCartView();
}

function updateCartView() {
    cartItemsContainer.innerHTML = ''; // Очищаем
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста.</p>';
        cartCountElement.textContent = '0';
    } else {
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>${item.quantity} шт.</span>
                <span>${item.price * item.quantity} грн</span>
                <button onclick="removeFromCart(${index})">Удалить</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalQuantity;
    }
    updateCartTotal();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartView();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
     if (cartTotalElement) {
         cartTotalElement.textContent = total;
    }
     if (checkoutTotalElement) {
         checkoutTotalElement.textContent = total;
    }
}

function submitOrder() {
    if (cart.length === 0) {
        alert("Ваша корзина пуста!");
        showPage('catalog-page');
        return;
    }
    // Имитация...
    console.log("Имитация отправки заказа...");
    document.getElementById('order-number').textContent = `#${Math.floor(Math.random() * 90000) + 10000}`;
    showPage('confirmation-page');
}

function clearCartOnConfirmation() {
    cart = [];
    updateCartView();
}

// --- Функции для Кабинетов (Демо-данные) ---

function renderOrderHistory() {
    orderHistoryContainer.innerHTML = ''; // Очищаем
    // !!! Демо-данные !!!
    const demoOrders = [
        { id: '#12344', date: '2025-04-27', total: 600, status: 'Доставлен' },
        { id: '#12321', date: '2025-04-25', total: 150, status: 'Доставлен' },
        { id: '#12100', date: '2025-04-20', total: 450, status: 'Доставлен' },
    ];

    if (demoOrders.length === 0) {
         orderHistoryContainer.innerHTML = '<p>У вас пока нет заказов.</p>';
         return;
    }

    demoOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-history-item');
        orderElement.innerHTML = `
            <p><strong>Заказ:</strong> ${order.id}</p>
            <p><strong>Дата:</strong> ${order.date}</p>
            <p><strong>Сумма:</strong> ${order.total} грн</p>
            <p><strong>Статус:</strong> ${order.status}</p>
        `;
         orderHistoryContainer.appendChild(orderElement);
    });
}

function renderAssignedOrders() {
    assignedOrdersContainer.innerHTML = ''; // Очищаем
     // !!! Демо-данные !!!
     const demoAssigned = [
          { id: '#12345', address: 'ул. Примерная, 1, кв. 5', time: '14:30', items: 'Роза красная (1), Тюльпан желтый (2)', phone: '+380991234567', status: 'new' },
          { id: '#12346', address: 'пр. Тестовый, 10, под. 2', time: '15:00', items: 'Мини-букет "Нежность" (1)', phone: '+380677654321', status: 'inprogress' },
          { id: '#12347', address: 'бул. Демонстрационный, 25', time: '16:00', items: 'Хризантема белая (3)', phone: '+380501122333', status: 'new' },
     ];

     if (demoAssigned.length === 0) {
          assignedOrdersContainer.innerHTML = '<p>Нет назначенных заказов.</p>';
          return;
     }

     demoAssigned.forEach((order, index) => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('assigned-order-item');
        // Добавляем кнопки статуса только если он 'new' или 'inprogress'
        let statusButtons = '';
        if (order.status === 'new') {
            statusButtons = `
                <button class="nav-button status-button-inprogress" onclick="updateOrderStatus(${index}, 'inprogress')">Взял в работу</button>
            `;
        } else if (order.status === 'inprogress') {
             statusButtons = `
                <button class="nav-button status-button-delivered" onclick="updateOrderStatus(${index}, 'delivered')">Доставлен</button>
            `;
        }


        orderElement.innerHTML = `
            <p><strong>Заказ:</strong> ${order.id}</p>
            <p><strong>Адрес:</strong> ${order.address}</p>
            <p><strong>Время (ориент.):</strong> ${order.time}</p>
            <p><strong>Телефон:</strong> <a href="tel:${order.phone}">${order.phone}</a></p> <p><strong>Состав:</strong> ${order.items}</p>
            <p><strong>Статус:</strong> <span id="status-${index}">${order.status === 'new' ? 'Новый' : (order.status === 'inprogress' ? 'В пути' : 'Доставлен')}</span></p>
            <div class="order-actions">
                ${statusButtons}
                </div>
        `;
          assignedOrdersContainer.appendChild(orderElement);
     });
}

// Имитация обновления статуса заказа курьером
function updateOrderStatus(orderIndex, newStatus) {
     // !!! ВАЖНО: Это ИМИТАЦИЯ! Статус меняется только на экране.
     console.warn(`ИМИТАЦИЯ: Статус заказа ${orderIndex} изменен на ${newStatus}`);
     // Здесь нужно было бы найти заказ в реальном списке и обновить его статус,
     // а затем перерисовать список или обновить конкретный элемент.
     // Для простоты, просто обновим текст и кнопки в этом демо:
     const statusSpan = document.getElementById(`status-${index}`);
     const orderItemDiv = statusSpan.closest('.assigned-order-item');
     const actionDiv = orderItemDiv.querySelector('.order-actions');

     if (newStatus === 'inprogress') {
         statusSpan.textContent = 'В пути';
         actionDiv.innerHTML = `<button class="nav-button status-button-delivered" onclick="updateOrderStatus(${orderIndex}, 'delivered')">Доставлен</button>`;
     } else if (newStatus === 'delivered') {
         statusSpan.textContent = 'Доставлен';
         actionDiv.innerHTML = ''; // Убираем кнопки после доставки
     }
     // В реальном приложении был бы запрос на сервер для обновления статуса в БД.
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState(); // Проверяем, залогинен ли кто-то (из localStorage)
    showPage('catalog-page'); // По умолчанию показываем каталог
    updateCartView(); // Инициализируем вид корзины
});
