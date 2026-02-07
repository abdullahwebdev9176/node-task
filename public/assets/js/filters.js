let checkedItemsValues = [];
let selectedBrands = [];
let selectedModels = [];
let selectedLengthRange = { min: 0, max: 100 };

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

    fetchedBoats()

    console.log(checkedItemsValues)
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
            renderBoats(data.boats);
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

        // Initialize selected length range
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
                
                // Update selected length range
                selectedLengthRange = {
                    min: ui.values[0],
                    max: ui.values[1]
                };
                
                // Trigger filtering
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