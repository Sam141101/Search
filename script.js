
fetch('./data/data.json') // Đường dẫn tới file data.json
  .then(response => response.json())
  .then(data => {
    console.log('data', data);
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const groupSelect = document.getElementById('groupSelect');
    const timeSelect = document.getElementById('timeSelect');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsContainer1 = document.querySelector('.resultsContainer1');
    const languageSelect = document.getElementById('languageSelect');
    console.log('language--languageSelect', languageSelect.value);

    let viewsData = [];

    // ẩn hiển search-box
    const frame_search = document.querySelector(".search-container");
    const hiddens = document.querySelector(".block-search");
    hiddens.addEventListener("click", () => {
      frame_search.classList.toggle("active");
      if (frame_search.classList.contains("active")) {
        resultsContainer1.style.display = "block";
      } else {
        resultsContainer1.style.display = "none";
      }
      viewsData = data.views
      displayResults(viewsData);
    });

    // Lắng nghe sự thay đổi language
    languageSelect.addEventListener('change', function () {
      const selectedLanguage = languageSelect.value;
      console.log('selectedLanguage', selectedLanguage);
      changeLanguage(selectedLanguage);
      displayResults(viewsData);
    });


    // đổi language
    function changeLanguage(language) {
      console.log('language', language);
      if (language === 'vi') {
        searchInput.placeholder = 'Tìm kiếm theo tên...';
        // Thay đổi categories
        const optionElements = categorySelect.getElementsByTagName('option');
        for (let i = 0; i < optionElements.length; i++) {
          console.log('option', categorySelect.value)
          optionElements[i].textContent = data.categories[i].name_vi;
        }
        // Thay đổi groups
        const groupOptionElements = groupSelect.getElementsByTagName('option');
        for (let i = 0; i < groupOptionElements.length; i++) {
          groupOptionElements[i].textContent = data.groups[i].name_vi;
        }

        // Thay đổi times
        const timeSelectOptionElements = timeSelect.getElementsByTagName('option');
        // for (let i = 0; i < groupOptionElements.length; i++) {
        timeSelectOptionElements[0].textContent = 'Mốc thời gian';
        timeSelectOptionElements[1].textContent = 'Trước 12 giờ';
        timeSelectOptionElements[2].textContent = 'Sau 12 giờ';
        // }
      } else if (language === 'en') {
        searchInput.placeholder = 'Search by name...';
        // Thay đổi categories
        const optionElements = categorySelect.getElementsByTagName('option');
        for (let i = 0; i < optionElements.length; i++) {
          optionElements[i].textContent = data.categories[i].name_en;
        }
        // Thay đổi groups
        const groupOptionElements = groupSelect.getElementsByTagName('option');
        for (let i = 0; i < groupOptionElements.length; i++) {
          groupOptionElements[i].textContent = data.groups[i].name_en;
        }

        // Thay đổi times
        const timeSelectOptionElements = timeSelect.getElementsByTagName('option');
        timeSelectOptionElements[0].textContent = 'Timeline';
        timeSelectOptionElements[1].textContent = 'Before 12 hours';
        timeSelectOptionElements[2].textContent = 'After 12 hours';
      }
    }

    changeLanguage(languageSelect.value);

    // Tìm kiếm
    function searchViews() {
      const searchTerm = searchInput.value.toLowerCase();
      console.log('tìm kiếm', searchTerm)
      // danh sách phân loại
      const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
      console.log('lọc các phần tử', typeof selectedCategories, selectedCategories)

      console.log('selectedCategories', selectedCategories)

      const filteredViews = data.views
        .filter(view => view[`name_${languageSelect.value}`].toLowerCase().includes(searchTerm))
        .filter(view => Number(view.group_id) === Number(groupSelect.value))
        .filter(view => selectedCategories.length === 0 || view.categories.some(category => selectedCategories.includes(category)))
        .filter(view => {
          const h = view.capture_time.split(" ")[1];
          const mh = h.split(":");
          // console.log('time',  mh[0])
          if (timeSelect.value === "before") {
            console.log('Lấy các view với giờ nhỏ hơn 12')
            return mh[0] < 12; // Lấy các view với giờ nhỏ hơn 12
          } else if (timeSelect.value === "after") {
            console.log('Lấy các view với giờ lớn hơn 12')
            return mh[0] >= 12; // Lấy các view với giờ lớn hơn hoặc bằng 12
          } else {
            console.log('Không xét thời gian')
            return true; // Không áp dụng lọc theo thời gian
          }
        });
      viewsData = filteredViews
      displayResults(viewsData);
    }

    // Hiển thị
    function displayResults(views) {
      resultsContainer.innerHTML = '';

      if (views.length === 0) {
        resultsContainer.innerHTML = `<p>${languageSelect.value === 'vi' ? 'Không tìm thấy kết quả.' : 'No results found.'}</p>`;
        return;
      }

      let types = '';
      // let typeCate='';

      views.forEach(view => {
        for (let i = 0; i < view.categories.length; i++) {
          for (let j = 0; j < data.categories.length; j++) {
            if (view.categories[i] === data.categories[j].categories) {
              types = `${data.categories[j][`name_${languageSelect.value}`]}`
            }
          }
        }
        let info = '';
        let info1 = '';
        let info2 = '';
        if (languageSelect.value === 'vi') {
          info = 'Thời gian:'
          info1 = 'Nhóm View: Lầu'
          info2 = 'Phân loại:'
        } else {
          info = 'Time:'
          info2 = 'Categories:'
          info1 = 'Group View: Floor'
        }
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item', 'l-6', 'col', 'm-12', 'c-12');
        resultItem.innerHTML = `
      <div class="view-frame">
        <img class="img_view" src="${view.thumbnail}" />
        <div class="item_view-info">
          <h2>${view[`name_${languageSelect.value}`]}</h2>
          <div>${info1} ${view[`group_id`]}</div>
          <p>${info} ${view.capture_time}</p>
          <p>${info2} ${types}</p>
        </div>
      </div>
        `;
        resultsContainer.appendChild(resultItem);
      });
    }

    searchInput.addEventListener('keyup', searchViews);
    categorySelect.addEventListener('change', searchViews);
    groupSelect.addEventListener('change', searchViews);
    timeSelect.addEventListener('change', searchViews);

  });
