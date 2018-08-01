# Setup Instructions
1) Attach speed and cadence devices to the exercise bike
2) Plug in Raspberry Pi to Router
3) Plug in Raspberry Pi to TV
4) Plug in Raspberry Pi to Power
5) Wait for five minutes for server to boot
6) Determine port
    * View router admin page (something like http://192.168.0.1/)
    * Find Network page that displays connected devices
    * Find the element that says raspberrypi and record the IP address (e.g. 192.168.0.9)
7) Install the device
    * If not already done:
    * Enable developer mode - https://developer.android.com/studio/debug/dev-options#enable
    * Enable apk (app installation) from untrusted sources - https://www.applivery.com/docs/troubleshooting/android-unknown-sources
    * Contact Scott for the latest apk
    * (Test installation and record steps here)


# Running Instructions
1) Start app
2) Determine which type of sensor you wish to connect to (speed or cadence)
    * Speed is the one with the rubber bit around it
3) Determine the baseline value (RPM or Speed) by pressing the white box
    * This represents the minimum requirement by the bike sensors to keep the TV on
4) Choose the delay time by pressing the white box 
     * This represents the number of seconds that pass before the app considers turning off the TV
5) Set the IP Address of your device
    * Should only have to be done once
6) Press start - if everything is working, a loading screen, followed by a black screen or dialogue should appear
7) Search for devices
    * If this is your first time, a spinner will appear. Start pedalling (or shaking the devices) to activate them. Removing and reinserting the battery also works. The device should appear as a list. If not, a prompt asking you to searcha gain will appear.
    * If prompted to save, give it a name and press save. The device will be automatically selected in the future if available
    * If having difficulties finding a device, try pedalling a bit before pressing start. 
    * Hitting the back button will allow you to cancel. If nothing seems to work, try restarting the app (see troubleshooting)
    * If this is your second time, and you've saved the device, a loading dialogue will appear, saying that it is searching for selected device. If found, it will immediately start the app
8) Exercise
    * Pedal - the garmin sensors will pass the data to your phone, which sends it along to the server
     * The app will display 
        - the results from the calculated speed/cadence from the sensors
        - whether the TV should be on or not
        - whether we are still connected to the server
    * If the server does not receive the required data, the TV will be deactivated
9) Finishing up
    - Once completed, press the back button. This will reset the app correctly and start shutting down the cadence devices
    - To ensure that the connection is completely cleared, please close the app

# Troubleshooting
1) Garmin devices won't connect? 
    * Close the app entirely (press 'menu' button and then 'close all' button)
    * Remove battery with app closed, and reattach battery after a few seconds
    * Validate that the batteries are still working (removing battery and shaking the device should cause it to occasionally blink)
    * Uninstall and reinstall app from APK

