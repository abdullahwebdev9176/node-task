let checkedItemsValues = [];
let selectedBrands = [];
let selectedModels = [];
let selectedSeries = [];
let selectedLengthRange = { min: 0, max: 100 };
let selectedYearRange = { min: 0, max: 100 };

let skipBoats = 12;
const limitBoats = 12;

let wantUpdateFilter = false;

function savedFilter() {
    const filterData = {
        conditions: checkedItemsValues,
        brands: selectedBrands,
        models: selectedModels,
        series: selectedSeries,
        lengthRange: selectedLengthRange,
        yearRange: selectedYearRange
    };
    sessionStorage.setItem('boatFilters', JSON.stringify(filterData));
}

function selectedFilters() {
    const container = $('#selected-filters');
    const section = $('#selected-filters-section');
    let filtersHTML = '';

    checkedItemsValues.forEach(condition => {
        filtersHTML += `
            <li data-type="condition" data-value="${condition}">
                <span>${condition}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    });

    selectedBrands.forEach(brand => {
        filtersHTML += `
            <li data-type="brand" data-value="${brand}">
                <span>${brand}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    });

    selectedModels.forEach(model => {
        filtersHTML += `
            <li data-type="model" data-value="${model}">
                <span>${model}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    });

    selectedSeries.forEach(series => {
        filtersHTML += `
            <li data-type="series" data-value="${series}">
                <span>${series}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    });

    const minDefault = parseInt($("#minVal").data("minlength")) || 0;
    const maxDefault = parseInt($("#maxVal").data("maxlength")) || 100;
    
    if (selectedLengthRange.min !== minDefault || selectedLengthRange.max !== maxDefault) {
        filtersHTML += `
            <li data-type="length" data-value="${selectedLengthRange.min}-${selectedLengthRange.max}">
                <span>Length: ${selectedLengthRange.min} - ${selectedLengthRange.max}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    }

    const minYearDefault = parseInt($("#minYearVal").data("minyear")) || 0;
    const maxYearDefault = parseInt($("#maxYearVal").data("maxyear")) || 100;
    
    if (selectedYearRange.min !== minYearDefault || selectedYearRange.max !== maxYearDefault) {
        filtersHTML += `
            <li data-type="year" data-value="${selectedYearRange.min}-${selectedYearRange.max}">
                <span>Year: ${selectedYearRange.min} - ${selectedYearRange.max}</span>
                <span class="fa fa-close close-filter"></span>
            </li>
        `;
    }

    if (filtersHTML) {
        container.html(filtersHTML);
        section.show();
    } else {
        section.hide();
    }
}

function removeSelectedFilter(type, value) {
    if (type === 'condition') {
        checkedItemsValues = checkedItemsValues.filter(item => item !== value);
        $(`.condition-item[value="${value}"]`).prop('checked', false);
    } else if (type === 'brand') {
        selectedBrands = selectedBrands.filter(item => item !== value);
        $(`.brand-item[value="${value}"]`).prop('checked', false);
    } else if (type === 'model') {
        selectedModels = selectedModels.filter(item => item !== value);
        $(`.model-item[value="${value}"]`).prop('checked', false);
    } else if (type === 'series') {
        selectedSeries = selectedSeries.filter(item => item !== value);
        $(`.series-item[value="${value}"]`).prop('checked', false);
    } 
    else if (type === 'length') {
        const minDefault = parseInt($("#minVal").data("minlength")) || 0;
        const maxDefault = parseInt($("#maxVal").data("maxlength")) || 100;
        
        selectedLengthRange = { min: minDefault, max: maxDefault };
        if ($("#rangeSlider").length && $("#rangeSlider").hasClass('ui-slider')) {
            $("#rangeSlider").slider("values", [minDefault, maxDefault]);
            $("#minVal").text(minDefault);
            $("#maxVal").text(maxDefault);
        }
    }

    else if (type === 'year') {
        const minDefault = parseInt($("#minYearVal").data("minyear")) || 0;
        const maxDefault = parseInt($("#maxYearVal").data("maxyear")) || 100;
        
        selectedYearRange = { min: minDefault, max: maxDefault };
        if ($("#yearRangeSlider").length && $("#yearRangeSlider").hasClass('ui-slider')) {
            $("#yearRangeSlider").slider("values", [minDefault, maxDefault]);
            $("#minYearVal").text(minDefault);
            $("#maxYearVal").text(maxDefault);
        }
    }

    savedFilter();
    selectedFilters();
    setFilterUpdate();
    fetchedBoats();
}

$(document).on('click', '.close-filter', function() {
    const filterItem = $(this).parent();
    const type = filterItem.data('type');
    const value = filterItem.data('value');
    
    removeSelectedFilter(type, value);
});

function loadFilters() {

    console.log('loading filters');
    const saved = sessionStorage.getItem('boatFilters');
    if (saved) {
        const filterData = JSON.parse(saved);
        checkedItemsValues = filterData.conditions || [];
        selectedBrands = filterData.brands || [];
        selectedModels = filterData.models || [];
        selectedSeries = filterData.series || [];
        selectedLengthRange = filterData.lengthRange || { min: 0, max: 100 };
        selectedYearRange = filterData.yearRange || { min: 0, max: 100 };
        
        applyFiltersToUI();
        selectedFilters();
        
        if (checkedItemsValues.length > 0 || selectedBrands.length > 0 || selectedModels.length > 0 || selectedSeries.length > 0) {
            fetchedBoats();
        }
    }
}

function clearfilter() {
    sessionStorage.removeItem('boatFilters');
}

function applyFiltersToUI() {
    checkedItemsValues.forEach(value => {
        const checkbox = $(`.condition-item[value="${value}"]`);
        if (checkbox) checkbox.prop('checked', true);
    });
    
    selectedBrands.forEach(brand => {
        const checkbox = $(`.brand-item[value="${brand}"]`);
        if (checkbox) checkbox.prop('checked', true);
    });

    selectedModels.forEach(model => {
        const checkbox = $(`.model-item[value="${model}"]`);
        if (checkbox) checkbox.prop('checked', true);
    });

    selectedSeries.forEach(series => {
        const checkbox = $(`.series-item[value="${series}"]`);
        if (checkbox) checkbox.prop('checked', true);
    });

    if ($("#rangeSlider").length && $("#rangeSlider").hasClass('ui-slider')) {
        $("#rangeSlider").slider("values", [selectedLengthRange.min, selectedLengthRange.max]);
        $("#minVal").text(selectedLengthRange.min);
        $("#maxVal").text(selectedLengthRange.max);
    }

    if ($("#yearRangeSlider").length && $("#yearRangeSlider").hasClass('ui-slider')) {
        $("#yearRangeSlider").slider("values", [selectedYearRange.min, selectedYearRange.max]);
        $("#minYearVal").text(selectedYearRange.min);
        $("#maxYearVal").text(selectedYearRange.max);
    }
}

function setFilterUpdate() {
    wantUpdateFilter = true;
}

function resetFilters() {
    let conditionItems = document.querySelectorAll('.condition-item');
    let brandItems = document.querySelectorAll('.brand-item');
    let modelItems = document.querySelectorAll('.model-item');

    conditionItems.forEach(item => item.checked = false);
    brandItems.forEach(item => item.checked = false);
    modelItems.forEach(item => item.checked = false);

    let minLength = $("#minVal").data("minlength") || 0;
    let maxLength = $("#maxVal").data("maxlength") || 100;
    let minYear = $("#minYearVal").data("minyear") || 0;
    let maxYear = $("#maxYearVal").data("maxyear") || 100;

    checkedItemsValues = [];
    selectedBrands = [];
    selectedModels = [];
    selectedSeries = [];
    selectedLengthRange = { min: minLength, max: maxLength };
    selectedYearRange = { min: minYear, max: maxYear };

    clearfilter();
    selectedFilters();
    setFilterUpdate();

    if ($("#rangeSlider").length) {
        $("#rangeSlider").slider("values", [minLength, maxLength]);
        $("#minVal").text(minLength);
        $("#maxVal").text(maxLength);
    }

    if ($("#yearRangeSlider").length) {
        $("#yearRangeSlider").slider("values", [minYear, maxYear]);
        $("#minYearVal").text(minYear);
        $("#maxYearVal").text(maxYear);
    }

    fetchedBoats();
}

function handleConditionClick(e) {

    const clicked = e.target.value;

    const all = document.getElementById('condition-all');
    const items = document.querySelectorAll('.condition-item');

    const itemsArray = [...items];

    if (clicked === 'all') {
        itemsArray.forEach(item => item.checked = false);
    } else {
        const anyChecked = itemsArray.some(item => item.checked);
        all.checked = !anyChecked;
    }

    const checkedItems = itemsArray.filter((i) => {
        return i.checked;
    })

    checkedItemsValues = checkedItems.map((i) => {
        return i.value;
    })

    savedFilter();
    selectedFilters();
    setFilterUpdate();
    fetchedBoats()
}

function handleBrandClick(e) {

    const brandItems = document.querySelectorAll('.brand-item');

    const brandArray = [...brandItems];

    selectedBrands = brandArray
        .filter(item => item.checked)
        .map(item => item.value);

    savedFilter();
    selectedFilters();
    setFilterUpdate();
    fetchedBoats()
    console.log(selectedBrands)

}

function handleModelClick(e) {
    const modelItems = document.querySelectorAll('.model-item');

    const modelArray = [...modelItems];

    selectedModels = modelArray.filter((item) => {
        return item.checked;
    }).map((item) => {
        return item.value;
    })

    savedFilter();
    selectedFilters();
    fetchedBoats();

}

async function fetchedBoats() {

    const payload = {
        condition: checkedItemsValues,
        brands: selectedBrands,
        models: selectedModels,
        series: selectedSeries,
        lengthRange: selectedLengthRange,
        yearRange: selectedYearRange
    }
    try {
        const response = await fetch('/get-boats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Boats fetched');
            const data = await response.json();
            console.log(data);
            let boatLength = data.filterData.length;

            $('#boat-count').text(`${boatLength} boats found`);
            renderBoats(data.boats);
            
            if (wantUpdateFilter) {
                updatedFilters(data.filterData);
                wantUpdateFilter = false;
            }

            if (data.boats.length === 0) {
                $('#boat-listings').html('<p class="text-center">No boats found.</p>');
            }
        } else {
            console.error('Boat fetching failed');
        }

    } catch (error) {
        console.error('Error fetching boats:', error);
    }
}

function handleSeriesClick(e) {
    const seriesItems = document.querySelectorAll('.series-item');

    const seriesArray = [...seriesItems];

    selectedSeries = seriesArray.filter((item) => {
        return item.checked;
    }).map((item) => {
        return item.value;
    })

    savedFilter();
    selectedFilters();
    fetchedBoats();

}

async function loadMoreBoats() {

    try {

        const currentPage = $('#load-more').attr('current-page');
        const skipedBoats = currentPage * limitBoats;
        const pageUrl = $('#load-more').attr('page-url');

        console.log('current page', currentPage);
        console.log('skip boats', skipedBoats);
        const payload = {
            condition: checkedItemsValues,
            brands: selectedBrands,
            models: selectedModels,
            series: selectedSeries,
            lengthRange: selectedLengthRange,
            yearRange: selectedYearRange,
            skip:skipedBoats,
            limit:limitBoats
        }

        const response = await fetch(`${pageUrl}?skip=${skipedBoats}&limit=${limitBoats}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('boats length', data.boats.length);
            renderLoadMoreBoats(data.boats);
            skipedBoats = skipedBoats + limitBoats;

            console.log('skip boats', skipedBoats);

        } else {
            console.error('load more failed');
        }
    } catch (error) {
        console.error('something went wrong');
    }
}

