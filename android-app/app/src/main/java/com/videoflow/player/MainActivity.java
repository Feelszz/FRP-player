package com.videoflow.player;

import android.app.Activity;
import android.os.Bundle;
import android.content.ActivityNotFoundException;
import android.content.pm.ActivityInfo;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        webView = new WebView(this);
        webView.setBackgroundColor(0xFF151116);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // A interface é carregada de file:// e precisa consultar as APIs HTTPS do FPR.
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.addJavascriptInterface(new DeviceBridge(), "FPRDevice");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript("window.fprHandleBack ? window.fprHandleBack() : false", value -> {
            if ("false".equals(value) || "null".equals(value)) super.onBackPressed();
        });
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
            if (url == null || url.trim().isEmpty()) return false;
            Uri mediaUri = Uri.parse(url.trim());
            String scheme = mediaUri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) return false;
            String path = mediaUri.getPath() == null ? "" : mediaUri.getPath().toLowerCase(java.util.Locale.ROOT);
            String mime = path.endsWith(".m3u8") ? "application/vnd.apple.mpegurl"
                    : path.endsWith(".ts") ? "video/mp2t" : "video/*";
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(mediaUri, mime);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                if (intent.resolveActivity(getPackageManager()) != null) {
                    startActivity(intent);
                    return true;
                }
                Intent generic = new Intent(Intent.ACTION_VIEW);
                generic.setDataAndType(mediaUri, "video/*");
                generic.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                if (generic.resolveActivity(getPackageManager()) != null) {
                    startActivity(generic);
                    return true;
                }
            } catch (ActivityNotFoundException error) {
                // O WebView continua sendo a alternativa quando não há player instalado.
            }
            return false;
        }
    }
}
