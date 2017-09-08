# electron-atm

![Travis CI build badge](https://travis-ci.org/timgabets/electron-atm.svg?branch=master)

A simple free open-source [APTRA™ Advance NDC](https://www.ncr.com/financial-services/banking-atm-software/aptra-advance-ndc) ATM emulator, written from scratch using JavaScript, jQuery and Electron framework.

![screenshot](img/screenshot.png)

![states navigator](img/states.png)

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
 * Moving through almost all the basic states (ICC states are passed through as well)
 * Showing basic image screens, linked to the state
 * Checking the Card's financial institution based on FIT tables
 * Keyboard shortcuts: FDK (A-I), numeric(0-9), Esc, Enter and Backspace
 * Receiving states from host
 * Receiving screens from host
 * Receiving FITs (financial insitution tables) from host
 * Showing traces in a log area
 * Saving ATM configuration data (such as states, screens and FITs) and restoring it on application start
 * Crypto support: PIN block encryption, dynamic key exchange etc. (Triple DES double length key only)
 * State Navigator: updating screen image when jumping through the states
 * State Navigator: displaying state details when state sleected

Things to be implemented (very) soon:
 * Showing text upon the image screen
 * Saving the image path in user settings
 * ICC support

## Issues

Please feel free to submit issues and enhancement requests, or just drop me an [email](mailto:tim@gabets.ru) if you want to participate in the project or just give some feedback.

## Contribute

Contributions welcome!

## License
[LGPLv2](LICENSE.md)
