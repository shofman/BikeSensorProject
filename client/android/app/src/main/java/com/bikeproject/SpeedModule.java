package com.bikeproject;

import java.math.BigDecimal;
import java.util.Timer;
import java.util.Date;
import java.util.TimerTask;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SpeedModule extends ReactContextBaseJavaModule {

    Timer speedTimer;
    boolean isSlowing = false;
    ReactApplicationContext myContext;
    float currentSpeed = 4.0f;

    public SpeedModule(ReactApplicationContext reactContext) {
        super(reactContext);
        myContext = reactContext;
    }

    @Override
    public String getName() {
        return "SpeedExample";
    }

    @ReactMethod
    public void setSlowdown() {
        isSlowing = true;
    }

    @ReactMethod
    public void cancelSlowdown() {
        isSlowing = false;
    }

    @ReactMethod
    public void setupTimer() {
        speedTimer = new Timer();

        speedTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (isSlowing) {
                    currentSpeed -= .5f;
                    if (currentSpeed <= 4.0f) {
                        currentSpeed = 4.0f;
                    }
                } else {
                    currentSpeed += .5f;
                    if (currentSpeed >= 12.0f) {
                        currentSpeed = 12.0f;
                    }
                }

                BigDecimal max = new BigDecimal("70.0");
                BigDecimal randFromDouble = new BigDecimal(Math.random());
                BigDecimal actualRandomDec = randFromDouble.divide(max,BigDecimal.ROUND_DOWN);
                WritableMap params = new WritableNativeMap();
//                float result = actualRandomDec.floatValue() * 1000
                params.putDouble("speed", currentSpeed);
                sendEvent(myContext,"speedEvent", params);
            }
        }, new Date(), 500);
    }

    @ReactMethod
    public void stopTimer() {
        if (speedTimer != null) {
            speedTimer.cancel();
            speedTimer = null;
        }
    }

    @ReactMethod
    public void startAndroid() {
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, Activity_BikeCadenceSampler.class);
        context.startActivity(intent);
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