let currentPage = 1;

async function boatsPagination() {

    const payload = {
        condition: checkedItemsValues,
        brands: selectedBrands,
        models: selectedModels,
        series: selectedSeries,
        lengthRange: selectedLengthRange,
        yearRange: selectedYearRange,
        page: currentPage
    }

    // console.log('pagination payload', payload);

    const response = await fetch(`/boats-pagination`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const data = await response.json();
        console.log('boats pagination data', data.boats);
        console.log('total boats', data.totalsBoats);
        console.log('totalPages', data.totalPages);

        renderBoats(data.boats);
        renderPagination(data);
    }
}

let boat_search_value = '';
let sort_by_value = '';

$('#boatSearch').on('keyup', function(e) {

    if (e.key === 'Enter') {
        boat_search_value = $(this).val().trim();
        boatSearch(boat_search_value, sort_by_value);
        console.log('search boat: ', boat_search_value);
        $(this).val('');
    }

})

$('#sortBy').on('change', function() {

    sort_by_value = $(this).val();
    console.log('sort by value', sort_by_value);
    boatSearch(boat_search_value, sort_by_value);
})

async function boatSearch(searchValue, sortByValue) {
    try{

        const response = await fetch('/boat-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchValue, sortByValue })
        });

        const data = await response.json();
        console.log('searched result', data);
        $('#boat-count').text(`${data.boats.length} boats found`);
        renderBoats(data.boats);

    }catch(error) {
        console.error('Error fetching boats:', error);
    }
}

