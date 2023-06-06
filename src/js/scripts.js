function showProjectsPanel() {
  hideAllPanels();
  document.getElementById("projects_panel").style.display = "block";
}
  
function showWorkersPanel() {
  hideAllPanels();
  document.getElementById("workers_panel").style.display = "block";
}
  
function showInventoryPanel(pageNumber='1') {
  hideAllPanels();
  document.getElementById("inventory_panel").style.display = "block";
  
// Получить список предметов с помощью AJAX-запроса
fetch('/equipment', {
  method: 'GET',
  credentials: 'include'
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Отобразить список предметов на панели склада
      displayEquipment(data.equipment, pageNumber);
    } else {
      console.error('Ошибка при получении списка предметов');
    }
  })
  .catch(error => {
    console.error('Ошибка при выполнении запроса:', error);
  });
}

function displayEquipment(equipment, pageNumber) {
  const inventoryPanel = document.getElementById("inventory_panel");
  inventoryPanel.innerHTML = ""; // Очистить содержимое панели склада

  const itemsPerPage = 10; // Количество предметов на странице
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = equipment.slice(startIndex, endIndex);

  // Создаем и добавляем кнопку добавления
  const addButton = document.createElement("button");
  addButton.id = "add_equipment_button";
  addButton.className = "add_button";
  addButton.innerHTML = "&plus;";
  addButton.addEventListener("click", () => showForm('add_equipment_form'));

  inventoryPanel.appendChild(addButton);

// Создать элементы для каждого предмета и добавить их на панель склада
currentPageItems.forEach(item => {
    const equipmentItem = document.createElement("div");
    equipmentItem.classList.add("equipment_item");
    equipmentItem.innerHTML = `
      <p class="item_name">${item.Equipment_Name}</p>
      <p class="item_quantity"> ${item.Quantity}</p>
      <button class="edit_button" data-equipmentId="${item.Equipment_ID}">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 24 24" style="fill:#FAB005;">
      <path d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 L 18.076172 9.9238281 L 14.076172 5.9238281 z"></path>
      </svg>
      </button>
      <button class="delete_button" data-equipmentId="${item.Equipment_ID}">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48" style="fill:#FA5252;">
      <path d="M 24 4 C 20.704135 4 18 6.7041348 18 10 L 7.5 10 A 1.50015 1.50015 0 1 0 7.5 13 L 10 13 L 10 38.5 C 10 41.533 12.467 44 15.5 44 L 32.5 44 C 35.533 44 38 41.533 38 38.5 L 38 13 L 40.5 13 A 1.50015 1.50015 0 1 0 40.5 10 L 30 10 C 30 6.7041348 27.295865 4 24 4 z M 24 7 C 25.674135 7 27 8.3258652 27 10 L 21 10 C 21 8.3258652 22.325865 7 24 7 z M 19.5 18 C 20.328 18 21 18.672 21 19.5 L 21 34.5 C 21 35.328 20.328 36 19.5 36 C 18.672 36 18 35.328 18 34.5 L 18 19.5 C 18 18.672 18.672 18 19.5 18 z M 28.5 18 C 29.328 18 30 18.672 30 19.5 L 30 34.5 C 30 35.328 29.328 36 28.5 36 C 27.672 36 27 35.328 27 34.5 L 27 19.5 C 27 18.672 27.672 18 28.5 18 z"></path>
      </svg>
      </button>
      <button class="increase_button" data-equipmentId="${item.Equipment_ID}">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 32 32" style="fill:#228BE6;">
      <path d="M 16 3 C 8.832031 3 3 8.832031 3 16 C 3 23.167969 8.832031 29 16 29 C 23.167969 29 29 23.167969 29 16 C 29 8.832031 23.167969 3 16 3 Z M 16 5 C 22.085938 5 27 9.914063 27 16 C 27 22.085938 22.085938 27 16 27 C 9.914063 27 5 22.085938 5 16 C 5 9.914063 9.914063 5 16 5 Z M 15 10 L 15 15 L 10 15 L 10 17 L 15 17 L 15 22 L 17 22 L 17 17 L 22 17 L 22 15 L 17 15 L 17 10 Z"></path>
      </svg>
      </button>
      <button class="decrease_button" data-equipmentId="${item.Equipment_ID}">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 32 32" style="fill:#228BE6;">
      <path d="M 16 3 C 8.832031 3 3 8.832031 3 16 C 3 23.167969 8.832031 29 16 29 C 23.167969 29 29 23.167969 29 16 C 29 8.832031 23.167969 3 16 3 Z M 16 5 C 22.085938 5 27 9.914063 27 16 C 27 22.085938 22.085938 27 16 27 C 9.914063 27 5 22.085938 5 16 C 5 9.914063 9.914063 5 16 5 Z M 10 15 L 22 15 L 22 17 L 10 17 Z"></path>
      </svg>
      </button>
    `;
    const editButton = equipmentItem.querySelector(".edit_button");
    const deleteButton = equipmentItem.querySelector(".delete_button");
    const increaseButton = equipmentItem.querySelector(".increase_button");
    const decreaseButton = equipmentItem.querySelector(".decrease_button");

    editButton.addEventListener("click", () => editEquipment(editButton));
    deleteButton.addEventListener("click", () => deleteEquipment(deleteButton));
    increaseButton.addEventListener("click", () => increaseQuantity(increaseButton));
    decreaseButton.addEventListener("click", () => decreaseQuantity(decreaseButton));

    inventoryPanel.appendChild(equipmentItem);
  });

// Добавляем элементы управления пагинацией
const totalPages = Math.ceil(equipment.length / itemsPerPage);

const paginationContainer = document.createElement('div');
paginationContainer.classList.add('pagination');

for (let i = 1; i <= totalPages; i++) {
  const pageButton = document.createElement('button');
  pageButton.textContent = i;
  pageButton.classList.add('page_button');
  if (i === pageNumber) {
    pageButton.classList.add('active');
  }
  pageButton.addEventListener('click', () => showInventoryPanel(i));
  paginationContainer.appendChild(pageButton);
}

inventoryPanel.appendChild(paginationContainer);
}
  

