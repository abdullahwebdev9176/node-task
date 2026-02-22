let checkedItemsValues = [];
let selectedBrands = [];
let selectedModels = [];
let selectedLengthRange = { min: 0, max: 100 };

let wantUpdateFilter = false;
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

    checkedItemsValues = [];
    selectedBrands = [];
    selectedModels = [];
    selectedLengthRange = { min: minLength, max: maxLength };

    setFilterUpdate();

    if ($("#rangeSlider").length) {
        $("#rangeSlider").slider("values", [minLength, maxLength]);
        $("#minVal").text(minLength);
        $("#maxVal").text(maxLength);
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

    setFilterUpdate();
    fetchedBoats()
}

function handleBrandClick(e) {

    const brandItems = document.querySelectorAll('.brand-item');

    const brandArray = [...brandItems];

    selectedBrands = brandArray
        .filter(item => item.checked)
        .map(item => item.value);

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

    fetchedBoats();

}

async function fetchedBoats() {

    const payload = {
        condition: checkedItemsValues,
        brands: selectedBrands,
        models: selectedModels,
        lengthRange: selectedLengthRange
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

let skipBoats = 12;
const limitBoats = 12;

async function loadMoreBoats() {

    try {

        const payload = {
            condition: checkedItemsValues,
            brands: selectedBrands,
            models: selectedModels,
            lengthRange: selectedLengthRange,
            skip:skipBoats,
            limit:limitBoats
        }

        const response = await fetch(`/load-more-boats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('boats length', data.boats.length);
            renderLoadMoreBoats(data.boats);
            skipBoats = skipBoats + limitBoats;

            console.log('skip boats', skipBoats);

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
        lengthRange: selectedLengthRange,
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

$('#boatSearch').on('keyup', function(e) {

    if (e.key === 'Enter') {
        const boat_search_value = $(this).val();
        boatSearch(boat_search_value.trim());
        console.log('search boat: ', boat_search_value);
        $(this).val('');
    }

})

async function boatSearch(searchValue) {
    try{

        const response = await fetch('/boat-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchValue })
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

    selectedLengthRange = { min: minLength, max: maxLength };

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

            setFilterUpdate();
            fetchedBoats();
        }
    });

})

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
                        ${boat.price ? `<p class="boat-card-price">Price: ${boat.price}</p>` : 'Call For Price'}
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
        $("#rangeSlider").slider("option", "min", minLength);
        $("#rangeSlider").slider("option", "max", maxLength);
        $("#rangeSlider").slider("values", [minLength, maxLength]);
        $("#minVal").text(minLength);
        $("#maxVal").text(maxLength);
    }
}