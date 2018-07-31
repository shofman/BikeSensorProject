package com.bikeproject;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.widget.Toast;
import android.content.DialogInterface.OnClickListener;

import com.dsi.ant.plugins.antplus.pcc.AntPlusBikeCadencePcc;
import com.dsi.ant.plugins.antplus.pcc.AntPlusBikeSpeedDistancePcc;
import com.dsi.ant.plugins.antplus.pcc.defines.BatteryStatus;
import com.dsi.ant.plugins.antplus.pcc.defines.DeviceState;
import com.dsi.ant.plugins.antplus.pcc.defines.EventFlag;
import com.dsi.ant.plugins.antplus.pcc.defines.RequestAccessResult;
import com.dsi.ant.plugins.antplus.pccbase.AntPluginPcc;
import com.dsi.ant.plugins.antplus.pccbase.AntPlusBikeSpdCadCommonPcc;
import com.dsi.ant.plugins.antplus.pccbase.AntPlusLegacyCommonPcc;
import com.dsi.ant.plugins.antplus.pccbase.PccReleaseHandle;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.math.BigDecimal;
import java.util.EnumSet;

public class CadenceHandler {
    AntPlusBikeCadencePcc bcPcc = null;
    PccReleaseHandle<AntPlusBikeCadencePcc> bcReleaseHandle = null;
    AntPlusBikeSpeedDistancePcc bsPcc = null;
    PccReleaseHandle<AntPlusBikeSpeedDistancePcc> bsReleaseHandle = null;
    Handler mHandler;
    Activity mActivity;
    ReactContext mReactContext;

