package com.bikeproject;

import java.math.BigDecimal;
import java.util.Timer;
import java.util.Date;
import java.util.TimerTask;

import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.dsi.ant.plugins.antplus.pcc.AntPlusBikeCadencePcc;
import com.dsi.ant.plugins.antplus.pcc.AntPlusBikeSpeedDistancePcc;
import com.dsi.ant.plugins.antplus.pccbase.PccReleaseHandle;

public class SpeedModule extends ReactContextBaseJavaModule {

    AntPlusBikeCadencePcc bcPcc = null;
    PccReleaseHandle<AntPlusBikeCadencePcc> bcReleaseHandle = null;
    AntPlusBikeSpeedDistancePcc bsPcc = null;
    PccReleaseHandle<AntPlusBikeSpeedDistancePcc> bsReleaseHandle = null;

    private Activity mActivity = null;
    private CadenceHandler mCadenceHandler = null;
    private SpeedHandler mSpeedHandler = null;

    Timer speedTimer;
    ReactApplicationContext myContext;
    float currentSpeed = 4.0f;

    public SpeedModule(ReactApplicationContext reactContext) {
        super(reactContext);
        myContext = reactContext;
        mActivity = this.getCurrentActivity();
    }

    @Override
    public String getName() {
        return "SpeedExample";
    }

    @ReactMethod
    public void startAndroid(Boolean useSpeed) {
        Activity currentActivity = getCurrentActivity();
        if (useSpeed) {
            mSpeedHandler = new SpeedHandler(currentActivity, myContext);
            mSpeedHandler.requestAccess();
        } else {
            mCadenceHandler = new CadenceHandler(currentActivity, myContext);
            mCadenceHandler.requestAccess();
        }
    }

    @ReactMethod
    public void stopAndroid() {
        if (mCadenceHandler != null) {
            mCadenceHandler.tearDown();
        }
        if (mSpeedHandler != null) {
            mSpeedHandler.tearDown();
        }
    }


    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