function showForm(formId) {
  const form = document.getElementById(formId);
  form.classList.add("active"); // Показываем форму
  document.getElementById("overlay").classList.add("active"); // Показываем overlay
  document.body.style.overflow = "hidden"; // Запрещаем прокрутку страницы
}

function hideOverlay() {
  hideForm("add_equipment_form");
  hideForm("edit_equipment_form");
  hideForm("increase_quantity_form");
  hideForm("decrease_quantity_form");
}

function hideForm(formId) {
  const form = document.getElementById(formId);
  if (form && form.classList.contains("active")) {
    form.classList.remove("active"); // Удаляем класс "active" у формы
    document.getElementById("overlay").classList.remove("active"); // Скрываем overlay
    document.body.style.overflow = "auto"; // Восстанавливаем прокрутку страницы

    // Очистить поля ввода активной формы
    if (form.id === "add_equipment_form") {
      document.getElementById("equipment_name_input").value = "";
      document.getElementById("quantity_input").value = "";
    }
    if (form.id === "increase_quantity_form") {
      document.getElementById("quantity_increase").value = "";
    }
  }
}


function addEquipment() {
    const equipmentName = document.getElementById("equipment_name_input").value;
    const quantity = document.getElementById("quantity_input").value;

    const nameInput = document.getElementById("edit_equipment_name");
    
    // Проверка на отрицательное значение
    if (equipmentName === "") {
      alert("Назва обов'язкова");
      return; // Останавливает выполнение функции
    }

    // Отправить данные на сервер для добавления оборудования в таблицу Equipment
    fetch('/add-equipment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipmentName, quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Оборудование успешно добавлено
            console.log('Оборудование успешно добавлено');
            // Очистить поля ввода
            document.getElementById("equipment_name_input").value = "";
            document.getElementById("quantity_input").value = "";
            // Скрыть форму
            hideForm("add_equipment_form");
            const lastPage = Math.ceil(data.totalCount / 10);
            // Отобразить последнюю страницу инвентаря
            showInventoryPanel(lastPage);
        } else {
            // Произошла ошибка при добавлении оборудования
            console.error('Ошибка при добавлении оборудования');
        }
    })
    .catch(error => {
        console.error('Ошибка при выполнении запроса:', error);
    });
}