    AntPluginPcc.IPluginAccessResultReceiver<AntPlusBikeCadencePcc> mResultReceiver = new AntPluginPcc.IPluginAccessResultReceiver<AntPlusBikeCadencePcc>()
    {
        // Handle the result, connecting to events on success or reporting
        // failure to user.
        @Override
        public void onResultReceived(AntPlusBikeCadencePcc result, RequestAccessResult resultCode, DeviceState initialDeviceState) {
            switch (resultCode) {
                case SUCCESS:
                    bcPcc = result;
                    subscribeToEvents();
                    break;
                case CHANNEL_NOT_AVAILABLE:
                    sendToast("Channel Not Available", Toast.LENGTH_LONG);
                    break;
                case ADAPTER_NOT_DETECTED:
                    sendToast("ANT Adapter Not Available. Built-in ANT hardware or external adapter required.", Toast.LENGTH_SHORT);
                    break;
                case BAD_PARAMS:
                    sendToast("Bad request parameters.", Toast.LENGTH_SHORT);
                    // Note: Since we compose all the params ourself, we should
                    // never see this result
                    break;
                case OTHER_FAILURE:
                    sendToast("RequestAccess failed. See logcat for details.", Toast.LENGTH_SHORT);
                    break;
                case DEPENDENCY_NOT_INSTALLED:
                    sendToast("Dependency not installed", Toast.LENGTH_SHORT);
                    AlertDialog.Builder adlgBldr = new AlertDialog.Builder(mActivity);
                    adlgBldr.setTitle("Missing Dependency");
                    adlgBldr.setMessage("The required service\n\""
                        + AntPlusBikeCadencePcc.getMissingDependencyName()
                        + "\"\n was not found. You need to install the ANT+ Plugins service or"
                        + " you may need to update your existing version if you already have "
                        + "it. Do you want to launch the Play Store to get it?");
                    adlgBldr.setCancelable(true);
                    adlgBldr.setPositiveButton("Go to Store", new OnClickListener()
                    {
                        @Override
                        public void onClick(DialogInterface dialog, int which)
                        {
                            Intent startStore = null;
                            Uri storeUri = Uri.parse("market://details?id="
                                            + AntPlusBikeCadencePcc
                                            .getMissingDependencyPackageName());
                            startStore = new Intent(Intent.ACTION_VIEW, storeUri);
                            startStore.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                            mActivity.getApplicationContext().startActivity(startStore);
                        }
                    });
                    adlgBldr.setNegativeButton("Cancel", new OnClickListener()
                    {
                        @Override
                        public void onClick(DialogInterface dialog, int which)
                        {
                            dialog.dismiss();
                        }
                    });

                    final AlertDialog waitDialog = adlgBldr.create();
                    waitDialog.show();
                    break;
                case USER_CANCELLED:
                    sendToast("Cancelled. Please try again", Toast.LENGTH_SHORT);
                    break;
                case UNRECOGNIZED:
                    sendToast("Failed: UNRECOGNIZED. PluginLib Upgrade Required?", Toast.LENGTH_SHORT);
                    break;
                default:
                    sendToast("Unrecognized result: " + resultCode, Toast.LENGTH_SHORT);
                    break;
            }
        }

        /**
         * Subscribe to all the heart rate events, connecting them to display
         * their data.
         */
        private void subscribeToEvents()
        {
            bcPcc.subscribeCalculatedCadenceEvent(new AntPlusBikeCadencePcc.ICalculatedCadenceReceiver() {
                @Override
                public void onNewCalculatedCadence(final long estTimestamp, final EnumSet<EventFlag> eventFlags, final BigDecimal calculatedCadence) {
                    WritableMap params = new WritableNativeMap();
                    params.putString("estTimestamp", String.valueOf(estTimestamp));
                    params.putString("calculatedCadence", String.valueOf(calculatedCadence));
                    sendEvent("calculatedCadenceEvent", params);
                }
            });

            bcPcc.subscribeRawCadenceDataEvent(new AntPlusBikeCadencePcc.IRawCadenceDataReceiver() {
                @Override
                public void onNewRawCadenceData(final long estTimestamp, final EnumSet<EventFlag> eventFlags, final BigDecimal timestampOfLastEvent, final long cumulativeRevolutions) {
                    WritableMap params = new WritableNativeMap();
                    params.putString("estTimestamp", String.valueOf(estTimestamp));
                    params.putString("lastTimestamp", String.valueOf(timestampOfLastEvent));
                    params.putString("cumulativeRevolutions", String.valueOf(cumulativeRevolutions));
                    sendEvent("rawCadenceEvent", params);
                }
            });

            if (bcPcc.isSpeedAndCadenceCombinedSensor()) {
                bsReleaseHandle = AntPlusBikeSpeedDistancePcc.requestAccess(
                mActivity, bcPcc.getAntDeviceNumber(), 0, true,
                new AntPluginPcc.IPluginAccessResultReceiver<AntPlusBikeSpeedDistancePcc>()
                {
                    // Handle the result, connecting to events
                    // on success or reporting failure to user.
                    @Override
                    public void onResultReceived(AntPlusBikeSpeedDistancePcc result, RequestAccessResult resultCode, DeviceState initialDeviceStateCode) {
                        switch (resultCode) {
                            case SUCCESS:
                                bsPcc = result;
                                bsPcc.subscribeCalculatedSpeedEvent(
                                    new AntPlusBikeSpeedDistancePcc.CalculatedSpeedReceiver(new BigDecimal(2.095)) {
                                        @Override
                                        public void onNewCalculatedSpeed(long estTimestamp, EnumSet<EventFlag> eventFlags, final BigDecimal calculatedSpeed) {
                                            WritableMap params = new WritableNativeMap();
                                            params.putString("estTimestamp", String.valueOf(estTimestamp));
                                            params.putString("calculatedSpeed", String.valueOf(calculatedSpeed));
                                            sendEvent("calculatedSpeedEvent", params);
                                        }
                                    });
                                break;
                            case CHANNEL_NOT_AVAILABLE:
                                sendToast("Channel not available", Toast.LENGTH_SHORT);
                                break;
                            case BAD_PARAMS:
                                sendToast("Bad params", Toast.LENGTH_SHORT);
                                break;
                            case OTHER_FAILURE:
                                sendToast("Other failure", Toast.LENGTH_SHORT);
                                break;
                            case DEPENDENCY_NOT_INSTALLED:
                                sendToast("Dependency not installed", Toast.LENGTH_SHORT);
                                break;
                            default:
                                sendToast("Unrecognized Error", Toast.LENGTH_SHORT);
                                break;
                        }
                    }
                },
                // Receives state changes and shows it on the
                // status display line
                new AntPluginPcc.IDeviceStateChangeReceiver() {
                    @Override
                    public void onDeviceStateChange(final DeviceState newDeviceState) {
                        if (newDeviceState == DeviceState.DEAD) {
                            bsPcc = null;
                        }
                    }
                });
            } else {
                bcPcc.subscribeCumulativeOperatingTimeEvent(new AntPlusLegacyCommonPcc.ICumulativeOperatingTimeReceiver() {
                    @Override
                    public void onNewCumulativeOperatingTime(final long estTimestamp, final EnumSet<EventFlag> eventFlags, final long cumulativeOperatingTime) {
                        WritableMap params = new WritableNativeMap();
                        params.putString("estTimestamp", String.valueOf(estTimestamp));
                        params.putString("cumulativeOperatingTime", String.valueOf(cumulativeOperatingTime));
                        sendEvent("operatingTimeEvent", params);
                    }
                });

                bcPcc.subscribeManufacturerAndSerialEvent(new AntPlusLegacyCommonPcc.IManufacturerAndSerialReceiver() {
                    @Override
                    public void onNewManufacturerAndSerial(final long estTimestamp, final EnumSet<EventFlag> eventFlags, final int manufacturerID, final int serialNumber) {
                        WritableMap params = new WritableNativeMap();
                        params.putString("estTimestamp", String.valueOf(estTimestamp));
                        params.putString("manufacturerID", String.valueOf(manufacturerID));
                        params.putString("serialNumber", String.valueOf(serialNumber));
                        sendEvent("manufacturerEvent", params);
                    }
                });

                bcPcc.subscribeVersionAndModelEvent(new AntPlusLegacyCommonPcc.IVersionAndModelReceiver() {
                    @Override
                    public void onNewVersionAndModel(final long estTimestamp, final EnumSet<EventFlag> eventFlags, final int hardwareVersion, final int softwareVersion, final int modelNumber) {
                        WritableMap params = new WritableNativeMap();
                        params.putString("estTimestamp", String.valueOf(estTimestamp));
                        params.putString("hardwareVersion", String.valueOf(hardwareVersion));
                        params.putString("softwareVersion", String.valueOf(softwareVersion));
                        params.putString("modelNumber", String.valueOf(modelNumber));
                        sendEvent("modelDetailsEvent", params);
                    }
                });

                bcPcc.subscribeBatteryStatusEvent(new AntPlusBikeSpdCadCommonPcc.IBatteryStatusReceiver() {
                    @Override
                    public void onNewBatteryStatus(final long estTimestamp, EnumSet<EventFlag> eventFlags, final BigDecimal batteryVoltage, final BatteryStatus batteryStatus) {
                        WritableMap params = new WritableNativeMap();
                        params.putString("estTimestamp", String.valueOf(estTimestamp));
                        params.putString("batteryVoltage", batteryVoltage.intValue() != -1 ? String.valueOf(batteryVoltage) + "V" : "Invalid");
                        params.putString("batteryStatus", batteryStatus.toString());
                        sendEvent("batteryStatusEvent", params);
                    }
                });

                bcPcc.subscribeMotionAndCadenceDataEvent(new AntPlusBikeCadencePcc.IMotionAndCadenceDataReceiver() {
                    @Override
                    public void onNewMotionAndCadenceData(final long estTimestamp, EnumSet<EventFlag> eventFlags, final boolean isPedallingStopped) {
                        WritableMap params = new WritableNativeMap();
                        params.putString("estTimestamp", String.valueOf(estTimestamp));
                        params.putBoolean("isPedallingStopped", isPedallingStopped);
                        sendEvent("pedalEvent", params);
                    }
                });
            }
        }
    };

