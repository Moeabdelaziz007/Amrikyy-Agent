// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MayaTravelAgent",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "MayaTravelAgent",
            targets: ["MayaTravelAgent"])
    ],
    dependencies: [
        // Image caching
        .package(url: "https://github.com/SDWebImage/SDWebImageSwiftUI.git", .upToNextMajor(from: "2.0")),
        // Add your dependencies here
        // .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.0")),
    ],
    targets: [
        .target(
            name: "MayaTravelAgent",
            dependencies: [
                .product(name: "SDWebImageSwiftUI", package: "SDWebImageSwiftUI")
            ],
            path: ".",
            exclude: [
                "MayaTravelAgent.xcodeproj",
                "MayaTravelAgent.xcworkspace",
                "MayaTravelAgentTests",
                "MayaTravelAgentUITests"
            ]
        ),
        .testTarget(
            name: "MayaTravelAgentTests",
            dependencies: ["MayaTravelAgent"],
            path: "MayaTravelAgentTests"
        )
    ],
    swiftLanguageVersions: [.v5]
)