const pagination = $('#pagination');

function renderPagination(data) {

    console.log('render pagination', data);

    if (pagination.length) {
        pagination.html('');

        for (let i = 1; i <= data.totalPages; i++) {
            pagination.append(`
        <li class="page-item page-btn ${i === currentPage ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a></li>`);
        }
    }

}

if (pagination.length) {
    pagination.on('click', '.page-link', (e) => {

        console.log('pagination clicked');
        e.preventDefault();

        const page = $(e.target).data('page');
        if (!page) return;

        currentPage = parseInt(page);

        console.log('current page', currentPage);
        boatsPagination();
    })
}

$(document).ready(function () {

    let minLength = $("#minVal").data("minlength") || 0;
    let maxLength = $("#maxVal").data("maxlength") || 100;
    let minYear = $("#minYearVal").data("minyear") || 0;
    let maxYear = $("#maxYearVal").data("maxyear") || 100;

    console.log('min length', minLength);
    console.log('max length', maxLength);
    console.log('min year', minYear);
    console.log('max year', maxYear);

    selectedLengthRange = { min: minLength, max: maxLength };
    selectedYearRange = { min: minYear, max: maxYear };

    $("#rangeSlider").slider({
        range: true,
        min: minLength,
        max: maxLength,
        values: [minLength, maxLength],
        step: 1,

        slide: function (event, ui) {
            $("#minVal").text(ui.values[0]);
            $("#maxVal").text(ui.values[1]);

            selectedLengthRange = {
                min: ui.values[0],
                max: ui.values[1]
            };

            savedFilter();
            selectedFilters();
            setFilterUpdate();
            fetchedBoats();
        }
    });

    $("#yearRangeSlider").slider({
        range: true,
        min: minYear,
        max: maxYear,
        values: [minYear, maxYear],
        step: 1,

        slide: function (event, ui) {
            console.log('year range slide', ui.values);
            $("#minYearVal").text(ui.values[0]);
            $("#maxYearVal").text(ui.values[1]);

            selectedYearRange = {
                min: ui.values[0],
                max: ui.values[1]
            };

            savedFilter();
            selectedFilters();
            setFilterUpdate();
            fetchedBoats();
        }
    });

    loadFilters();

});

