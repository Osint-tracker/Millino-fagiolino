import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
if (Capacitor.isNativePlatform())
  window.MireesNative = {
    App,
    CapacitorHttp,
    LocalNotifications,
    Filesystem,
    Share,
  };
