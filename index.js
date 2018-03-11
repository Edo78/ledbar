'use strict';

let rpio = require('rpio');
let adc0832 = require('adc0832');

// The pins connected to the led bar from the first to the last one
const LED_PINS = [
    11,
    13,
    15,
    29,
    31,
    33,
    35,
    37,
    12,
    16
];
const LED_ON = rpio.LOW;
const LED_OFF = rpio.HIGH;

let oldVal = false;
let val = false;

/**
 * Map the input (0 - 255) to a number (0 - 10) to be rendered on the led bar
 *
 * @name mapInputToLedbar
 * @function
 * @param {number} input - The potentiometer value interpreted by the ADC0832. It must be in the 0-255 range
 * @returns {number} The number of leds to turn on in the led bar (0-10)
 */
function mapInputToLedbar(input) {
    return Math.round(input * 10 / 255);
}

/**
 * Turns on the specific number of sequential leds on the led bar
 *
 * @name setLedbar
 * @function
 * @param {number} leds - The number of leds to turn on (0-10)
 */
function setLedbar(leds) {
    for(var i = 0; i < LED_PINS.length; i++){
        if(i < leds){
            rpio.write(LED_PINS[i], LED_ON);
        }else{
            rpio.write(LED_PINS[i], LED_OFF);
        }
    }
}

/**
 * Initialize the module for the ADC0832 and the pins for the led bar
 *
 * @name init
 * @function
 */
function init() {
    adc0832.init(19, 26, 24);
    for(var i = 0; i < LED_PINS.length; i++){
        rpio.open(LED_PINS[i], rpio.OUTPUT, LED_OFF);
    }
}

// Trap CTRL-C turning off all the leds and closing the pins
process.on('SIGINT', function() {
    console.log("Exiting...");
    for(var i = 0; i < LED_PINS.length; i++){
        // turn off the led
        rpio.write(LED_PINS[i], LED_OFF);
        // close the pin
        rpio.close(LED_PINS[i]);
    }
    process.exit();
});

/**
 * Initialize the circuit and set an interval to check the input and set the led bar every 10 milliseconds
 *
 * @name main
 * @function
 */
function main() {
    init();

    setInterval(function() {
        val = adc0832.getValue();
        if(val !== oldVal){
            oldVal = val;
            let map = mapInputToLedbar(val);
            console.log("Value: " + val + " Map: "+ map);
            setLedbar(map);
        }
    }, 10);
}

main();
