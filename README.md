# electron-atm

![Travis CI build badge](https://travis-ci.org/timgabets/electron-atm.svg?branch=master)

A simple free open-source [APTRA™ Advance NDC](https://www.ncr.com/financial-services/banking-atm-software/aptra-advance-ndc) ATM emulator, written from scratch using JavaScript, jQuery and Electron framework.

![screenshot](img/screenshot.png)

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From the command line:

```bash
# Clone this repository
git clone https://github.com/timgabets/electron-atm
# Go into the repository
cd electron-atm
# Install dependencies
npm install
# Check the test cases
npm test
# Run the app
npm start
```

## Reasons of why this application was developed

Some reasons for the appearance of this application are described [here](http://gabets.ru/electron-atm).

## Features 

This is a side project of my full-time job and only the features that I currently need in my everyday work are implemented. 

Currently only the basic stuff is working, such as:

 * Connecting to ATM host
 * Moving through the basic states (A, B, D, X, W etc.)
 * Showing basic image screens, linked to the state
 * Checking the Card's financial institution based on FIT tables
 * Keyboard shortcuts (FDK and numeric)
 * Receiving states from host
 * Receiving screens from host
 * Receiving FITs (financial insitution tables) from host
 * Showing traces in a log area
 * Saving ATM configuration data (such as states, screens and FITs) and restoring it on application start

Things to be implemented (very) soon:
 * Esc, Enter, Backspace shortcuts support
 * Showing text upon the image screen
 * Saving the image path in user settings
 * Crypto support (PIN block encryption and key exchange)
 * ICC support
 * States structure visualisation tool (probably using [visjs](http://visjs.org/))

## Issues

Please feel free to submit issues and enhancement requests.

## Contribute

Contributions welcome!

## License
[LGPLv2](LICENSE.md)
