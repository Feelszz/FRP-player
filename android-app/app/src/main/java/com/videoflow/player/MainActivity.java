package com.videoflow.player;

import android.app.Activity;
import android.os.Bundle;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        WebView webView = new WebView(this);
        webView.setBackgroundColor(0xFF151116);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.addJavascriptInterface(new DeviceBridge(), "FPRDevice");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    private final class DeviceBridge {
        @JavascriptInterface
        public String getDeviceId() {
            String androidId = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
            if (androidId == null || androidId.isBlank()) androidId = "indisponivel";
            return "FPR-" + androidId.toUpperCase(java.util.Locale.ROOT);
        }

        @JavascriptInterface
        public boolean openNativePlayer(String url) {
            Uri mediaUri = Uri.parse(url == null ? "" : url);
            String scheme = mediaUri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) return false;
            String path = mediaUri.getPath() == null ? "" : mediaUri.getPath().toLowerCase(java.util.Locale.ROOT);
            String mime = path.endsWith(".m3u8") ? "application/vnd.apple.mpegurl"
                    : path.endsWith(".ts") ? "video/mp2t" : "video/*";
            Intent intent = new Intent(Intent.ACTION_VIEW, mediaUri);
            intent.setDataAndType(mediaUri, mime);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            try {
                startActivity(intent);
                return true;
            } catch (ActivityNotFoundException error) {
                return false;
            }
        }
    }
}