function renderBoats(boats) {
    const boatContainer = $('#boat-listings');

    const boatCards = boats.map((boat) => {
        return `<div class="col-lg-4 boat-card">
                    <div class="boats-image">
                        <a href="/boat-details/${boat._id}">
                            <img src="${boat.thumbnail_image}" alt="${boat.title}">
                        </a>
                    </div>
                    <div class="boat-card-body">
                        <h3 class="boat-card-title"><a href="/boat-details/${boat._id}">${boat.title}</a></h3>

                        <ul class="card-specs">
                            ${boat.condition ? `<li class="specs-item">${boat.condition}</li>` : ''}
                            ${boat.length ? `<li class="specs-item">${boat.length}' ft</li>` : ''}
                        </ul>

                        ${boat.price ? `<p class="boat-card-price">Price: ${boat.price}</p>` : '<p class="boat-card-price">Call For Price</p>'}
                    </div>
                </div>
                `;
    }).join('');

    boatContainer.html(boatCards);
}

function renderLoadMoreBoats(boats) {
    const boatContainer = $('#boat-listings');

    const boatCards = boats.map((boat) => {
        return `<div class="col-lg-4 boat-card">
                    <div class="boats-image">
                        <a href="/boat-details/${boat._id}">
                            <img src="${boat.thumbnail_image}" alt="${boat.title}">
                        </a>
                    </div>
                    <div class="boat-card-body">
                        <h3 class="boat-card-title"><a href="/boat-details/${boat._id}">${boat.title}</a></h3>

                        <ul class="card-specs">
                            ${boat.condition ? `<li class="specs-item">${boat.condition}</li>` : ''}
                            ${boat.length ? `<li class="specs-item">${boat.length}' ft</li>` : ''}
                        </ul>
                        
                        ${boat.price ? `<p class="boat-card-price">Price: ${boat.price}</p>` : 'Call For Price'}
                    </div>
                </div>
                `;
    }).join('');

    boatContainer.append(boatCards);
}

function updatedFilters(boats) {

    const brands = [...new Set(boats.map(boat => boat.make.trim()))];
    const condition = [...new Set(boats.map(boat => boat.condition.trim()))];
    const models = [...new Set(boats.map(boat => boat.model.trim()))];
    const length = [...new Set(boats.map(boat => boat.length.trim()))];

    const minLength = Math.min(...length);
    const maxLength = Math.max(...length);

    console.log('min length', minLength);
    console.log('max length', maxLength);

    $("#minVal").text(minLength);
    $("#maxVal").text(maxLength);
    selectedLengthRange = { min: minLength, max: maxLength };

    // console.log('updated brands', models);

    // brandFilter(brands);
    modelFilter(models);
    lengthFilter(minLength, maxLength);

}

function brandFilter(availableBrands) {

    console.log('available brands', availableBrands);

    const brandContainer = document.querySelector('#brand-list');

    const availableBrandsHTML = availableBrands.map((brand) => {

        return `
            <label>
                <input type="checkbox" class="brand-item" value="${brand}"
                    onclick="handleBrandClick(event)"> ${brand}
            </label>
        `
    })

    brandContainer.innerHTML = availableBrandsHTML.join('');
}

function modelFilter(availableModels) {

    const modelContainer = document.querySelector('#model-list');

    const availableModelsHTML = availableModels.map((model) => {
        return `
            <label>
                <input type="checkbox" class="model-item" value="${model}"
                    onclick="handleModelClick(event)"> ${model}
            </label>
        `
    })

    modelContainer.innerHTML = availableModelsHTML.join('');
}

function lengthFilter(minLength, maxLength) {

    if ($("#rangeSlider").length) {

        $("#rangeSlider").slider("values", [minLength, maxLength]);
        $("#minVal").text(minLength);
        $("#maxVal").text(maxLength);
    }
}

function yearFilter(minYear, maxYear) {

    if ($("#yearRangeSlider").length) {

        $("#yearRangeSlider").slider("values", [minYear, maxYear]);
        $("#minYearVal").text(minYear);
        $("#maxYearVal").text(maxYear);
    }
}