function deleteEquipment(button) {
  const equipmentId = button.getAttribute("data-equipmentId");
  // Отправить запрос на сервер для удаления оборудования из таблицы Equipment
  fetch('/delete-equipment', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json'
  },
  body: JSON.stringify({equipmentId})
  })
  .then(response => response.json())
  .then(data => {
  if (data.success) {
  // Оборудование успешно удалено
  console.log('Оборудование успешно удалено');
  // Обновить список оборудования
  showInventoryPanel();
  } else {
  // Произошла ошибка при удалении оборудования
  console.error('Ошибка при удалении оборудования');
  }
  })
  .catch(error => {
  console.error('Ошибка при выполнении запроса:', error);
  });
  }

  function editEquipment(button) {
    const equipmentId = button.getAttribute("data-equipmentId");
    // Отобразить форму редактирования
    showForm("edit_equipment_form");
    // Заполнить форму редактирования значениями текущего оборудования
    document.getElementById("edit_equipment_name").value = button.parentNode.querySelector(".item_name").textContent;
    document.getElementById("edit_equipment_quantity").value = button.parentNode.querySelector(".item_quantity").textContent.trim();
    const saveButton = document.getElementById("edit_equipment_form").querySelector("button");
    // Проверить наличие обработчика события и удалить его, если он существует
    if (saveButton.onclick) {
      saveButton.removeEventListener("click", saveButton.onclick);
    }
    // Установить новый обработчик события для кнопки "Сохранить"
    saveButton.onclick = () => {
      const nameInput = document.getElementById("edit_equipment_name").value;
    
      // Проверка на отрицательное значение
      if (nameInput === "") {
        alert("Назва обов'язкова");
        return; // Останавливает выполнение функции
      }
      saveEditedEquipment(equipmentId);
    };
  }

  function increaseQuantity(button) {
    const equipmentId = button.getAttribute("data-equipmentId");
    // Отобразить форму редактирования
    showForm("increase_quantity_form");
    const saveButton = document.getElementById("increase_quantity_form").querySelector("button");
    // Проверить наличие обработчика события и удалить его, если он существует
    if (saveButton.onclick) {
      saveButton.removeEventListener("click", saveButton.onclick);
    }
    // Установить новый обработчик события для кнопки "Сохранить"
    saveButton.onclick = () => {
      const quantityInput = document.getElementById("quantity_increase").value;
    
      // Проверка на отрицательное значение
      if (quantityInput < 0) {
        alert("Введіть додатнє число");
        return; // Останавливает выполнение функции
      }
      saveIncreasedQuantity(equipmentId);
    };
  }

  function decreaseQuantity(button) {
    const equipmentId = button.getAttribute("data-equipmentId");
    // Отобразить форму редактирования
    showForm("decrease_quantity_form");
    const saveButton = document.getElementById("decrease_quantity_form").querySelector("button");
    // Проверить наличие обработчика события и удалить его, если он существует
    if (saveButton.onclick) {
      saveButton.removeEventListener("click", saveButton.onclick);
    }
    // Установить новый обработчик события для кнопки "Сохранить"
    saveButton.onclick = () => {
      const quantityInput = document.getElementById("quantity_decrease").value;
    
      // Проверка на отрицательное значение
      if (quantityInput < 0) {
        alert("Введіть додатнє число");
        return; // Останавливает выполнение функции
      }
      saveDecreasedQuantity(equipmentId);
    };
  }

  function saveEditedEquipment(equipmentId) {
    const equipmentName = document.getElementById("edit_equipment_name").value;
    const quantity = document.getElementById("edit_equipment_quantity").value;
  
    // Отправить данные на сервер для сохранения отредактированного оборудования
    fetch('/edit-equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ equipmentId, equipmentName, quantity })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Оборудование успешно отредактировано
          console.log('Оборудование успешно отредактировано');
          // Очистить форму редактирования
          document.getElementById("edit_equipment_name").value = "";
          document.getElementById("edit_equipment_quantity").value = "";
          // Скрыть форму редактирования
          hideForm("edit_equipment_form");
          // Обновить список оборудования
          showInventoryPanel();
        } else {
          // Произошла ошибка при редактировании оборудования
          console.error('Ошибка при редактировании оборудования');
        }
      })
      .catch(error => {
        console.error('Ошибка при выполнении запроса:', error);
      });
  }

  function saveDecreasedQuantity(equipmentId) {
    const quantityDecrease = document.getElementById("quantity_decrease").value;
    
      // Отправляем данные на сервер
      fetch('/decrease-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipmentId, quantityDecrease })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Количество успешно увеличено
          console.log('Количество успешно уменьшено');
          // Скрыть форму редактирования
          hideForm("decrease_quantity_form");
          // Обновить список оборудования
          showInventoryPanel();
        } else {
          // Произошла ошибка при увеличении количества
          console.error('Ошибка при уменьшении количества');
        }
      })
      .catch(error => {
        console.error('Ошибка при выполнении запроса:', error);
      });
    }