    // Receives state changes and shows it on the status display line
    AntPluginPcc.IDeviceStateChangeReceiver mDeviceStateChangeReceiver = new AntPluginPcc.IDeviceStateChangeReceiver() {
        @Override
        public void onDeviceStateChange(final DeviceState newDeviceState) {
            if (newDeviceState == DeviceState.DEAD) {        
                bcPcc = null;
            }
        }
    };

    private void sendToast(final String text, final int length) {
        if (mHandler != null) {
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    if (mActivity != null) {
                        Toast.makeText(mActivity.getApplicationContext(), text, length).show();
                    }
                }
            });
        }
    }

    public CadenceHandler(Activity mActivity, ReactContext reactContext) {
        this.mActivity = mActivity;
        this.mHandler = new Handler();
        this.mReactContext = reactContext;
    }

    public void requestAccess() {
        bcReleaseHandle = AntPlusBikeCadencePcc.requestAccess(this.mActivity, this.mReactContext, mResultReceiver, mDeviceStateChangeReceiver);
        WritableMap params = new WritableNativeMap();
        params.putBoolean("finished", true);
        sendEvent("loadingFinishedEvent", params);
    }

    private void sendEvent(String eventName, WritableMap params) {
        this.mReactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }


    public void tearDown() {
        if(bcReleaseHandle != null) {
            bcReleaseHandle.close();
        }
        if(bsReleaseHandle != null) {
            bsReleaseHandle.close();
        }
    }
}
