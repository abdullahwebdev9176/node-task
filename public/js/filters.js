function handleConditionClick(e) {
    // Kaun click hua
    const clicked = e.target.value;

    // All checkbox aur baaki items
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

    const checkedItemsValues = checkedItems.map((i) => {
        return i.value;
    })

    console.log(checkedItemsValues)
}

function handleBrandClick(e) {

    const brandItems = document.querySelectorAll('.brand-item');

    const brandArray = [...brandItems];

    const selectedBrands = brandArray
        .filter(item => item.checked)
        .map(item => item.value);

    console.log(selectedBrands)

}
