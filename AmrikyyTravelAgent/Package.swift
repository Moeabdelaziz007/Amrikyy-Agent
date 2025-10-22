// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "AmrikyyTravelAgent",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "AmrikyyTravelAgent",
            targets: ["AmrikyyTravelAgent"])
    ],
    dependencies: [
        // Image caching
        .package(url: "https://github.com/SDWebImage/SDWebImageSwiftUI.git", .upToNextMajor(from: "2.0")),
        // Firebase SDK
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", .upToNextMajor(from: "10.0")),
        // Add your dependencies here
        // .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.0")),
    ],
    targets: [
        .target(
            name: "AmrikyyTravelAgent",
            dependencies: [
                .product(name: "SDWebImageSwiftUI", package: "SDWebImageSwiftUI"),
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseMessaging", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
                .product(name: "FirebaseCrashlytics", package: "firebase-ios-sdk")
            ],
            path: ".",
            exclude: [
                "AmrikyyTravelAgent.xcodeproj",
                "AmrikyyTravelAgent.xcworkspace",
                "AmrikyyTravelAgentTests",
                "AmrikyyTravelAgentUITests"
            ]
        ),
        .testTarget(
            name: "AmrikyyTravelAgentTests",
            dependencies: ["AmrikyyTravelAgent"],
            path: "AmrikyyTravelAgentTests"
        )
    ],
    swiftLanguageVersions: [.v5]
)