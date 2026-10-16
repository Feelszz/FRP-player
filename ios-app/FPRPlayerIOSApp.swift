import SwiftUI

@main
struct FPRPlayerIOSApp: App {
    var body: some Scene {
        WindowGroup {
            PlayerWebView()
                .ignoresSafeArea()
                .preferredColorScheme(.dark)
        }
    }
}
