let checkedItemsValues = [];
let selectedBrands = [];
let selectedModels = [];
let selectedLengthRange = { min: 0, max: 100 };

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
}

function handleBrandClick(e) {

    const brandItems = document.querySelectorAll('.brand-item');

    const brandArray = [...brandItems];

    selectedBrands = brandArray
        .filter(item => item.checked)
        .map(item => item.value);

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
            let boatLength = data.boats.length;
            $('#boat-count').text(`${boatLength} boats found`);
            renderBoats(data.boats);
            updatedFilters(data.boats);

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

$(document).ready(function () {

    $(function () {

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
                
                fetchedBoats();
            }
        });
    });

})

function renderBoats(boats) {
    const boatContainer = $('#boat-listings');
    console.log('abdullah', boats.thumbnail_image);

    const thumbnailImage = boats.thumbnail_image || '';
    const boatTitle = boats.title || '';
    const boat_price = boats.price || 'Call for Price';

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

    brandFilter(brands);
    modelFilter(models);
    lengthFilter(minLength, maxLength);

}

function brandFilter(availableBrands) {

    console.log('available brands', availableBrands);

    const brandContainer = document.querySelector('#brand-list');

    const availableBrandsHTML = availableBrands.map((brand)=>{

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

    const availableModelsHTML = availableModels.map((model)=>{
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