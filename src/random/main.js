const startInput = $('#start');
const endInput = $('#end');

const rangeOutput = $('#range-output');
const diceOutput = $('#dice-output');
const coinOutput = $('#coin-output');

function outputRandomNumber() {
    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);

    if (isNaN(start) || isNaN(end)) {
        rangeOutput.innerText = 'Ungültige Eingabe';
        return
    }

    const result = getNumberFromRange(start, end);
    rangeOutput.innerText = result;
}

function outputDiceRoll() {
    diceOutput.innerText = getNumberFromRange(1, 6);
}

function ouputCoinThrow() {
    coinOutput.innerText = Math.random() > 0.5 ? 'Kopf' : 'Zahl';
}

/**
 * Get a whole number from given range defined by min and max.
 * @param {number} min - Start of the range
 * @param {number} max - End of the range
 * @returns {number}
 */
function getNumberFromRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