2) Can't connect to raspberry pi server?
    * Disconnect device and reconnect device. Wait five minutes for bootup and try again
    * Turn router on and off again
    * Validate that the IP address of the device has not changed (see Setup Instructions)
    * Setup internet facing access for Raspberry Pi (https://lifehacker.com/how-to-control-a-raspberry-pi-remotely-from-anywhere-in-1792892937) and contact Scott or try to debug via ssh and running the server locally from a computer ssh pi@192.168.0.9 (or whatever the local IP of the server is)

# Material List
* TV
* Exercise Bike
* Garmin Speed Sensors - https://buy.garmin.com/en-US/US/p/146897
* Raspberry Pi Model 2 - http://cpc.farnell.com/raspberry-pi/rpi2-modb-v1-2/sbc-raspberry-pi-2-model-b-v1/dp/SC14210?src=raspberrypi
* SD Card - Needs Raspberry Pi installation
* Ethernet Cable - Connecting from Raspberry Pi to Router
* HDMI Cable - Connecting from Raspberry Pi to TV
* Android Device - See list below for Ant Plus Compatible Devices

Needed for Apple - if iPhone wanted (may be a lot of troubleshooting)
* https://buy.garmin.com/en-US/US/p/103887 or https://au.wahoofitness.com/devices/accessories/wahoo-key-16 
* https://www.apple.com/au/shop/product/MD823AM/A/lightning-to-30-pin-adapter

## Android Devices with Ant+
* Galaxy S9 (USA) - Samsung Electronics
* Galaxy S9 (Europe) - Samsung Electronics
* Galaxy Tab A - Samsung Electronics
* Galaxy A8 (2018) - Samsung Electronics
* Nokia 8 Sirocco - NOKIA
* Arrows NX - Fujitsu
* Galaxy Note8 Open - Samsung Electronics
* Nokia 8 - NOKIA
* Galaxy J7 (2017) - Samsung Electronics
* Galaxy S8 - Samsung Electronics
* Galaxy Tab S3 (LTE) - Samsung Electronics
* Arrows NX F-01J - Fujitsu
* Galaxy A3 (2017) - Samsung Electronics
* Galaxy On7 (2016) - Samsung Electronics
* Galaxy Note7 (Grace EUR) - Samsung Electronics
* Galaxy Note7 - Verizon - Samsung Electronics
* Arrows NX F-02H - Fujitsu
* Arrows Tab F-04H - Fujitsu
* Galaxy Tab A 2016 - Samsung Electronics
* Galaxy C - Samsung Electronics
* Galaxy TAB 4 Advanced - Samsung Electronics
* Galaxy TAB-S2 9.7 - Samsung Electronics
* Galaxy J7 2016 (CMCC) - Samsung Electronics
* Galaxy J7 2016 (CTC) - Samsung Electronics
* Galaxy S7 edge - Samsung Electronics
* Galaxy S7 - Samsung Electronics
* Galaxy J5x - Samsung Electronics
* Galaxy A3 (2016) - Samsung Electronics
* Galaxy A9 (2016) - Samsung Electronics
* Galaxy A5 (2016) - Samsung Electronics
* Galaxy A7 (2016) - Samsung Electronics
* GALAXY View - Samsung Electronics
* W2016 - Samsung Electronics
* Galaxy J7x - Samsung Electronics
* GALAXY S5 Neo - Samsung Electronics
* Xperia Z5 / Z5 Dual - Sony Mobile
* Xperia Z5 Premium/ Premium Dual - Sony Mobile
* Xperia Z5 Compact - Sony Mobile
* GALAXY S6 Edge + - Samsung Electronics
* G9198 / Collar World Flagship III - Samsung Electronics
* GALAXY Note 5 - Samsung Electronics
* GALAXY Tab A-S LTE - Samsung Electronics
* GALAXY Tab S2 - Samsung Electronics
* GALAXY J5 - Samsung Electronics
* GALAXY A8 - Samsung Electronics
* GALAXY Tab A - Samsung Electronics
* GALAXY J7 - Samsung Electronics
* Fujitsu Arrows NX F-04G - NTT docomo
* Xperia M4 Aqua/ M4 Aqua Dual - Sony Mobile
* Xperia Z4 Tablet - Sony Mobile
* Xperia Z3+ - Sony Mobile
* GALAXY S6/ S6 edge - Samsung Electronics
* GALAXY Tab Active - Samsung Electronics
* GALAXY Grand 3 Duos - Samsung Electronics
* GALAXY E5 - Samsung Electronics
* GALAXY E7 - Samsung Electronics
* GALAXY A7 - Samsung Electronics
* GALAXY Grand Max - Samsung Electronics
* Aquos Zeta SH-04F - Sharp
* GALAXY Golden 2 双网/双待W2015 - Samsung Electronics
* GALAXY Grand Prime - Samsung Electronics
* GALAXY A3 - Samsung Electronics
* GALAXY A5 - Samsung Electronics
* HTC Desire EYE - HTC
* GALAXY Mega2 - Samsung Electronics
* GALAXY CORE Prime - Samsung Electronics
* Fujitsu Arrows NX F-02G - NTT docomo
* GALAXY CORE Max - Samsung Electronics
* GALAXY Note 4 - Samsung Electronics
* GALAXY Tab4 7.0 - Samsung Electronics
* Xperia Z3 Dual - Sony Mobile
* Xperia E3 - Sony Mobile
* Xperia Z3 Compact - Sony Mobile
* Xperia Z3 Tablet Compact - Sony Mobile
* Xperia Z3 - Sony Mobile
* Xperia E3 Dual - Sony Mobile
* GALAXY Avant - Samsung Electronics
* GALAXY Alpha - Samsung Electronics
* Xperia M2 Aqua - Sony Mobile
* GALAXY TabQ - Samsung Electronics
* Xperia C3 Dual - Sony Mobile
* Xperia C3 - Sony Mobile
* GALAXY Tab S 10.5-inch - Samsung Electronics
* GALAXY Tab S 8.4-inch - Samsung Electronics
* Xperia T3 - Sony Mobile
* GALAXY Tab4 8.0 - Samsung Electronics
* GALAXY Tab4 10.1 - Samsung Electronics
* GALAXY S5 SPORT - Samsung Electronics
* GALAXY S5 ACTIVE - Samsung Electronics
* GALAXY S5 광대역LTE-A - Samsung Electronics
* GALAXY W - Samsung Electronics
* 双卡双待 G9098 - Samsung Electronics
* 三星大器Ⅲ G9092 - Samsung Electronics
* GALAXY Note 3 Lite - Samsung Electronics
* GALAXY TabPRO 12.2 - Samsung Electronics
* Xperia T2 Ultra - Sony Mobile
* GALAXY Note 3 Neo - Samsung Electronics
* GALAXY TabPRO 8.4 - Samsung Electronics
* GALAXY TabPRO 10.1 - Samsung Electronics
* GALAXY NotePRO 12.2 - Samsung Electronics
* GALAXY S5 - Samsung Electronics
* Xperia Z2 Tablet - Sony Mobile
* Xperia M2 - Sony Mobile
* Xperia Z2 - Sony Mobile
* Xperia Z1 S - Sony Mobile
* GALAXY Grand 2 (LTE) - Samsung Electronics
* Xperia Z1 Compact - Sony Mobile
* GALAXY J - Samsung Electronics
* GALAXY Note 10.1 (2014 Edition) - Samsung Electronics
* GALAXY S4 (Android 4.3 and up) - Samsung Electronics
* GALAXY Note 3 - Samsung Electronics
* Xperia Z1 - Sony Mobile
* Xperia Z Ultra - Sony Mobile
* Xperia SL - Sony Mobile
* Xperia acro S - Sony Mobile
* Xperia X8 - Sony Mobile
* Xperia x10 mini pro - Sony Mobile
* Xperia S - Sony Mobile
* Xperia x10 mini - Sony Mobile
* Xperia ray - Sony Mobile
* Xperia pro - Sony Mobile
* Xperia neo V - Sony Mobile
* Xperia neo - Sony Mobile
* Xperia mini pro - Sony Mobile
* Xperia mini - Sony Mobile
* Xperia ion LTE - Sony Mobile
* Xperia ion HSPA - Sony Mobile
* Xperia arc S - Sony Mobile
* Xperia arc - Sony Mobile
* Live with Walkman - Sony Mobile
* HTC Rhyme - HTC
* Xperia active - Sony Mobile