function saveIncreasedQuantity(equipmentId) {
const quantityIncrease = document.getElementById("quantity_increase").value;

  // Отправляем данные на сервер
  fetch('/increase-quantity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ equipmentId, quantityIncrease })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Количество успешно увеличено
      console.log('Количество успешно увеличено');
      // Скрыть форму редактирования
      hideForm("increase_quantity_form");
      // Обновить список оборудования
      showInventoryPanel();
    } else {
      // Произошла ошибка при увеличении количества
      console.error('Ошибка при увеличении количества');
    }
  })
  .catch(error => {
    console.error('Ошибка при выполнении запроса:', error);
  });
}

function hideAllPanels() {
    var panels = document.getElementsByClassName("panel");
    for (var i = 0; i < panels.length; i++) {
        panels[i].style.display = "none";
    }
}

function getAdministratorData() {
    fetch('/administrator', {
      method: 'GET',
      credentials: 'include' // Включение отправки сохраненных куки
    })
      .then(response => response.json())
      .then(data => {
        // Обработка полученных данных
        if (data.success) {
          // Данные получены успешно
          const administratorData = data.administratorData;
          // Отобразить данные пользователю
          displayAdministratorData(administratorData);
        } else {
          // Произошла ошибка
          console.error('Ошибка при получении данных пользователя');
        }
      })
      .catch(error => {
        console.error('Ошибка при выполнении запроса:', error);
      });
  }
  
function displayAdministratorData(administratorData) {
    // Отобразить данные пользователя на странице
    const nameElement = document.getElementById('admin_name');

    if(administratorData.middleName) {
      nameElement.textContent = administratorData.surname + " " + administratorData.name + " " + administratorData.middleName;
    }
    else {
      nameElement.textContent = administratorData.surname + " " + administratorData.name;
    }
  }
  
  // Вызов функции для получения данных пользователя
  getAdministratorData();

  // Получение ссылки на кнопку выхода
const logoutButton = document.getElementById('logout_button');

// Обработчик события для кнопки выхода
logoutButton.addEventListener('click', () => {
  // Выполнение GET-запроса на выход из учетной записи
  fetch('/logout', {
    method: 'GET',
    credentials: 'same-origin'
  })
    .then(response => {
      if (response.ok) {
        // Перенаправление на страницу авторизации
        window.location.href = '/login';
      } else {
        console.error('Ошибка при выходе из учетной записи');
      }
    })
    .catch(error => {
      console.error('Ошибка при выходе из учетной записи: ', error);
    });
});